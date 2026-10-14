import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Send, 
  Sparkles, 
  FileText, 
  BarChart3,
  ShieldCheck,
  ChevronRight,
  Zap
} from 'lucide-react';
import { useApp, TabKey } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  id: TabKey;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, campaigns, deliveryLogs } = useApp();
  const { user } = useAuth();

  const pendingApprovals = campaigns.filter(c => c.status === 'pending_approval').length;
  const deliveryErrors = deliveryLogs.filter(l => l.status === 'failed' || l.status === 'bounced').length;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { 
      id: 'campaigns', 
      label: 'Campaigns', 
      icon: Send, 
      badge: pendingApprovals > 0 ? `${pendingApprovals} Pending` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
    },
    { id: 'studio', label: 'AI Message Studio', icon: Sparkles },
    { id: 'templates', label: 'Templates', icon: FileText },
    { 
      id: 'reports', 
      label: 'Delivery Reports', 
      icon: BarChart3,
      badge: deliveryErrors > 0 ? `${deliveryErrors} Alert` : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
    },
  ];

  return (
    <aside className="w-64 bg-navy-950 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-navy-800 shadow-2xl z-20">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-navy-800/80 bg-navy-950/60 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 ring-1 ring-white/20">
            <Zap className="w-5 h-5 fill-white text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-lg tracking-tight font-sans">QUANTIX</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">AGENT</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Campus Event Engine</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Workspace
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative ${
                isActive
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-navy-800/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-brand-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge ? (
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${item.badgeColor || 'bg-brand-500/20 text-brand-300'}`}>
                  {item.badge}
                </span>
              ) : isActive ? (
                <ChevronRight className="w-4 h-4 opacity-75" />
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Compliance & Security badge */}
      <div className="mx-3 my-2 p-3 rounded-lg bg-navy-900 border border-navy-800/80 text-xs">
        <div className="flex items-center gap-2 text-emerald-400 font-medium mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Consent Safe Gate</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Opt-out compliance enforced. No messages dispatched on import.
        </p>
      </div>

      {/* User Session Footer */}
      <div className="p-4 border-t border-navy-800/80 bg-navy-950/80 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-navy-800">
            {user?.displayName ? user.displayName[0].toUpperCase() : 'O'}
          </div>
          <div className="truncate">
            <p className="text-xs font-medium text-white truncate">
              {user?.displayName || 'Lead Organizer'}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {user?.email || 'admin@quantix.dev'}
            </p>
          </div>
        </div>
        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-navy-800 text-slate-300 border border-navy-700">
          {user?.role || 'Admin'}
        </span>
      </div>
    </aside>
  );
};
