import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Trash2, 
  Mail, 
  MessageSquare, 
  Copy, 
  Check, 
  Eye, 
  Edit3, 
  ArrowRight, 
  Calendar, 
  MapPin, 
  Link as LinkIcon, 
  Users, 
  FileText, 
  Image as ImageIcon,
  CheckCircle2,
  FileQuestion
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { MessageTone, MessageDrafts, Campaign } from '../../types';
import { generatePromotionalDrafts } from '../../utils/aiGenerator';

export const AIMessageStudioView: React.FC = () => {
  const { studioPreload, setStudioPreload, saveCampaign, setActiveTab, contacts } = useApp();

  // Form State - Ready for fresh launch
  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState('');
  const [dates, setDates] = useState('');
  const [venue, setVenue] = useState('');
  const [registrationUrl, setRegistrationUrl] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [description, setDescription] = useState('');
  const [tone, setTone] = useState<MessageTone>('enthusiastic');

  // Flyer Upload State
  const [flyerFile, setFlyerFile] = useState<File | null>(null);
  const [flyerPreviewUrl, setFlyerPreviewUrl] = useState<string | null>(null);

  // Generated Drafts State
  const [drafts, setDrafts] = useState<MessageDrafts>({
    email: { subject: '', body: '' },
    whatsapp: { body: '' },
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [activeChannelTab, setActiveChannelTab] = useState<'email' | 'whatsapp'>('email');
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('preview');
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Load from template or previous state if passed
  useEffect(() => {
    if (studioPreload) {
      if (studioPreload.eventName) setEventName(studioPreload.eventName);
      if (studioPreload.eventType) setEventType(studioPreload.eventType);
      if (studioPreload.tone) setTone(studioPreload.tone);
      if (studioPreload.description) setDescription(studioPreload.description);
      if (studioPreload.dates) setDates(studioPreload.dates);
      if (studioPreload.venue) setVenue(studioPreload.venue);
      if (studioPreload.registrationUrl) setRegistrationUrl(studioPreload.registrationUrl);
      if (studioPreload.drafts) setDrafts(studioPreload.drafts);
      setStudioPreload(null);
    }
  }, [studioPreload, setStudioPreload]);

  // Handle Flyer File
  const handleFlyerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFlyerFile(file);
      const url = URL.createObjectURL(file);
      setFlyerPreviewUrl(url);
    }
  };

  const removeFlyer = () => {
    if (flyerPreviewUrl) URL.revokeObjectURL(flyerPreviewUrl);
    setFlyerFile(null);
    setFlyerPreviewUrl(null);
  };

  // Trigger AI generation
  const handleGenerate = () => {
    if (!eventName.trim()) {
      alert('Please enter an Event Name before generating drafts.');
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      const generated = generatePromotionalDrafts({
        eventName: eventName.trim(),
        eventType: eventType.trim() || 'Event',
        description: description.trim(),
        dates: dates.trim(),
        venue: venue.trim(),
        registrationUrl: registrationUrl.trim(),
        targetAudience: targetAudience.trim(),
        tone,
        flyerName: flyerFile?.name,
      });
      setDrafts(generated);
      setIsGenerating(false);
      setPreviewMode('preview');
    }, 350);
  };

  // Copy Draft to Clipboard
  const handleCopyDraft = () => {
    const textToCopy = activeChannelTab === 'email' 
      ? `Subject: ${drafts.email.subject}\n\n${drafts.email.body}`
      : drafts.whatsapp.body;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  // Save campaign from studio
  const handleSaveCampaign = async (status: 'draft' | 'pending_approval') => {
    if (!eventName.trim()) {
      alert('Please enter an Event Name before saving the campaign.');
      return;
    }

    if (!drafts.email.body && !drafts.whatsapp.body) {
      alert('Please generate or write message drafts before saving.');
      return;
    }

    const validCount = contacts.filter(c => c.isValid && c.consentStatus === 'opted_in').length;
    const optedOutCount = contacts.filter(c => c.consentStatus === 'opted_out').length;

    const newCampaign: Campaign = {
      id: `cmp-${Date.now()}`,
      title: `${eventName} [${tone.toUpperCase()}]`,
      eventName,
      eventType: eventType || 'College Event',
      description,
      dates,
      venue,
      registrationUrl,
      targetAudience,
      tone,
      flyerName: flyerFile?.name,
      flyerUrl: flyerPreviewUrl || undefined,
      drafts,
      status,
      isTestMode: false,
      selectedChannels: ['email', 'whatsapp'],
      targetColleges: [],
      recipientSummary: {
        totalTargeted: contacts.length,
        emailEligible: validCount,
        whatsappEligible: validCount,
        optedOutExcluded: optedOutCount,
        invalidExcluded: contacts.filter(c => !c.isValid).length,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveCampaign(newCampaign);
    alert(`Campaign "${newCampaign.title}" saved successfully as ${status.replace('_', ' ')}!`);
    setActiveTab('campaigns');
  };

  const hasDraftContent = Boolean(drafts.email.body || drafts.whatsapp.body);
  const sampleRecipient = contacts[0] || { name: 'Student Participant', email: 'student@college.edu', phone: '+919876543210' };

  return (
    <div className="space-y-6">
      {/* Studio Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-50 text-brand-600">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">AI Message Studio</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Craft tailored Email and WhatsApp announcements with calibrated tone and live realistic rendering.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleSaveCampaign('draft')}
            disabled={!hasDraftContent}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            onClick={() => handleSaveCampaign('pending_approval')}
            disabled={!hasDraftContent}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm shadow-brand-600/30 transition-colors disabled:opacity-50"
          >
            <span>Proceed to Campaign Setup</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Studio Grid: Form (Left) & Editor / Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: EVENT DETAILS & PROMPT CONTROLS */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>Event Specification</span>
            </h3>

            {/* Event Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Event / Hackathon Name *
              </label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. Quantix Hackathon 2026: Quantum Leap"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {/* Event Category & Dates */}
            <div className="grid grid-cols-2 gap-3">
              {/* Manually enterable category input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category / Type</label>
                <input
                  type="text"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  placeholder="e.g. 36-Hour Hackathon"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dates & Time</label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={dates}
                    onChange={(e) => setDates(e.target.value)}
                    placeholder="e.g. Nov 14-16, 2026"
                    className="w-full pl-8 pr-2.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Venue & Registration URL */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Venue / Mode</label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="e.g. Campus Hall & Virtual"
                    className="w-full pl-8 pr-2.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Registration URL</label>
                <div className="relative">
                  <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={registrationUrl}
                    onChange={(e) => setRegistrationUrl(e.target.value)}
                    placeholder="https://quantix.dev/register"
                    className="w-full pl-8 pr-2.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Student Audience
              </label>
              <div className="relative">
                <Users className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. CS, Data Science, and Design students"
                  className="w-full pl-8 pr-2.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            {/* Description & Perks */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Highlights, Prizes & Tracks
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention bounty amounts, mentorship from tech leaders, key tracks, swags, and lunch..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg resize-none"
              />
            </div>

            {/* Flyer Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Promotional Flyer Upload
              </label>
              {flyerPreviewUrl ? (
                <div className="relative border border-slate-200 rounded-xl overflow-hidden group">
                  <img
                    src={flyerPreviewUrl}
                    alt="Uploaded Flyer Preview"
                    className="w-full h-36 object-cover bg-slate-100"
                  />
                  <div className="p-2.5 bg-white flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 truncate max-w-[200px]">
                      {flyerFile?.name}
                    </span>
                    <button
                      type="button"
                      onClick={removeFlyer}
                      className="text-rose-600 hover:text-rose-700 p-1 flex items-center gap-1 font-semibold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-200 hover:border-brand-400 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-slate-50/50 hover:bg-slate-50">
                  <ImageIcon className="w-6 h-6 text-slate-400" />
                  <span className="text-xs font-medium text-slate-600">
                    Upload official event poster (PNG, JPG, WEBP)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFlyerUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Tone Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Message Tone Calibration
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['professional', 'concise', 'enthusiastic'] as MessageTone[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`py-2 px-2 rounded-lg text-xs font-semibold capitalize border transition-all ${
                      tone === t
                        ? 'bg-brand-50 border-brand-500 text-brand-700 ring-2 ring-brand-500/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-brand-600/30 transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Synthesizing Drafts...' : 'Generate AI Message Drafts'}</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: DRAFT EDITOR & REALISTIC PREVIEW SWITCHER */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-full min-h-[580px]">
            {/* Header / Tabs */}
            <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
              {/* Channel Tabs */}
              <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setActiveChannelTab('email')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${
                    activeChannelTab === 'email'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>Email Draft</span>
                </button>
                <button
                  onClick={() => setActiveChannelTab('whatsapp')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${
                    activeChannelTab === 'whatsapp'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp Draft</span>
                </button>
              </div>

              {/* View Mode Switcher */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                  <button
                    onClick={() => setPreviewMode('edit')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium ${
                      previewMode === 'edit'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setPreviewMode('preview')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium ${
                      previewMode === 'preview'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Live Preview</span>
                  </button>
                </div>

                {/* Copy Button */}
                <button
                  onClick={handleCopyDraft}
                  disabled={!hasDraftContent}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 disabled:opacity-40"
                  title="Copy Draft"
                >
                  {copiedNotification ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-6 flex-1 flex flex-col justify-between">
              {!hasDraftContent ? (
                /* EMPTY STATE PROMPT FOR LAUNCH */
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3 shadow-xs">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Ready to Generate Message Drafts
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
                    Enter your event details on the left and click <strong>Generate AI Message Drafts</strong>, or choose a preset framework from the <strong>Templates</strong> section.
                  </p>
                </div>
              ) : previewMode === 'edit' ? (
                /* EDIT MODE */
                <div className="space-y-4">
                  {activeChannelTab === 'email' ? (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Subject Line (supports {'{name}'} placeholder)
                        </label>
                        <input
                          type="text"
                          value={drafts.email.subject}
                          onChange={(e) =>
                            setDrafts({
                              ...drafts,
                              email: { ...drafts.email, subject: e.target.value },
                            })
                          }
                          placeholder="Email subject..."
                          className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold text-slate-700">
                            Email Body Content
                          </label>
                          <span className="text-[11px] text-slate-400">
                            {drafts.email.body.length} characters
                          </span>
                        </div>
                        <textarea
                          rows={15}
                          value={drafts.email.body}
                          onChange={(e) =>
                            setDrafts({
                              ...drafts,
                              email: { ...drafts.email, body: e.target.value },
                            })
                          }
                          placeholder="Email body text..."
                          className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 leading-relaxed resize-none"
                        />
                      </div>
                    </>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700">
                          WhatsApp Message Body (*bold*, _italics_)
                        </label>
                        <span className="text-[11px] text-slate-400">
                          {drafts.whatsapp.body.length} characters
                        </span>
                      </div>
                      <textarea
                        rows={16}
                        value={drafts.whatsapp.body}
                        onChange={(e) =>
                          setDrafts({
                            ...drafts,
                            whatsapp: { body: e.target.value },
                          })
                        }
                        placeholder="WhatsApp message text..."
                        className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 leading-relaxed resize-none"
                      />
                    </div>
                  )}
                </div>
              ) : (
                /* LIVE REALISTIC PREVIEW MODE */
                <div className="flex-1">
                  {activeChannelTab === 'email' ? (
                    /* REALISTIC EMAIL CLIENT MOCKUP */
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white">
                      {/* Email Header */}
                      <div className="bg-slate-100/80 p-3.5 border-b border-slate-200 space-y-1 text-xs">
                        <div className="flex items-center justify-between text-slate-500">
                          <span>
                            From: <strong className="text-slate-800">Quantix Event Desk &lt;organizer@quantix.dev&gt;</strong>
                          </span>
                          <span className="text-[11px]">Preview</span>
                        </div>
                        <div className="text-slate-500">
                          To: <span className="text-slate-800">{sampleRecipient.name} &lt;{sampleRecipient.email}&gt;</span>
                        </div>
                        <div className="pt-1.5 font-bold text-slate-900 text-sm">
                          {drafts.email.subject.replace('{name}', sampleRecipient.name)}
                        </div>
                      </div>

                      {/* Rendered Email Body */}
                      <div className="p-6 space-y-4 text-xs text-slate-700 leading-relaxed">
                        {flyerPreviewUrl && (
                          <div className="mb-4 rounded-lg overflow-hidden border border-slate-200 max-h-56">
                            <img src={flyerPreviewUrl} alt="Flyer" className="w-full object-cover" />
                          </div>
                        )}

                        <div className="whitespace-pre-line font-sans">
                          {drafts.email.body.replace(/{name}/g, sampleRecipient.name)}
                        </div>

                        {/* Visual Call To Action Button */}
                        {registrationUrl && (
                          <div className="pt-4 pb-2">
                            <a
                              href={registrationUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-block px-5 py-2.5 rounded-lg bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-600/20 hover:bg-brand-700 transition-colors"
                            >
                              Register for {eventName || 'Event'} &rarr;
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* REALISTIC WHATSAPP CHAT MOCKUP */
                    <div className="max-w-md mx-auto bg-[#E5DDD5] rounded-2xl overflow-hidden shadow-lg border border-slate-300">
                      {/* WhatsApp Top Bar */}
                      <div className="bg-[#075E54] p-3 text-white flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[#075E54] text-xs">
                          QA
                        </div>
                        <div>
                          <div className="font-semibold text-xs flex items-center gap-1">
                            <span>Quantix Promotions</span>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                          </div>
                          <span className="text-[10px] text-emerald-100">Official Campus Bot</span>
                        </div>
                      </div>

                      {/* WhatsApp Chat Area */}
                      <div className="p-4 space-y-3 min-h-[380px] flex flex-col justify-end bg-repeat" style={{ backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
                        {/* Chat Bubble */}
                        <div className="bg-white rounded-lg rounded-tl-none p-3 shadow-sm text-xs text-slate-800 max-w-[90%] self-start relative border border-slate-200/50">
                          {flyerPreviewUrl && (
                            <div className="mb-2 rounded overflow-hidden">
                              <img src={flyerPreviewUrl} alt="Flyer" className="w-full h-36 object-cover" />
                            </div>
                          )}
                          <div className="whitespace-pre-line leading-relaxed font-sans">
                            {drafts.whatsapp.body.replace(/{name}/g, sampleRecipient.name)}
                          </div>
                          <div className="text-[10px] text-slate-400 text-right mt-1.5 flex items-center justify-end gap-1">
                            <span>Just now</span>
                            <span className="text-cyan-600 font-bold">✓✓</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Quick Help */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Dynamic personalization tokens: {'{name}'}, {'{dates}'}, {'{venue}'}
                </span>
                <span className="text-slate-400">
                  Ready to link with target recipients
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
