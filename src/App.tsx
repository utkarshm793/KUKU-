import React from 'react';
import { PromoIQProvider, usePromoIQ } from './context/PromoIQContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { ScreenplayUploader } from './components/ScreenplayUploader';
import { PromoCard } from './components/PromoCard';
import { EpisodeExplorer } from './components/EpisodeExplorer';
import { PromoLibrary } from './components/PromoLibrary';
import { PerformanceInsights } from './components/PerformanceInsights';
import { SettingsModal } from './components/SettingsModal';
import { QualityCheckModal } from './components/QualityCheckModal';

const MainWorkspace: React.FC = () => {
  const { activeTab, promos } = usePromoIQ();

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans text-gray-900 antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {activeTab === 'overview' && <DashboardOverview />}
          {activeTab === 'analyze' && <ScreenplayUploader />}
          {activeTab === 'promos' && (
            <div className="max-w-7xl mx-auto space-y-4 pb-12">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Ranked Promotional Recommendations</h2>
                <p className="text-xs text-gray-500 mt-1">Continuous segments satisfying 20–60s duration with opening hook and unresolved cliffhanger.</p>
              </div>
              <div className="space-y-4">
                {promos.map((p, idx) => (
                  <PromoCard key={p.id} promo={p} rank={idx + 1} />
                ))}
              </div>
            </div>
          )}
          {activeTab === 'episodes' && <EpisodeExplorer />}
          {activeTab === 'library' && <PromoLibrary />}
          {activeTab === 'insights' && <PerformanceInsights />}
          {activeTab === 'settings' && <SettingsModal />}
        </main>
      </div>
      <QualityCheckModal />
    </div>
  );
};

export default function App() {
  return (
    <PromoIQProvider>
      <MainWorkspace />
    </PromoIQProvider>
  );
}
