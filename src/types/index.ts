export type ConsentStatus = 'opted_in' | 'opted_out' | 'pending';

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  department?: string;
  graduationYear?: string;
  consentStatus: ConsentStatus;
  source: string;
  createdAt: string;
  updatedAt: string;
  isValid: boolean;
  validationErrors?: string[];
}

export type MessageTone = 'professional' | 'concise' | 'enthusiastic';

export type CampaignStatus = 
  | 'draft' 
  | 'pending_approval' 
  | 'approved' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled';

export interface MessageDrafts {
  email: {
    subject: string;
    body: string;
  };
  whatsapp: {
    body: string;
  };
}

export interface Campaign {
  id: string;
  title: string;
  eventName: string;
  eventType: string;
  description: string;
  dates: string;
  venue: string;
  registrationUrl: string;
  targetAudience: string;
  tone: MessageTone;
  flyerUrl?: string;
  flyerName?: string;
  drafts: MessageDrafts;
  status: CampaignStatus;
  isTestMode: boolean;
  selectedChannels: ('email' | 'whatsapp')[];
  targetColleges: string[]; // empty means all colleges
  recipientSummary: {
    totalTargeted: number;
    emailEligible: number;
    whatsappEligible: number;
    optedOutExcluded: number;
    invalidExcluded: number;
  };
  approvedAt?: string;
  approvedBy?: string;
  scheduledFor?: string;
  createdAt: string;
  updatedAt: string;
}

export type DeliveryStatus = 
  | 'pending' 
  | 'dispatched' 
  | 'delivered' 
  | 'read' 
  | 'bounced' 
  | 'failed';

export interface DeliveryLog {
  id: string;
  campaignId: string;
  campaignTitle: string;
  contactId: string;
  contactName: string;
  recipientIdentifier: string; // email address or phone number
  channel: 'email' | 'whatsapp';
  status: DeliveryStatus;
  providerRefId?: string;
  errorReason?: string;
  sentAt?: string;
  updatedAt: string;
}

export interface MetricSummary {
  totalContacts: number;
  campaignsCreated: number;
  messagesSent: number;
  deliveryFailures: number;
  registrationsTracked: number;
}

export interface Template {
  id: string;
  title: string;
  category: string;
  description: string;
  defaultTone: MessageTone;
  sampleEmailSubject: string;
  sampleEmailBody: string;
  sampleWhatsAppBody: string;
}

export interface ServerIntegrationStatus {
  gmail: {
    configured: boolean;
    senderEmail?: string;
    mode: 'live' | 'pending_setup';
    lastChecked?: string;
  };
  whatsapp: {
    configured: boolean;
    phoneNumberId?: string;
    mode: 'live' | 'pending_setup';
    lastChecked?: string;
  };
  supabase: {
    configured: boolean;
    projectUrl?: string;
    mode: 'supabase' | 'local_fallback';
  };
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'admin' | 'organizer';
  photoURL?: string | null;
}
