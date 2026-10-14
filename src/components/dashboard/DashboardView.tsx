import React from 'react';
import { 
  Users, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Sparkles, 
  Upload, 
  ArrowUpRight, 
  Clock, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  Mail,
  MessageSquare
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DashboardView: React.FC = () => {
  const { metrics, campaigns, contacts, setActiveTab } = useApp();

  // Metrics cards config
  const statCards = [
    {
      title: 'Total Contacts',
      value: metrics.totalContacts.toLocaleString(),
      subtext: `${contacts.filter(c => c.consentStatus === 'opted_in').length} Opted-in students`,
      icon: Users,
      color: 'blue',
      badge: contacts.length > 0 ? `${contacts.length} Loaded` : 'Directory Empty',
    },
    {
      title: 'Campaigns Created',
      value: metrics.campaignsCreated.toString(),
      subtext: `${campaigns.filter(c => c.status === 'in_progress').length} Active in progress`,
      icon: Send,
      color: 'indigo',
      badge: campaigns.length > 0 ? `${campaigns.length} Active` : 'Ready to Draft',
    },
    {
      title: 'Messages Sent',
      value: metrics.messagesSent.toLocaleString(),
      subtext: 'Confirmed provider dispatches',
      icon: CheckCircle2,
      color: 'emerald',
      badge: metrics.messagesSent > 0 ? 'Confirmed' : 'Standby',
    },
    {
      title: 'Delivery Failures',
      value: metrics.deliveryFailures.toString(),
      subtext: 'Bounced or invalid routes',
      icon: AlertTriangle,
      color: 'rose',
      badge: metrics.deliveryFailures === 0 ? 'Optimal (0)' : 'Action Needed',
    },
    {
      title: 'Registrations Tracked',
      value: metrics.registrationsTracked.toString(),
      subtext: 'Event portal conversions',
      icon: TrendingUp,
      color: 'amber',
      badge: metrics.registrationsTracked > 0 ? 'Tracked' : '0 Tracked',
    },
  ];

  // Colleges breakdown
  const collegeCounts: Record<string, number> = {};
  contacts.forEach(c => {
    collegeCounts[c.college] = (collegeCounts[c.college] || 0) + 1;
  });
  const topColleges = Object.entries(collegeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy-950 via-navy-900 to-brand-900 p-8 text-white shadow-xl border border-navy-800">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Autonomous Hackathon Promotion Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
            Scale Hackathon Outreach Across Engineering Campuses
          </h2>
          <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            Import student leads safely, generate tone-optimized Email & WhatsApp copy in the AI Studio, and manage campaigns with built-in consent protection and provider delivery verification.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('studio')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg shadow-brand-600/30 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch AI Message Studio</span>
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 font-semibold text-xs transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>Import Contacts (.xlsx, .csv)</span>
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-navy-800/80 hover:bg-navy-700 text-slate-200 border border-navy-700 font-semibold text-xs transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Review Campaigns</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Required Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {stat.title}
                </span>
                <div className={`p-2 rounded-lg ${
                  stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                  stat.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                  stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                  stat.color === 'rose' ? 'bg-rose-50 text-rose-600' :
                  'bg-amber-50 text-amber-600'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900 tracking-tight">
                  {stat.value}
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-xs text-slate-500 truncate">{stat.subtext}</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="font-medium text-slate-600">{stat.badge}</span>
                <span className="text-brand-600 font-semibold">Active</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid: Recent Campaigns & Channel Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Active & Recent Campaigns */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Campaigns</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Outreach initiatives, approval status, and targeting
              </p>
            </div>
            <button
              onClick={() => setActiveTab('campaigns')}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {campaigns.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No campaigns created yet. Launch the AI Studio to create your first one.
              </div>
            ) : (
              campaigns.slice(0, 4).map((cmp) => {
                const isApproved = cmp.status === 'approved' || cmp.status === 'in_progress' || cmp.status === 'completed';
                return (
                  <div
                    key={cmp.id}
                    className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900">
                          {cmp.title}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${
                          cmp.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          cmp.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                          cmp.status === 'pending_approval' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-200 text-slate-700'
                        }`}>
                          {cmp.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {cmp.eventName} &bull; {cmp.dates} &bull; {cmp.venue}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          {cmp.recipientSummary.totalTargeted} Targeted
                        </span>
                        <span className="flex items-center gap-1">
                          {cmp.selectedChannels.includes('email') && <Mail className="w-3.5 h-3.5 text-blue-500" />}
                          {cmp.selectedChannels.includes('whatsapp') && <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />}
                          {cmp.selectedChannels.join(' & ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {cmp.status === 'pending_approval' ? (
                        <button
                          onClick={() => setActiveTab('campaigns')}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
                        >
                          Review & Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => setActiveTab('campaigns')}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 bg-white border border-slate-200 hover:bg-slate-100"
                        >
                          Details
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 1 Col: College Distribution & Safeguard Status */}
        <div className="space-y-6">
          {/* Top Colleges */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Top Campus Reach</h3>
            <p className="text-xs text-slate-500">Lead distribution by registered college</p>

            {topColleges.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 leading-relaxed">
                No student contacts imported yet. Click below to import your college directory.
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {topColleges.map(([collegeName, count], i) => {
                  const pct = Math.round((count / (contacts.length || 1)) * 100);
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700 truncate max-w-[180px]">
                          {collegeName}
                        </span>
                        <span className="font-semibold text-slate-900">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-brand-600 h-1.5 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => setActiveTab('contacts')}
              className="w-full mt-2 py-2 text-center text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
            >
              Manage College Directory
            </button>
          </div>

          {/* Safety & Protocol Card */}
          <div className="bg-gradient-to-br from-slate-900 to-navy-900 text-white rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Safety & Anti-Spam Architecture</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every outreach requires explicit organizer approval before trigger. Unsubscribed leads are permanently suppressed from email and WhatsApp queues.
            </p>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Test Mode: Available</span>
              <span className="text-emerald-400 font-mono">ENFORCED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
