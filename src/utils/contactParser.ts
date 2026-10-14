import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Contact, ConsentStatus } from '../types';

export interface ColumnMapping {
  name: string;
  email: string;
  phone: string;
  college: string;
  department?: string;
  graduationYear?: string;
}

export interface ParsedContactCandidate {
  rawRow: Record<string, any>;
  rowIndex: number;
  name: string;
  email: string;
  phone: string;
  college: string;
  department?: string;
  graduationYear?: string;
  isValid: boolean;
  validationErrors: string[];
  isDuplicateInFile: boolean;
  isDuplicateInExisting: boolean;
  duplicateField?: string;
}

export interface ParseFileResult {
  fileName: string;
  headers: string[];
  suggestedMapping: ColumnMapping;
  candidates: ParsedContactCandidate[];
  totalRows: number;
  validCount: number;
  duplicateCount: number;
  invalidCount: number;
}

// Heuristic column detection rules
export function detectColumnMapping(headers: string[]): ColumnMapping {
  const normalize = (h: string) => h.toLowerCase().replace(/[^a-z0-9]/g, '');

  const findBestHeader = (candidates: string[]): string => {
    for (const cand of candidates) {
      const match = headers.find(h => {
        const norm = normalize(h);
        return norm === cand || norm.includes(cand);
      });
      if (match) return match;
    }
    return '';
  };

  return {
    name: findBestHeader(['fullname', 'studentname', 'name', 'participant', 'candidatename', 'student', 'attendee']),
    email: findBestHeader(['emailaddress', 'email', 'mailid', 'studentemail', 'mail']),
    phone: findBestHeader(['phonenumber', 'contactnumber', 'mobilenumber', 'mobile', 'phone', 'whatsapp', 'contact']),
    college: findBestHeader(['collegename', 'institution', 'university', 'college', 'institute', 'campus']),
    department: findBestHeader(['department', 'branch', 'dept', 'stream', 'major']),
    graduationYear: findBestHeader(['graduationyear', 'gradyear', 'yearofpassing', 'batch', 'year', 'grad']),
  };
}

export function validateEmail(email: string): boolean {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  return re.test(email.trim());
}

export function validatePhone(phone: string): { isValid: boolean; formatted: string } {
  if (!phone) return { isValid: false, formatted: '' };
  // Clean special characters
  const clean = phone.toString().replace(/[\s\-\(\)\.]/g, '');
  // Digits only or starts with +
  const hasPlus = clean.startsWith('+');
  const digits = clean.replace(/\D/g, '');

  if (digits.length < 8 || digits.length > 15) {
    return { isValid: false, formatted: phone };
  }

  // If 10 digits without code, format with +91 or retain
  const formatted = hasPlus ? `+${digits}` : digits.length === 10 ? `+91${digits}` : `+${digits}`;
  return { isValid: true, formatted };
}

/**
 * Parses raw buffer or file into row records using SheetJS (works for .xlsx, .xls, .csv)
 */
export async function parseSpreadsheetFile(
  file: File,
  existingContacts: Contact[] = []
): Promise<ParseFileResult> {
  const fileName = file.name;
  const isCsv = fileName.toLowerCase().endsWith('.csv');

  let rawData: Record<string, any>[] = [];
  let headers: string[] = [];

  if (isCsv) {
    // Parse CSV with PapaParse for optimal delimiter detection and encoding
    const text = await file.text();
    const result = Papa.parse<Record<string, any>>(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: h => h.trim(),
    });
    rawData = result.data;
    headers = result.meta.fields || [];
  } else {
    // Parse XLSX / XLS using SheetJS
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    rawData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });
    
    // Extract headers
    if (rawData.length > 0) {
      headers = Object.keys(rawData[0]);
    }
  }

  const suggestedMapping = detectColumnMapping(headers);

  // Analyze candidates with the suggested mapping
  return evaluateCandidates(fileName, headers, suggestedMapping, rawData, existingContacts);
}

