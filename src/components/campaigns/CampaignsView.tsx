import React, { useState } from 'react';
import { 
  Send, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Mail, 
  MessageSquare, 
  Users, 
  ShieldCheck, 
  ShieldAlert, 
  Check, 
  X, 
  Plus, 
  TestTube, 
  Eye, 
  FileText, 
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Campaign, CampaignStatus } from '../../types';

export const CampaignsView: React.FC = () => {
  const { campaigns, contacts, saveCampaign, approveCampaign, updateCampaignStatus, setActiveTab } = useApp();
  const { user } = useAuth();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState<boolean>(false);
  const [isTestMode, setIsTestMode] = useState<boolean>(true);
  const [testEmail, setTestEmail] = useState<string>('organizer@quantix.dev');
  const [testPhone, setTestPhone] = useState<string>('+919876543210');
  
  // Explicit Approval Checklist
  const [checkLink, setCheckLink] = useState(false);
  const [checkOptOut, setCheckOptOut] = useState(false);
  const [checkContent, setCheckContent] = useState(false);
  const [approvalSignature, setApprovalSignature] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(c => {
    if (filterStatus === 'all') return true;
    return c.status === filterStatus;
  });

  // Calculate dynamic recipient breakdown for a campaign
  const calculateRecipients = (campaign: Campaign) => {
    let eligible = contacts;

    // Filter by colleges if targeted
    if (campaign.targetColleges && campaign.targetColleges.length > 0) {
      eligible = eligible.filter(c => campaign.targetColleges.includes(c.college));
    }

    const totalTargeted = eligible.length;
    const optedOutExcluded = eligible.filter(c => c.consentStatus === 'opted_out').length;
    const invalidExcluded = eligible.filter(c => !c.isValid).length;

    // Valid contacts with consent
    const activeAudience = eligible.filter(c => c.isValid && c.consentStatus !== 'opted_out');

    const emailEligible = campaign.selectedChannels.includes('email') ? activeAudience.length : 0;
    const whatsappEligible = campaign.selectedChannels.includes('whatsapp') ? activeAudience.length : 0;

    return {
      totalTargeted,
      emailEligible,
      whatsappEligible,
      optedOutExcluded,
      invalidExcluded,
      activeAudienceCount: activeAudience.length,
    };
  };

  const handleOpenApprovalModal = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsTestMode(campaign.isTestMode ?? true);
    setCheckLink(false);
    setCheckOptOut(false);
    setCheckContent(false);
    setApprovalSignature('');
    setIsApprovalModalOpen(true);
  };

  const handleConfirmApproval = async () => {
    if (!selectedCampaign) return;

    if (!checkLink || !checkOptOut || !checkContent) {
      alert('Please complete all 3 compliance verification checkboxes.');
      return;
    }

    if (approvalSignature.trim().toUpperCase() !== 'APPROVE') {
      alert('Please type "APPROVE" into the confirmation input box to authorize this action.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isTestMode) {
        // Safe test mode dispatch
        await approveCampaign(selectedCampaign.id, `${user?.displayName || 'Lead Organizer'} [TEST MODE]`);
        alert(`Test campaign approved in Test Mode! Verification sent to ${testEmail} and ${testPhone}. Regular audience remained untouched.`);
      } else {
        // Explicit live approval
        await approveCampaign(selectedCampaign.id, user?.displayName || 'Lead Organizer');
        alert(`Campaign "${selectedCampaign.title}" is officially APPROVED! Note: Production server requires active Gmail/WhatsApp credentials to begin dispatch.`);
      }
      setIsApprovalModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Campaign Operations</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage multi-channel college outreach, review audience counts, and authorize promotions.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('studio')}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm shadow-brand-600/30 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          <span>New Campaign via AI Studio</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: 'All Campaigns', count: campaigns.length },
          { id: 'pending_approval', label: 'Pending Approval', count: campaigns.filter(c => c.status === 'pending_approval').length },
          { id: 'approved', label: 'Approved', count: campaigns.filter(c => c.status === 'approved').length },
          { id: 'in_progress', label: 'In Progress', count: campaigns.filter(c => c.status === 'in_progress').length },
          { id: 'draft', label: 'Drafts', count: campaigns.filter(c => c.status === 'draft').length },
          { id: 'completed', label: 'Completed', count: campaigns.filter(c => c.status === 'completed').length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-3.5 py-2 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-2 ${
              filterStatus === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              filterStatus === tab.id ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Campaign Cards List */}
      <div className="space-y-4">
        {filteredCampaigns.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
            <Send className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-700">No campaigns found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No campaigns in this category. Use the AI Message Studio to draft and configure your next promotion.
            </p>
            <button
              onClick={() => setActiveTab('studio')}
              className="mt-2 px-4 py-2 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
            >
              Open AI Studio
            </button>
          </div>
        ) : (
          filteredCampaigns.map(campaign => {
            const counts = calculateRecipients(campaign);

            return (
              <div
                key={campaign.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all p-5 space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{campaign.title}</h3>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        campaign.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        campaign.status === 'approved' ? 'bg-cyan-100 text-cyan-800' :
                        campaign.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                        campaign.status === 'pending_approval' ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-300' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {campaign.status.replace('_', ' ')}
                      </span>
                      {campaign.isTestMode && (
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                          TEST MODE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {campaign.eventName} &bull; {campaign.dates} &bull; {campaign.venue}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {campaign.status === 'pending_approval' ? (
                      <button
                        onClick={() => handleOpenApprovalModal(campaign)}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-sm shadow-amber-500/20 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Authorize & Approve</span>
                      </button>
                    ) : campaign.status === 'approved' ? (
                      <button
                        onClick={() => handleOpenApprovalModal(campaign)}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-colors"
                      >
                        <Send className="w-4 h-4" />
                        <span>Execute Send</span>
                      </button>
                    ) : campaign.status === 'draft' ? (
                      <button
                        onClick={() => updateCampaignStatus(campaign.id, 'pending_approval')}
                        className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        Submit for Approval
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Confirmed
                      </span>
                    )}
                  </div>
                </div>

                {/* Recipient breakdown bar */}
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex flex-wrap items-center gap-5">
                    <div className="flex items-center gap-1.5 font-medium text-slate-700">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span>{counts.activeAudienceCount} Valid Recipients</span>
                    </div>

                    {campaign.selectedChannels.includes('email') && (
                      <div className="flex items-center gap-1.5 text-blue-700 font-medium">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{counts.emailEligible} Email Queue</span>
                      </div>
                    )}

                    {campaign.selectedChannels.includes('whatsapp') && (
                      <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{counts.whatsappEligible} WhatsApp Queue</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 text-slate-500">
                      <span className="w-2 h-2 rounded-full bg-rose-400" />
                      <span>{counts.optedOutExcluded} Opt-outs Excluded</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    Created: {new Date(campaign.createdAt).toLocaleDateString()}
                    {campaign.approvedBy && ` &bull; Approved by ${campaign.approvedBy}`}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* EXPLICIT APPROVAL & SEND CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {isApprovalModalOpen && selectedCampaign && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Explicit Campaign Authorization Gate
                  </h3>
                  <p className="text-xs text-slate-500">
                    Mandatory sign-off before campaign release: {selectedCampaign.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsApprovalModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Recipient summary cards */}
            {(() => {
              const counts = calculateRecipients(selectedCampaign);
              return (
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] text-slate-500 uppercase font-semibold">Active Audience</span>
                    <p className="text-xl font-bold text-slate-900 mt-1">{counts.activeAudienceCount}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                    <span className="text-[11px] text-blue-700 uppercase font-semibold">Email Eligible</span>
                    <p className="text-xl font-bold text-blue-700 mt-1">{counts.emailEligible}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-[11px] text-emerald-700 uppercase font-semibold">WhatsApp Eligible</span>
                    <p className="text-xl font-bold text-emerald-700 mt-1">{counts.whatsappEligible}</p>
                  </div>
                </div>
              );
            })()}

            {/* Test Mode Selector */}
            <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TestTube className="w-4 h-4 text-purple-600" />
                  <span className="font-bold text-purple-900">Test Mode (Recommended for Dry Runs)</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTestMode}
                    onChange={(e) => setIsTestMode(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {isTestMode ? (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-purple-900 font-medium mb-1">Test Email Target</label>
                    <input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      className="w-full p-2 bg-white border border-purple-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-purple-900 font-medium mb-1">Test WhatsApp Target</label>
                    <input
                      type="text"
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                      className="w-full p-2 bg-white border border-purple-200 rounded-lg text-slate-800"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-purple-800 text-[11px]">
                  Test Mode is OFF. Campaign will target the full active student list upon provider connectivity.
                </p>
              )}
            </div>

            {/* Mandatory Sign-Off Checklist */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Mandatory Organizer Verification
              </h4>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkLink}
                  onChange={(e) => setCheckLink(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-brand-600 focus:ring-brand-500"
                />
                <span className="text-slate-700 leading-relaxed">
                  I verify that the registration URL (<strong>{selectedCampaign.registrationUrl}</strong>) and event itinerary are valid and functioning.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkOptOut}
                  onChange={(e) => setCheckOptOut(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-brand-600 focus:ring-brand-500"
                />
                <span className="text-slate-700 leading-relaxed">
                  I confirm that all unsubscribed student contacts are suppressed and compliant with anti-spam outreach policies.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkContent}
                  onChange={(e) => setCheckContent(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-brand-600 focus:ring-brand-500"
                />
                <span className="text-slate-700 leading-relaxed">
                  I have proofread both the Email draft and WhatsApp message body for accuracy and tone suitability.
                </span>
              </label>
            </div>

            {/* Type APPROVE to confirm */}
            <div className="space-y-1.5 text-xs">
              <label className="block font-semibold text-slate-700">
                To confirm authorization, type <span className="font-mono text-brand-600 font-bold">APPROVE</span> below:
              </label>
              <input
                type="text"
                value={approvalSignature}
                onChange={(e) => setApprovalSignature(e.target.value)}
                placeholder="Type APPROVE"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsApprovalModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmApproval}
                disabled={isSubmitting || approvalSignature.trim().toUpperCase() !== 'APPROVE'}
                className="px-5 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-40 rounded-lg shadow-sm transition-colors"
              >
                {isSubmitting ? 'Verifying...' : isTestMode ? 'Authorize Test Dispatch' : 'Approve & Release Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
