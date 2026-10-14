import React, { useState } from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Filter, 
  Mail, 
  MessageSquare, 
  Clock, 
  ShieldCheck, 
  RefreshCw, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DeliveryLog, DeliveryStatus } from '../../types';

export const DeliveryReportsView: React.FC = () => {
  const { deliveryLogs, metrics } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredLogs = deliveryLogs.filter(log => {
    const matchesSearch = 
      log.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.recipientIdentifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.campaignTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.providerRefId && log.providerRefId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesChannel = channelFilter === 'all' || log.channel === channelFilter;
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;

    return matchesSearch && matchesChannel && matchesStatus;
  });

  const emailLogs = deliveryLogs.filter(l => l.channel === 'email');
  const whatsappLogs = deliveryLogs.filter(l => l.channel === 'whatsapp');

  const deliveredCount = deliveryLogs.filter(l => l.status === 'delivered' || l.status === 'read').length;
  const failureCount = deliveryLogs.filter(l => l.status === 'bounced' || l.status === 'failed').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Delivery & Transmission Reports</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Provider-confirmed receipt tracking, delivery diagnostics, and engagement signals.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Provider State Compliance: Active</span>
        </div>
      </div>

      {/* Audit Guarantee Note */}
      <div className="bg-slate-900 text-slate-300 p-4 rounded-xl text-xs space-y-1 border border-slate-800">
        <div className="flex items-center gap-2 text-white font-semibold">
          <ShieldCheck className="w-4 h-4 text-brand-400" />
          <span>Strict Provider Acknowledgment Policy</span>
        </div>
        <p className="text-slate-400 leading-relaxed">
          Quantix Promotion Agent strictly records delivery states only when confirmed by the upstream communication provider (Google Gmail API or Meta WhatsApp Cloud Webhooks). No simulated or fabricated successful deliveries are permitted.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Confirmed Dispatches
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{deliveryLogs.length}</div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-blue-500" /> {emailLogs.length} Email
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-500" /> {whatsappLogs.length} WhatsApp
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
            Verified Delivered / Read
          </span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{deliveredCount}</div>
          <div className="mt-2 text-xs text-emerald-600 font-medium">
            {deliveryLogs.length > 0 ? Math.round((deliveredCount / deliveryLogs.length) * 100) : 0}% success rate
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">
            Delivery Failures / Bounces
          </span>
          <div className="text-2xl font-bold text-rose-700 mt-1">{failureCount}</div>
          <div className="mt-2 text-xs text-rose-600 font-medium">
            Permanent mailbox rejects & invalid numbers
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">
            Tracked Registrations
          </span>
          <div className="text-2xl font-bold text-amber-700 mt-1">{metrics.registrationsTracked}</div>
          <div className="mt-2 text-xs text-slate-500">
            Hackathon portal conversions
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student, email, phone, campaign, or provider ID..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Channel Filter */}
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-brand-500"
          >
            <option value="all">All Channels</option>
            <option value="email">Email only</option>
            <option value="whatsapp">WhatsApp only</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-brand-500"
          >
            <option value="all">All Delivery States</option>
            <option value="read">Read (Opened)</option>
            <option value="delivered">Delivered</option>
            <option value="dispatched">Dispatched</option>
            <option value="bounced">Bounced</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Delivery Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Associated Campaign</th>
                <th className="py-3 px-4">Provider Delivery State</th>
                <th className="py-3 px-4">Provider Ref ID</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No delivery records match the current filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {log.contactName}
                      <span className="block text-[11px] text-slate-500 font-mono font-normal">
                        {log.recipientIdentifier}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {log.channel === 'email' ? (
                        <span className="inline-flex items-center gap-1.5 text-blue-700 font-medium">
                          <Mail className="w-3.5 h-3.5" /> Email
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
                          <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate font-medium">
                      {log.campaignTitle}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase ${
                        log.status === 'read' ? 'bg-cyan-50 text-cyan-700 border border-cyan-200' :
                        log.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        log.status === 'dispatched' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        log.status === 'bounced' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {log.status === 'read' && <CheckCircle2 className="w-3 h-3 text-cyan-600" />}
                        {log.status === 'delivered' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {log.status === 'bounced' && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                        <span>{log.status}</span>
                      </span>

                      {log.errorReason && (
                        <span className="block text-[10px] text-rose-600 mt-1 max-w-xs truncate" title={log.errorReason}>
                          {log.errorReason}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 truncate max-w-[180px]">
                      {log.providerRefId || '—'}
                    </td>

                    <td className="py-3.5 px-4 text-right text-slate-500 font-mono text-[11px]">
                      {log.sentAt ? new Date(log.sentAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
