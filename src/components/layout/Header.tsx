import React from 'react';
import { 
  Sparkles, 
  Upload, 
  Database, 
  RefreshCw, 
  Bell, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const { activeTab, setActiveTab, resetSampleData } = useApp();
  const { isSupabaseActive } = useAuth();

  const getPageMeta = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Event Operations Dashboard',
          subtitle: 'Monitor multi-college outreach, delivery metrics, and registration conversions.',
        };
      case 'contacts':
        return {
          title: 'Contact Directory & Importer',
          subtitle: 'Manage verified student contacts with automated Excel/CSV schema detection and consent tracking.',
        };
      case 'campaigns':
        return {
          title: 'Promotional Campaigns',
          subtitle: 'Draft, approve, and execute cross-channel email and WhatsApp outreach campaigns.',
        };
      case 'studio':
        return {
          title: 'AI Message Studio',
          subtitle: 'Generate tailored, tone-calibrated email and WhatsApp copy from event specs & flyers.',
        };
      case 'templates':
        return {
          title: 'Promotion Templates',
          subtitle: 'Pre-designed high-converting announcements, countdowns, and speaker showcases.',
        };
      case 'reports':
        return {
          title: 'Delivery & Analytics Reports',
          subtitle: 'Provider-verified dispatch reports, bounce diagnostics, and engagement metrics.',
        };
      default:
        return { title: 'Quantix Promotion Agent', subtitle: 'Automation Engine' };
    }
  };

  const meta = getPageMeta();

  return (
    <header className="h-20 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-10 shadow-xs">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight font-sans">
            {meta.title}
          </h1>
          {isSupabaseActive ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Supabase Connected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
              <Database className="w-3.5 h-3.5 text-brand-600" />
              Local Sandbox Mode
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{meta.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">

        {/* Quick Studio Trigger */}
        <button
          onClick={() => setActiveTab('studio')}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-lg transition-colors shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>AI Studio</span>
        </button>

        {/* Quick Import Trigger */}
        <button
          onClick={() => setActiveTab('contacts')}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors shadow-sm shadow-brand-600/20"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Import Contacts</span>
        </button>
      </div>
    </header>
  );
};
