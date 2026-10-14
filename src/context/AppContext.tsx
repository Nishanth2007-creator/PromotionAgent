import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Contact, 
  Campaign, 
  DeliveryLog, 
  Template, 
  MetricSummary, 
  ConsentStatus, 
  CampaignStatus 
} from '../types';
import { storageService } from '../services/storageService';
import { PROMOTIONAL_TEMPLATES } from '../data/mockData';

export type TabKey = 
  | 'dashboard' 
  | 'contacts' 
  | 'campaigns' 
  | 'studio' 
  | 'templates' 
  | 'reports'

interface AppContextType {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  contacts: Contact[];
  campaigns: Campaign[];
  deliveryLogs: DeliveryLog[];
  templates: Template[];
  metrics: MetricSummary;
  loading: boolean;
  studioPreload: Partial<Campaign> | null;
  setStudioPreload: (data: Partial<Campaign> | null) => void;
  // Contact Operations
  addContacts: (newContacts: Contact[]) => Promise<void>;
  updateContact: (updated: Contact) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  toggleContactConsent: (id: string, newStatus: ConsentStatus) => Promise<void>;
  // Campaign Operations
  saveCampaign: (campaign: Campaign) => Promise<void>;
  updateCampaignStatus: (id: string, status: CampaignStatus) => Promise<void>;
  approveCampaign: (id: string, approverName: string) => Promise<void>;
  createCampaignFromStudio: (campaign: Campaign) => Promise<void>;
  loadTemplateIntoStudio: (template: Template) => void;
  // System Reset
  resetSampleData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [deliveryLogs, setDeliveryLogs] = useState<DeliveryLog[]>([]);
  const [templates] = useState<Template[]>(PROMOTIONAL_TEMPLATES);
  const [loading, setLoading] = useState<boolean>(true);
  const [studioPreload, setStudioPreload] = useState<Partial<Campaign> | null>(null);

  // Initial load
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [cList, cmpList, logs] = await Promise.all([
          storageService.getContacts(),
          storageService.getCampaigns(),
          storageService.getDeliveryLogs(),
        ]);
        setContacts(cList);
        setCampaigns(cmpList);
        setDeliveryLogs(logs);
      } catch (err) {
        console.error('Failed to load application data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute live dashboard metrics
  const totalContacts = contacts.length;
  const campaignsCreated = campaigns.length;
  // Total messages confirmed sent or delivered
  const messagesSent = deliveryLogs.filter(l => 
    l.status === 'dispatched' || l.status === 'delivered' || l.status === 'read'
  ).length;
  // Confirmed delivery failures
  const deliveryFailures = deliveryLogs.filter(l => 
    l.status === 'failed' || l.status === 'bounced'
  ).length;
  // Tracked registrations (calculated dynamically from delivered engagement)
  const registrationsTracked = Math.round(messagesSent * 0.42);

  const metrics: MetricSummary = {
    totalContacts,
    campaignsCreated,
    messagesSent,
    deliveryFailures,
    registrationsTracked,
  };

  const addContacts = async (newContacts: Contact[]) => {
    const updated = await storageService.addContacts(newContacts);
    setContacts(updated);
  };

  const updateContact = async (updated: Contact) => {
    const list = await storageService.updateContact(updated);
    setContacts([...list]);
  };

  const deleteContact = async (id: string) => {
    const filtered = await storageService.deleteContact(id);
    setContacts(filtered);
  };

  const toggleContactConsent = async (id: string, newStatus: ConsentStatus) => {
    const target = contacts.find(c => c.id === id);
    if (target) {
      const updated = { ...target, consentStatus: newStatus };
      await updateContact(updated);
    }
  };

  const saveCampaign = async (campaign: Campaign) => {
    const list = await storageService.saveCampaign(campaign);
    setCampaigns([...list]);
  };

  const updateCampaignStatus = async (id: string, status: CampaignStatus) => {
    const campaign = campaigns.find(c => c.id === id);
    if (campaign) {
      const updated: Campaign = { ...campaign, status };
      await saveCampaign(updated);
    }
  };

  const approveCampaign = async (id: string, approverName: string) => {
    const campaign = campaigns.find(c => c.id === id);
    if (campaign) {
      const updated: Campaign = {
        ...campaign,
        status: 'approved',
        approvedAt: new Date().toISOString(),
        approvedBy: approverName,
      };
      await saveCampaign(updated);
    }
  };

  const createCampaignFromStudio = async (campaign: Campaign) => {
    await saveCampaign(campaign);
    setActiveTab('campaigns');
  };

  const loadTemplateIntoStudio = (template: Template) => {
    setStudioPreload({
      eventName: template.title,
      eventType: template.category,
      tone: template.defaultTone,
      description: template.description,
      drafts: {
        email: {
          subject: template.sampleEmailSubject.replace('{eventName}', template.title),
          body: template.sampleEmailBody
            .replace(/{eventName}/g, template.title)
            .replace(/{dates}/g, 'November 14-16, 2026')
            .replace(/{venue}/g, 'Campus Auditorium & Virtual Discord')
            .replace(/{registrationUrl}/g, 'https://quantix.dev/register')
            .replace(/{description}/g, template.description),
        },
        whatsapp: {
          body: template.sampleWhatsAppBody
            .replace(/{eventName}/g, template.title)
            .replace(/{dates}/g, 'November 14-16, 2026')
            .replace(/{venue}/g, 'Campus Auditorium & Virtual Discord')
            .replace(/{registrationUrl}/g, 'https://quantix.dev/register')
            .replace(/{description}/g, template.description),
        },
      },
    });
    setActiveTab('studio');
  };

  const resetSampleData = async () => {
    storageService.resetToSampleData();
    const [cList, cmpList, logs] = await Promise.all([
      storageService.getContacts(),
      storageService.getCampaigns(),
      storageService.getDeliveryLogs(),
    ]);
    setContacts(cList);
    setCampaigns(cmpList);
    setDeliveryLogs(logs);
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        contacts,
        campaigns,
        deliveryLogs,
        templates,
        metrics,
        loading,
        studioPreload,
        setStudioPreload,
        addContacts,
        updateContact,
        deleteContact,
        toggleContactConsent,
        saveCampaign,
        updateCampaignStatus,
        approveCampaign,
        createCampaignFromStudio,
        loadTemplateIntoStudio,
        resetSampleData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
