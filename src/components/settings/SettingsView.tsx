import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Database, 
  Mail, 
  MessageSquare, 
  ShieldCheck, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  RefreshCw, 
  Server,
  Lock,
  Terminal,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export const SettingsView: React.FC = () => {
  const { isSupabaseActive } = useAuth();
  const { resetSampleData } = useApp();

  const [serverStatus, setServerStatus] = useState<{
    healthy: boolean;
    gmailConfigured: boolean;
    gmailSender?: string;
    whatsAppConfigured: boolean;
    whatsAppPhoneId?: string;
    loading: boolean;
    error?: string;
  }>({
    healthy: false,
    gmailConfigured: false,
    whatsAppConfigured: false,
    loading: true,
  });

  const checkServerStatus = async () => {
    setServerStatus(prev => ({ ...prev, loading: true, error: undefined }));
    try {
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
      const res = await fetch(`${serverUrl}/api/integrations/status`);
      if (res.ok) {
        const data = await res.json();
        setServerStatus({
          healthy: true,
          gmailConfigured: data.gmail?.configured ?? false,
          gmailSender: data.gmail?.senderEmail,
          whatsAppConfigured: data.whatsapp?.configured ?? false,
          whatsAppPhoneId: data.whatsapp?.phoneNumberId,
          loading: false,
        });
      } else {
        throw new Error('Server returned non-200');
      }
    } catch (err) {
      setServerStatus({
        healthy: false,
        gmailConfigured: false,
        whatsAppConfigured: false,
        loading: false,
        error: 'Backend server not responding on port 3001. Run "npm run server" to activate.',
      });
    }
  };

  useEffect(() => {
    checkServerStatus();
  }, []);

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Architecture & Integration Settings</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage Supabase persistence, server-side communication interfaces, and security configurations.
          </p>
        </div>

        <button
          onClick={checkServerStatus}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${serverStatus.loading ? 'animate-spin' : ''}`} />
          <span>Refresh Server Status</span>
        </button>
      </div>

      {/* Security Architecture Compliance Banner */}
      <div className="bg-gradient-to-r from-navy-950 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-navy-800 space-y-3">
        <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
          <Lock className="w-5 h-5" />
          <span>Security & Credential Isolation Architecture</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          In strict compliance with modern enterprise security standards, <strong>zero secret API keys or OAuth access tokens are ever exposed to the client-side browser</strong>. All sensitive credentials reside exclusively within the server-side environment file (<code>.env</code>) and are utilized through guarded backend endpoints.
        </p>
        <div className="flex flex-wrap items-center gap-4 pt-2 text-[11px] text-slate-400 font-mono">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> Frontend Secrets Leak Protection: ENFORCED
          </span>
          <span className="flex items-center gap-1.5 text-cyan-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> Simulated Success Disabled
          </span>
        </div>
      </div>

      {/* Grid: 3 Core Systems */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ========================================================================= */}
        {/* 1. SUPABASE PERSISTENCE STATUS */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-brand-50 text-brand-600">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Supabase Database</h3>
                  <p className="text-xs text-slate-500">Persistent Cloud Database</p>
                </div>
              </div>

              {isSupabaseActive ? (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  Connected
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                  Local Sandbox Mode
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {isSupabaseActive
                ? 'Your application is actively connected to Supabase Database. Contacts and campaigns are synced across browsers.'
                : 'Currently operating in offline-first Local Storage mode. Add Supabase credentials in .env to enable cloud sync.'}
            </p>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1.5">
              <span className="font-semibold text-slate-900 block text-[11px] uppercase">
                To Connect Supabase:
              </span>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px]">
                <li>Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-brand-600 underline">supabase.com/dashboard</a> and create a project.</li>
                <li>Enable <strong>Database</strong> tables and <strong>Email Auth</strong> in your Supabase project.</li>
                <li>Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to <code>.env</code>.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. SERVER BACKEND HEALTH */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Server Backend API</h3>
                  <p className="text-xs text-slate-500">Port 3001 (Node.js & Express)</p>
                </div>
              </div>

              {serverStatus.healthy ? (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  Online
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                  Standby
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Provides the isolated, server-side interface for outbound email dispatch, Meta WhatsApp Cloud webhooks, and campaign approval verification.
            </p>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
              <span className="font-semibold text-slate-900 block text-[11px] uppercase">
                How to Run Server:
              </span>
              <div className="font-mono bg-slate-900 text-slate-200 p-2 rounded text-[11px]">
                npm run server
              </div>
              <p className="text-[11px] text-slate-500">
                Runs on <code>http://localhost:3001</code>. Health endpoint: <code>/api/health</code>
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. GMAIL API INTEGRATION (OAUTH 2.0) */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Gmail API Interface</h3>
                <p className="text-xs text-slate-500">Google Cloud OAuth 2.0</p>
              </div>
            </div>

            {serverStatus.gmailConfigured ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                Configured: {serverStatus.gmailSender}
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                Pending Setup
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Prepared modular architecture in <code>server/providers/gmail.provider.ts</code>. Real sending is guarded by default to prevent accidental student inbox spam during testing.
          </p>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1 font-mono">
            <div><strong>Environment Variables:</strong></div>
            <div>• GMAIL_CLIENT_ID</div>
            <div>• GMAIL_CLIENT_SECRET</div>
            <div>• GMAIL_REFRESH_TOKEN</div>
            <div>• GMAIL_SENDER_EMAIL</div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. WHATSAPP CLOUD API INTEGRATION (META) */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">WhatsApp Cloud API</h3>
                <p className="text-xs text-slate-500">Meta Graph API & Webhook</p>
              </div>
            </div>

            {serverStatus.whatsAppConfigured ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                Configured: {serverStatus.whatsAppPhoneId}
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                Pending Setup
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Prepared modular architecture in <code>server/providers/whatsAppCloud.provider.ts</code>. Provides automatic webhook handshake and status callbacks.
          </p>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1 font-mono">
            <div><strong>Webhook Callback URL:</strong></div>
            <div className="text-brand-600 font-semibold select-all">http://your-server-domain/api/webhook/whatsapp</div>
            <div className="pt-1"><strong>Required Keys:</strong> WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN</div>
          </div>
        </div>
      </div>

      {/* Clear Working Data Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Clear Directory & Campaign Data</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Wipes all currently stored contacts, campaigns, and delivery logs to start with a fresh slate.
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm('Are you sure you want to clear all stored contacts, campaigns, and delivery logs?')) {
              resetSampleData();
              alert('All working data cleared successfully!');
            }
          }}
          className="px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
        >
          Clear All Data
        </button>
      </div>
    </div>
  );
};
