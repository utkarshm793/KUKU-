import React from 'react';
import { usePromoIQ } from '../context/PromoIQContext';
import { PromoCard } from './PromoCard';
import { 
  FileStack, 
  Sparkles, 
  Award, 
  CheckCircle, 
  ArrowRight, 
  UploadCloud, 
  Play
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const { episodes, promos, setActiveTab, runAnalysisOnEpisodes, isAnalyzing } = usePromoIQ();

  const totalEpisodes = episodes.length;
  const totalPromos = promos.length;
  const avgScore = totalPromos > 0 
    ? Math.round(promos.reduce((acc, p) => acc + p.overall_score, 0) / totalPromos) 
    : 0;
  const topCandidate = promos.length > 0 
    ? [...promos].sort((a, b) => b.overall_score - a.overall_score)[0] 
    : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Soothing Hero Card */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-sm border border-slate-800/80">
        <div className="max-w-xl space-y-2.5">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-xs font-medium">
            <Sparkles className="w-3 h-3" />
            <span>Promo Optimizer</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Discover promo clips in seconds.
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Automatically surface high-retention 20–60s hooks and cliffhangers from your microdrama screenplays.
          </p>

          <div className="pt-2 flex flex-wrap gap-2.5">
            <button
              onClick={() => setActiveTab('analyze')}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-white text-slate-900 font-medium text-xs hover:bg-slate-100 transition cursor-pointer shadow-xs"
            >
              <UploadCloud className="w-3.5 h-3.5 text-violet-600" />
              <span>Upload Script</span>
            </button>
            <button
              onClick={() => runAnalysisOnEpisodes()}
              disabled={isAnalyzing || episodes.length === 0}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-violet-600 text-white font-medium text-xs hover:bg-violet-700 transition disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isAnalyzing ? 'Scanning...' : 'Auto Discover'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Episodes</p>
            <h3 className="text-xl font-semibold text-slate-900 mt-0.5">{totalEpisodes}</h3>
          </div>
          <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
            <FileStack className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Promo Cuts</p>
            <h3 className="text-xl font-semibold text-slate-900 mt-0.5">{totalPromos}</h3>
          </div>
          <div className="w-8 h-8 bg-violet-50 text-violet-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Avg Score</p>
            <h3 className="text-xl font-semibold text-slate-900 mt-0.5">{avgScore}<span className="text-xs font-normal text-slate-400">/100</span></h3>
          </div>
          <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Top Match</p>
            <h3 className="text-xl font-semibold text-slate-900 mt-0.5">{topCandidate ? topCandidate.overall_score : 0}<span className="text-xs font-normal text-slate-400">/100</span></h3>
          </div>
          <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Top Recommendations */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Top Recommendations</h2>
            <p className="text-xs text-slate-500">Ranked by hook impact and cliffhanger suspense.</p>
          </div>
          <button
            onClick={() => setActiveTab('promos')}
            className="flex items-center space-x-1 text-xs font-medium text-violet-600 hover:text-violet-700 cursor-pointer"
          >
            <span>View all ({promos.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {promos.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <p className="text-xs text-slate-500 mb-3">No promos discovered yet.</p>
            <button
              onClick={() => runAnalysisOnEpisodes()}
              className="px-3 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-medium cursor-pointer"
            >
              Analyze Demo Screenplays
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {promos.slice(0, 3).map((candidate, idx) => (
              <PromoCard key={candidate.id} promo={candidate} rank={idx + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