export function evaluateCandidates(
  fileName: string,
  headers: string[],
  mapping: ColumnMapping,
  rawData: Record<string, any>[],
  existingContacts: Contact[]
): ParseFileResult {
  const candidates: ParsedContactCandidate[] = [];
  const seenEmailsInFile = new Set<string>();
  const seenPhonesInFile = new Set<string>();

  const existingEmails = new Set(existingContacts.map(c => c.email.toLowerCase().trim()));
  const existingPhones = new Set(existingContacts.map(c => c.phone.replace(/\D/g, '')));

  let validCount = 0;
  let duplicateCount = 0;
  let invalidCount = 0;

  rawData.forEach((row, index) => {
    const rawName = String(row[mapping.name] || '').trim();
    const rawEmail = String(row[mapping.email] || '').trim();
    const rawPhone = String(row[mapping.phone] || '').trim();
    const rawCollege = String(row[mapping.college] || '').trim();
    const rawDept = mapping.department ? String(row[mapping.department] || '').trim() : undefined;
    const rawGrad = mapping.graduationYear ? String(row[mapping.graduationYear] || '').trim() : undefined;

    const validationErrors: string[] = [];

    // Name check
    if (!rawName) {
      validationErrors.push('Missing contact name');
    }

    // Email check
    const isEmailValid = validateEmail(rawEmail);
    if (!rawEmail) {
      validationErrors.push('Missing email address');
    } else if (!isEmailValid) {
      validationErrors.push(`Invalid email format: "${rawEmail}"`);
    }

    // Phone check
    const phoneCheck = validatePhone(rawPhone);
    if (!rawPhone) {
      validationErrors.push('Missing phone number');
    } else if (!phoneCheck.isValid) {
      validationErrors.push(`Invalid phone format: "${rawPhone}"`);
    }

    // College check
    if (!rawCollege) {
      validationErrors.push('Missing college or institution');
    }

    // Duplicate check
    const normalizedEmail = rawEmail.toLowerCase().trim();
    const normalizedPhoneDigits = phoneCheck.formatted.replace(/\D/g, '');

    let isDuplicateInFile = false;
    let isDuplicateInExisting = false;
    let duplicateField: string | undefined;

    if (normalizedEmail) {
      if (seenEmailsInFile.has(normalizedEmail)) {
        isDuplicateInFile = true;
        duplicateField = 'Email already exists in this file';
      } else if (existingEmails.has(normalizedEmail)) {
        isDuplicateInExisting = true;
        duplicateField = 'Email already in contacts';
      }
      seenEmailsInFile.add(normalizedEmail);
    }

    if (normalizedPhoneDigits && normalizedPhoneDigits.length >= 8) {
      if (seenPhonesInFile.has(normalizedPhoneDigits)) {
        isDuplicateInFile = true;
        duplicateField = duplicateField ? `${duplicateField} & Phone duplicate in file` : 'Phone duplicate in file';
      } else if (existingPhones.has(normalizedPhoneDigits)) {
        isDuplicateInExisting = true;
        duplicateField = duplicateField ? `${duplicateField} & Phone already in contacts` : 'Phone already in contacts';
      }
      seenPhonesInFile.add(normalizedPhoneDigits);
    }

    const isValid = validationErrors.length === 0;
    const isDuplicate = isDuplicateInFile || isDuplicateInExisting;

    if (isValid && !isDuplicate) {
      validCount++;
    } else if (isDuplicate) {
      duplicateCount++;
    } else {
      invalidCount++;
    }

    candidates.push({
      rawRow: row,
      rowIndex: index + 1,
      name: rawName || 'Unknown Student',
      email: rawEmail,
      phone: phoneCheck.formatted || rawPhone,
      college: rawCollege || 'Unspecified College',
      department: rawDept,
      graduationYear: rawGrad,
      isValid,
      validationErrors,
      isDuplicateInFile,
      isDuplicateInExisting,
      duplicateField,
    });
  });

  return {
    fileName,
    headers,
    suggestedMapping: mapping,
    candidates,
    totalRows: rawData.length,
    validCount,
    duplicateCount,
    invalidCount,
  };
}

/**
 * Transforms validated candidates into persistent Contact models.
 * Strictly assigns opt-in status and ensures NO messages are sent.
 */
export function convertCandidatesToContacts(
  candidates: ParsedContactCandidate[],
  sourceFileName: string,
  defaultConsent: ConsentStatus = 'opted_in',
  skipDuplicates: boolean = true,
  skipInvalid: boolean = true
): Contact[] {
  const timestamp = new Date().toISOString();

  return candidates
    .filter(c => {
      if (skipInvalid && !c.isValid) return false;
      if (skipDuplicates && (c.isDuplicateInFile || c.isDuplicateInExisting)) return false;
      return true;
    })
    .map((c, idx) => ({
      id: `cnt-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
      name: c.name,
      email: c.email,
      phone: c.phone,
      college: c.college,
      department: c.department || '',
      graduationYear: c.graduationYear || '',
      consentStatus: defaultConsent,
      source: sourceFileName,
      createdAt: timestamp,
      updatedAt: timestamp,
      isValid: c.isValid,
      validationErrors: c.validationErrors,
    }));
}

/**
 * Exports contacts array to a clean CSV file download
 */
export function exportContactsToCSV(contacts: Contact[], filename = 'quantix_contacts_export.csv'): void {
  const data = contacts.map(c => ({
    'Name': c.name,
    'Email': c.email,
    'Phone': c.phone,
    'College': c.college,
    'Department': c.department || '',
    'Graduation Year': c.graduationYear || '',
    'Consent Status': c.consentStatus,
    'Source': c.source,
    'Created At': c.createdAt,
    'Valid': c.isValid ? 'Yes' : 'No',
  }));

  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
