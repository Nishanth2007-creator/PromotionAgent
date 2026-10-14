import { Contact, Campaign, DeliveryLog } from '../types';
import { INITIAL_CONTACTS, INITIAL_CAMPAIGNS, INITIAL_DELIVERY_LOGS } from '../data/mockData';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  CONTACTS: 'quantix_contacts_v2_launch',
  CAMPAIGNS: 'quantix_campaigns_v2_launch',
  DELIVERY_LOGS: 'quantix_delivery_logs_v2_launch',
};

function normalizeCloudRow<T>(row: any): T {
  if (!row) return row;
  if (row.data) return row.data as T;
  if (row.payload) return row.payload as T;
  return row as T;
}

class StorageService {
  private cloudAvailable(): boolean {
    return isSupabaseConfigured && !!supabase;
  }

  public async getContacts(): Promise<Contact[]> {
    if (this.cloudAvailable()) {
      try {
        const { data, error } = await supabase!.from('contacts').select('*');
        if (!error && Array.isArray(data) && data.length > 0) {
          return data.map((r) => normalizeCloudRow<Contact>(r));
        }
      } catch (err) {
        console.warn('[Storage] Supabase error, falling back to local storage:', err);
      }
    }

    const local = localStorage.getItem(STORAGE_KEYS.CONTACTS);
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        // parsing error fallback
      }
    }

    this.saveContactsLocal(INITIAL_CONTACTS);
    return INITIAL_CONTACTS;
  }

  public async saveContacts(contacts: Contact[]): Promise<void> {
    this.saveContactsLocal(contacts);

    if (this.cloudAvailable()) {
      try {
        const rows = contacts.map((c) => ({ id: c.id, data: c }));
        const { error } = await supabase!.from('contacts').upsert(rows, { onConflict: 'id' });
        if (error) {
          console.warn('[Storage] Failed to save contacts to Supabase:', error.message);
        }
      } catch (err) {
        console.warn('[Storage] Failed to save contacts to Supabase:', err);
      }
    }
  }

  public async addContacts(newContacts: Contact[]): Promise<Contact[]> {
    const current = await this.getContacts();
    const updated = [...newContacts, ...current];
    await this.saveContacts(updated);
    return updated;
  }

  public async updateContact(updatedContact: Contact): Promise<Contact[]> {
    const current = await this.getContacts();
    const index = current.findIndex((c) => c.id === updatedContact.id);
    if (index !== -1) {
      current[index] = { ...updatedContact, updatedAt: new Date().toISOString() };
      await this.saveContacts(current);
    }
    return current;
  }

  public async deleteContact(id: string): Promise<Contact[]> {
    const current = await this.getContacts();
    const filtered = current.filter((c) => c.id !== id);
    this.saveContactsLocal(filtered);

    if (this.cloudAvailable()) {
      try {
        const { error } = await supabase!.from('contacts').delete().eq('id', id);
        if (error) {
          console.warn('[Storage] Failed to delete contact from Supabase:', error.message);
        }
      } catch (err) {
        console.warn('[Storage] Failed to delete contact from Supabase:', err);
      }
    }

    return filtered;
  }

  public async getCampaigns(): Promise<Campaign[]> {
    if (this.cloudAvailable()) {
      try {
        const { data, error } = await supabase!.from('campaigns').select('*');
        if (!error && Array.isArray(data) && data.length > 0) {
          return data.map((r) => normalizeCloudRow<Campaign>(r));
        }
      } catch (err) {
        console.warn('[Storage] Supabase error loading campaigns:', err);
      }
    }

    const local = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS);
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        // fallback
      }
    }

    this.saveCampaignsLocal(INITIAL_CAMPAIGNS);
    return INITIAL_CAMPAIGNS;
  }

  public async saveCampaigns(campaigns: Campaign[]): Promise<void> {
    this.saveCampaignsLocal(campaigns);

    if (this.cloudAvailable()) {
      try {
        const rows = campaigns.map((c) => ({ id: c.id, data: c }));
        const { error } = await supabase!.from('campaigns').upsert(rows, { onConflict: 'id' });
        if (error) {
          console.warn('[Storage] Failed to save campaigns to Supabase:', error.message);
        }
      } catch (err) {
        console.warn('[Storage] Failed to save campaigns to Supabase:', err);
      }
    }
  }

  public async saveCampaign(campaign: Campaign): Promise<Campaign[]> {
    const current = await this.getCampaigns();
    const index = current.findIndex((c) => c.id === campaign.id);
    let updated: Campaign[];
    if (index >= 0) {
      current[index] = { ...campaign, updatedAt: new Date().toISOString() };
      updated = [...current];
    } else {
      updated = [campaign, ...current];
    }
    await this.saveCampaigns(updated);
    return updated;
  }

  public async getDeliveryLogs(): Promise<DeliveryLog[]> {
    if (this.cloudAvailable()) {
      try {
        const { data, error } = await supabase!.from('delivery_logs').select('*');
        if (!error && Array.isArray(data) && data.length > 0) {
          return data.map((r) => normalizeCloudRow<DeliveryLog>(r));
        }
      } catch (err) {
        console.warn('[Storage] Supabase error loading delivery logs:', err);
      }
    }

    const local = localStorage.getItem(STORAGE_KEYS.DELIVERY_LOGS);
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        // fallback
      }
    }

    this.saveDeliveryLogsLocal(INITIAL_DELIVERY_LOGS);
    return INITIAL_DELIVERY_LOGS;
  }

  public async saveDeliveryLogs(logs: DeliveryLog[]): Promise<void> {
    this.saveDeliveryLogsLocal(logs);

    if (this.cloudAvailable()) {
      try {
        const rows = logs.map((l) => ({ id: l.id, data: l }));
        const { error } = await supabase!.from('delivery_logs').upsert(rows, { onConflict: 'id' });
        if (error) {
          console.warn('[Storage] Failed to save delivery logs to Supabase:', error.message);
        }
      } catch (err) {
        console.warn('[Storage] Failed to save delivery logs to Supabase:', err);
      }
    }
  }

  public resetToSampleData(): void {
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(INITIAL_CONTACTS));
    localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(INITIAL_CAMPAIGNS));
    localStorage.setItem(STORAGE_KEYS.DELIVERY_LOGS, JSON.stringify(INITIAL_DELIVERY_LOGS));
  }

  private saveContactsLocal(contacts: Contact[]): void {
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
  }

  private saveCampaignsLocal(campaigns: Campaign[]): void {
    localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns));
  }

  private saveDeliveryLogsLocal(logs: DeliveryLog[]): void {
    localStorage.setItem(STORAGE_KEYS.DELIVERY_LOGS, JSON.stringify(logs));
  }
}

export const storageService = new StorageService();