import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Download, 
  Search, 
  Filter, 
  Plus, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Edit2, 
  Trash2, 
  FileSpreadsheet, 
  Check, 
  X, 
  ShieldAlert, 
  ShieldCheck, 
  UserPlus, 
  RefreshCw,
  Mail,
  Phone,
  Building2,
  GraduationCap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Contact, ConsentStatus } from '../../types';
import { 
  parseSpreadsheetFile, 
  ParseFileResult, 
  convertCandidatesToContacts, 
  exportContactsToCSV, 
  ColumnMapping, 
  evaluateCandidates 
} from '../../utils/contactParser';

export const ContactsView: React.FC = () => {
  const { contacts, addContacts, updateContact, deleteContact, toggleContactConsent } = useApp();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('all');
  const [selectedConsent, setSelectedConsent] = useState<string>('all');
  const [selectedValidity, setSelectedValidity] = useState<string>('all');

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParseFileResult | null>(null);
  const [rawRowsCache, setRawRowsCache] = useState<Record<string, any>[]>([]);
  const [customMapping, setCustomMapping] = useState<ColumnMapping | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [skipInvalid, setSkipInvalid] = useState(true);
  const [defaultConsent, setDefaultConsent] = useState<ConsentStatus>('opted_in');

  // Manual Add / Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Partial<Contact> | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Colleges list for filter
  const uniqueColleges = Array.from(new Set(contacts.map(c => c.college))).filter(Boolean);

  // Filtered contacts
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.college.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCollege = selectedCollege === 'all' || contact.college === selectedCollege;
    const matchesConsent = selectedConsent === 'all' || contact.consentStatus === selectedConsent;
    const matchesValidity = selectedValidity === 'all' || 
      (selectedValidity === 'valid' && contact.isValid) ||
      (selectedValidity === 'invalid' && !contact.isValid);

    return matchesSearch && matchesCollege && matchesConsent && matchesValidity;
  });

  // Handle file select for import
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    try {
      const result = await parseSpreadsheetFile(file, contacts);
      setParsedResult(result);
      setCustomMapping(result.suggestedMapping);
      // store raw rows for mapping adjustments
      setRawRowsCache(result.candidates.map(c => c.rawRow));
      setIsImportModalOpen(true);
    } catch (err: any) {
      alert(`Error parsing spreadsheet: ${err.message || 'Please upload a valid .xlsx or .csv file.'}`);
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Re-evaluate mapping when user overrides a column
  const handleMappingChange = (field: keyof ColumnMapping, headerValue: string) => {
    if (!parsedResult || !customMapping) return;
    const newMapping = { ...customMapping, [field]: headerValue };
    setCustomMapping(newMapping);

    const reEvaluated = evaluateCandidates(
      parsedResult.fileName,
      parsedResult.headers,
      newMapping,
      rawRowsCache,
      contacts
    );
    setParsedResult(reEvaluated);
  };

  // Confirm import
  const handleConfirmImport = async () => {
    if (!parsedResult) return;

    const contactsToSave = convertCandidatesToContacts(
      parsedResult.candidates,
      parsedResult.fileName,
      defaultConsent,
      skipDuplicates,
      skipInvalid
    );

    if (contactsToSave.length === 0) {
      alert('No contacts met the import criteria. Please check duplicate or invalid options.');
      return;
    }

    await addContacts(contactsToSave);
    alert(`Successfully imported ${contactsToSave.length} contacts! Reminder: No messages have been sent.`);
    setIsImportModalOpen(false);
    setParsedResult(null);
  };

  // Save Edit / Manual Contact
  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact?.name || !editingContact.email || !editingContact.phone || !editingContact.college) {
      alert('Please fill out all required fields (Name, Email, Phone, College).');
      return;
    }

    if (editingContact.id) {
      // Update
      await updateContact(editingContact as Contact);
    } else {
      // New
      const newContact: Contact = {
        id: `cnt-${Date.now()}`,
        name: editingContact.name,
        email: editingContact.email,
        phone: editingContact.phone,
        college: editingContact.college,
        department: editingContact.department || '',
        graduationYear: editingContact.graduationYear || '',
        consentStatus: editingContact.consentStatus || 'opted_in',
        source: 'Manual Entry',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isValid: true,
      };
      await addContacts([newContact]);
    }

    setIsEditModalOpen(false);
    setEditingContact(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Student Contact Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {contacts.length} total contacts across {uniqueColleges.length} colleges
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx,.xls,.csv"
            className="hidden"
          />

          {/* Import Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isParsing}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>{isParsing ? 'Parsing...' : 'Import Excel / CSV'}</span>
          </button>

          {/* Export Button */}
          <button
            onClick={() => exportContactsToCSV(filteredContacts)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          {/* Add Manual Contact */}
          <button
            onClick={() => {
              setEditingContact({
                name: '',
                email: '',
                phone: '',
                college: '',
                department: '',
                graduationYear: '2026',
                consentStatus: 'opted_in',
              });
              setIsEditModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Single</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name, email, phone, or college..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* College Filter */}
          <select
            value={selectedCollege}
            onChange={(e) => setSelectedCollege(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-brand-500"
          >
            <option value="all">All Colleges ({uniqueColleges.length})</option>
            {uniqueColleges.map((c, i) => (
              <option key={i} value={c}>{c}</option>
            ))}
          </select>

          {/* Consent Status Filter */}
          <select
            value={selectedConsent}
            onChange={(e) => setSelectedConsent(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-brand-500"
          >
            <option value="all">All Consent</option>
            <option value="opted_in">Opted-in</option>
            <option value="opted_out">Opted-out (Unsubscribed)</option>
            <option value="pending">Pending</option>
          </select>

          {/* Validity Filter */}
          <select
            value={selectedValidity}
            onChange={(e) => setSelectedValidity(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-brand-500"
          >
            <option value="all">All Validation</option>
            <option value="valid">Valid only</option>
            <option value="invalid">Flagged / Invalid</option>
          </select>

          {(searchTerm || selectedCollege !== 'all' || selectedConsent !== 'all' || selectedValidity !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCollege('all');
                setSelectedConsent('all');
                setSelectedValidity('all');
              }}
              className="text-xs text-brand-600 hover:text-brand-800 font-medium px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone (WhatsApp)</th>
                <th className="py-3 px-4">College & Dept</th>
                <th className="py-3 px-4">Consent Status</th>
                <th className="py-3 px-4">Integrity</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No contacts found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Name */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {contact.name}
                      <span className="block text-[10px] text-slate-400 font-normal truncate max-w-[150px]">
                        {contact.source}
                      </span>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[200px]">{contact.email}</span>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-center gap-1.5 font-mono">
                        <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{contact.phone}</span>
                      </div>
                    </td>

                    {/* College & Dept */}
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="font-medium text-slate-800">{contact.college}</div>
                      <div className="text-[11px] text-slate-400">
                        {contact.department || 'General'} {contact.graduationYear ? `(${contact.graduationYear})` : ''}
                      </div>
                    </td>

                    {/* Consent status */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => {
                          const nextStatus: ConsentStatus = 
                            contact.consentStatus === 'opted_in' ? 'opted_out' : 'opted_in';
                          toggleContactConsent(contact.id, nextStatus);
                        }}
                        title="Click to toggle consent / unsubscribe"
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                          contact.consentStatus === 'opted_in'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : contact.consentStatus === 'opted_out'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {contact.consentStatus === 'opted_in' && <CheckCircle className="w-3 h-3 text-emerald-600" />}
                        {contact.consentStatus === 'opted_out' && <XCircle className="w-3 h-3 text-rose-600" />}
                        {contact.consentStatus === 'pending' && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                        <span className="capitalize">{contact.consentStatus.replace('_', ' ')}</span>
                      </button>
                    </td>

                    {/* Validity check */}
                    <td className="py-3.5 px-4">
                      {contact.isValid ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                          <Check className="w-3.5 h-3.5" /> Valid
                        </span>
                      ) : (
                        <span 
                          className="inline-flex items-center gap-1 text-[11px] text-rose-600 font-medium cursor-help"
                          title={contact.validationErrors?.join(', ')}
                        >
                          <AlertTriangle className="w-3.5 h-3.5" /> Flagged
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => {
                          setEditingContact(contact);
                          setIsEditModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Contact"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${contact.name} from directory?`)) {
                            deleteContact(contact.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Contact"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SPREADSHEET / CSV IMPORT PREVIEW MODAL */}
      {/* ========================================================================= */}
      {isImportModalOpen && parsedResult && customMapping && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Import Preview & Column Mapping: {parsedResult.fileName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Auto-identified columns. Review mappings and duplicate suppression before proceeding.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Compliance Safety Notice Banner */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Zero-Send Guarantee During Import</p>
                <p className="text-amber-800 mt-0.5">
                  Importing contacts only stores them in your directory. No email, SMS, or WhatsApp dispatch will ever occur automatically during file import.
                </p>
              </div>
            </div>

            {/* Summary Statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 uppercase font-medium">Total Rows</span>
                <p className="text-xl font-bold text-slate-900 mt-1">{parsedResult.totalRows}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[11px] text-emerald-700 uppercase font-medium">Valid Leads</span>
                <p className="text-xl font-bold text-emerald-700 mt-1">{parsedResult.validCount}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-[11px] text-amber-700 uppercase font-medium">Duplicates Flagged</span>
                <p className="text-xl font-bold text-amber-700 mt-1">{parsedResult.duplicateCount}</p>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                <span className="text-[11px] text-rose-700 uppercase font-medium">Invalid Details</span>
                <p className="text-xl font-bold text-rose-700 mt-1">{parsedResult.invalidCount}</p>
              </div>
            </div>

            {/* Column Mapping Selectors */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Confirm Column Mappings
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {/* Name */}
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Student Name *</label>
                  <select
                    value={customMapping.name}
                    onChange={(e) => handleMappingChange('name', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium"
                  >
                    <option value="">-- Select Header --</option>
                    {parsedResult.headers.map((h, i) => (
                      <option key={i} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Email Address *</label>
                  <select
                    value={customMapping.email}
                    onChange={(e) => handleMappingChange('email', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium"
                  >
                    <option value="">-- Select Header --</option>
                    {parsedResult.headers.map((h, i) => (
                      <option key={i} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Phone / WhatsApp *</label>
                  <select
                    value={customMapping.phone}
                    onChange={(e) => handleMappingChange('phone', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium"
                  >
                    <option value="">-- Select Header --</option>
                    {parsedResult.headers.map((h, i) => (
                      <option key={i} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                {/* College */}
                <div>
                  <label className="block text-slate-600 font-medium mb-1">College / Institute *</label>
                  <select
                    value={customMapping.college}
                    onChange={(e) => handleMappingChange('college', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium"
                  >
                    <option value="">-- Select Header --</option>
                    {parsedResult.headers.map((h, i) => (
                      <option key={i} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Preview of first 5 rows */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Candidate Sample Rows (First 5)
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs max-h-48 overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-[11px] text-slate-600 font-semibold sticky top-0">
                    <tr>
                      <th className="p-2.5">Row</th>
                      <th className="p-2.5">Name</th>
                      <th className="p-2.5">Email</th>
                      <th className="p-2.5">Phone</th>
                      <th className="p-2.5">College</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedResult.candidates.slice(0, 5).map((cand, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5 text-slate-400">#{cand.rowIndex}</td>
                        <td className="p-2.5 font-medium text-slate-900">{cand.name}</td>
                        <td className="p-2.5 text-slate-600">{cand.email}</td>
                        <td className="p-2.5 text-slate-600">{cand.phone}</td>
                        <td className="p-2.5 text-slate-600">{cand.college}</td>
                        <td className="p-2.5">
                          {cand.isValid && !cand.isDuplicateInFile && !cand.isDuplicateInExisting ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                              Ready
                            </span>
                          ) : cand.isDuplicateInFile || cand.isDuplicateInExisting ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium" title={cand.duplicateField}>
                              Duplicate
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-medium" title={cand.validationErrors.join(', ')}>
                              Invalid
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Import Options Controls */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={skipDuplicates}
                    onChange={(e) => setSkipDuplicates(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span>Skip Duplicate Records</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={skipInvalid}
                    onChange={(e) => setSkipInvalid(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span>Skip Invalid Records</span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-medium">Assign Consent:</span>
                <select
                  value={defaultConsent}
                  onChange={(e) => setDefaultConsent(e.target.value as ConsentStatus)}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium"
                >
                  <option value="opted_in">Opted-in (Verified Event Interest)</option>
                  <option value="pending">Pending Confirmation</option>
                </select>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm shadow-brand-600/30 transition-colors"
              >
                Confirm & Import Contacts
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MANUAL CONTACT ADD / EDIT MODAL */}
      {/* ========================================================================= */}
      {isEditModalOpen && editingContact && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingContact.id ? 'Edit Student Contact' : 'Add New Student Contact'}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  value={editingContact.name || ''}
                  onChange={(e) => setEditingContact({ ...editingContact, name: e.target.value })}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={editingContact.email || ''}
                    onChange={(e) => setEditingContact({ ...editingContact, email: e.target.value })}
                    placeholder="student@college.edu"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phone / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={editingContact.phone || ''}
                    onChange={(e) => setEditingContact({ ...editingContact, phone: e.target.value })}
                    placeholder="+919876543210"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">College / University *</label>
                <input
                  type="text"
                  required
                  value={editingContact.college || ''}
                  onChange={(e) => setEditingContact({ ...editingContact, college: e.target.value })}
                  placeholder="e.g. Delhi Technological University"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Department / Branch</label>
                  <input
                    type="text"
                    value={editingContact.department || ''}
                    onChange={(e) => setEditingContact({ ...editingContact, department: e.target.value })}
                    placeholder="Computer Science"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Graduation Year</label>
                  <input
                    type="text"
                    value={editingContact.graduationYear || ''}
                    onChange={(e) => setEditingContact({ ...editingContact, graduationYear: e.target.value })}
                    placeholder="2027"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Consent / Opt-out Status</label>
                <select
                  value={editingContact.consentStatus || 'opted_in'}
                  onChange={(e) => setEditingContact({ ...editingContact, consentStatus: e.target.value as ConsentStatus })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="opted_in">Opted-in (Receives Announcements)</option>
                  <option value="opted_out">Opted-out (Unsubscribed - permanently blocked from sends)</option>
                  <option value="pending">Pending Confirmation</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
