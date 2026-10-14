import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { ContactsView } from './components/contacts/ContactsView';
import { CampaignsView } from './components/campaigns/CampaignsView';
import { AIMessageStudioView } from './components/studio/AIMessageStudioView';
import { TemplatesView } from './components/templates/TemplatesView';
import { DeliveryReportsView } from './components/reports/DeliveryReportsView';

const MainContent: React.FC = () => {
  const { activeTab, loading } = useApp();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Loading Quantix Promotion Agent...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'contacts' && <ContactsView />}
        {activeTab === 'campaigns' && <CampaignsView />}
        {activeTab === 'studio' && <AIMessageStudioView />}
        {activeTab === 'templates' && <TemplatesView />}
        {activeTab === 'reports' && <DeliveryReportsView />}

      </div>
    </main>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Header />
            <MainContent />
          </div>
        </div>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
