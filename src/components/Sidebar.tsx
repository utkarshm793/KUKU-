import React from 'react';
import { usePromoIQ } from '../context/PromoIQContext';
import { 
  LayoutDashboard, 
  FileText, 
  Sparkles, 
  Clapperboard, 
  BarChart3, 
  Settings, 
  Film
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, promos, episodes } = usePromoIQ();

  const approvedCount = promos.filter(p => p.review_status === 'Approved').length;

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'analyze', label: 'Screenplays', icon: FileText, badge: episodes.length > 0 ? `${episodes.length}` : undefined },
    { id: 'promos', label: 'Recommendations', icon: Sparkles, badge: promos.length > 0 ? `${promos.length}` : undefined },
    { id: 'episodes', label: 'Explorer', icon: Clapperboard },
    { id: 'library', label: 'Library', icon: Film, badge: approvedCount > 0 ? `${approvedCount}` : undefined },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="w-60 bg-[#0F141E] text-slate-300 flex flex-col h-screen border-r border-slate-800/60 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/60 flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center shadow-md shadow-violet-500/20 text-white font-bold text-sm">
          ⚡
        </div>
        <div>
          <h1 className="font-semibold text-white tracking-tight text-sm flex items-center space-x-1.5">
            <span>PromoIQ</span>
            <span className="text-[10px] bg-violet-500/15 text-violet-300 font-mono px-1.5 py-0.2 rounded">STUDIO</span>
          </h1>
          <p className="text-[11px] text-slate-400">Microdrama Promos</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2.5 py-3 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                isActive
                  ? 'bg-violet-600/90 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-violet-800/80 text-violet-100' : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Mini Progress Card */}
      <div className="p-3 m-2.5 bg-slate-900/60 border border-slate-800/80 rounded-xl">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-300 text-[11px] font-medium">Approved Cuts</span>
          <span className="text-[11px] font-mono text-violet-400">{approvedCount} / {promos.length}</span>
        </div>
        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
          <div 
            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${promos.length > 0 ? (approvedCount / promos.length) * 100 : 0}%` }}
          />
        </div>
      </div>
    </aside>
  );
};
