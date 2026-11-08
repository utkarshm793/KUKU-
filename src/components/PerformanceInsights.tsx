import React from 'react';
import { usePromoIQ } from '../context/PromoIQContext';

export const PerformanceInsights: React.FC = () => {
  const { promos } = usePromoIQ();

  const total = promos.length;
  const approved = promos.filter(p => p.review_status === 'Approved').length;
  const rejected = promos.filter(p => p.review_status === 'Rejected').length;
  const pending = promos.filter(p => p.review_status === 'Pending').length;

  const avgHook = total > 0 ? Math.round(promos.reduce((a, b) => a + b.hook_score, 0) / total) : 0;
  const avgCliff = total > 0 ? Math.round(promos.reduce((a, b) => a + b.cliffhanger_score, 0) / total) : 0;

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-10">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Creative Insights</h2>
        <p className="text-xs text-slate-500">Predicted retention patterns based on screenplay structure.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Avg Hook Impact</p>
          <h3 className="text-xl font-bold text-slate-900 mt-0.5">{avgHook}<span className="text-xs font-normal text-slate-400">/100</span></h3>
          <div className="w-full bg-slate-100 h-1 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-violet-600 h-full rounded-full" style={{ width: `${avgHook}%` }} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Avg Cliffhanger Urgency</p>
          <h3 className="text-xl font-bold text-slate-900 mt-0.5">{avgCliff}<span className="text-xs font-normal text-slate-400">/100</span></h3>
          <div className="w-full bg-slate-100 h-1 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${avgCliff}%` }} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Pipeline Status</p>
          <h3 className="text-xl font-bold text-slate-900 mt-0.5">{approved} <span className="text-xs font-normal text-slate-400">Approved</span></h3>
          <p className="text-[11px] text-slate-400 mt-1">{pending} pending · {rejected} rejected</p>
        </div>
      </div>

      {/* Visual Matrix Scatterplot */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-800">Hook Impact vs. Cliffhanger Suspense</h3>
          <span className="text-[10px] text-slate-400">Top-right = optimal retention</span>
        </div>

        <div className="relative h-56 bg-slate-50/80 rounded-xl border border-slate-150 p-3 overflow-hidden">
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-slate-200" />
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-slate-200" />

          <span className="absolute top-2 right-2 text-[9px] font-medium text-emerald-600 uppercase">
            High Retention
          </span>

          {promos.map((p) => {
            const x = Math.min(94, Math.max(6, p.hook_score));
            const y = Math.min(94, Math.max(6, 100 - p.cliffhanger_score));
            return (
              <div
                key={p.id}
                style={{ left: `${x}%`, top: `${y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              >
                <div className={`w-4 h-4 rounded-full border border-white shadow-xs flex items-center justify-center text-[8px] font-bold text-white transition transform group-hover:scale-125 ${
                  p.overall_score >= 85 ? 'bg-emerald-600' : 'bg-violet-600'
                }`}>
                  {p.episode}
                </div>
                <div className="hidden group-hover:block absolute bottom-5 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-md whitespace-nowrap z-20 pointer-events-none">
                  Ep {p.episode} · {p.duration_seconds}s · {p.overall_score} pts
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
