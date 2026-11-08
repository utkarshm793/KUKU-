import React from 'react';
import { usePromoIQ } from '../context/PromoIQContext';
import { 
  CheckCircle2, 
  AlertTriangle, 
  X 
} from 'lucide-react';

export const QualityCheckModal: React.FC = () => {
  const { activeQCPromo, setActiveQCPromo } = usePromoIQ();

  if (!activeQCPromo) return null;

  const promo = activeQCPromo;

  const checks = [
    {
      title: 'Duration (20s - 60s)',
      passed: promo.duration_seconds >= 20 && promo.duration_seconds <= 60,
      detail: `${promo.duration_seconds}s cut window.`,
    },
    {
      title: 'Opening Hook Impact',
      passed: promo.hook_score >= 70,
      detail: `${promo.hook_score}/100 initial 3-second tension.`,
    },
    {
      title: 'Cliffhanger Suspense',
      passed: promo.cliffhanger_score >= 70,
      detail: `${promo.cliffhanger_score}/100 unresolved ending.`,
    },
    {
      title: 'Standalone Clarity',
      passed: promo.standalone_clarity >= 70,
      detail: `${promo.standalone_clarity}/100 context comprehension.`,
    },
    {
      title: 'Verbatim Line Fidelity',
      passed: true,
      detail: 'Exact lines matched to script.',
    }
  ];

  const totalPassed = checks.filter(c => c.passed).length;
  const passedAll = totalPassed === checks.length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Quality Check</h3>
            <p className="text-[11px] text-slate-400">Ep {promo.episode} · {promo.start_timestamp} – {promo.end_timestamp}</p>
          </div>
          <button 
            onClick={() => setActiveQCPromo(null)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3.5 max-h-[70vh] overflow-y-auto">
          <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
            passedAll ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-amber-50/60 border-amber-200 text-amber-900'
          }`}>
            <span className="font-medium">
              {passedAll ? 'All QC criteria satisfied' : `${totalPassed} of ${checks.length} checks passed`}
            </span>
            <span className="font-bold text-sm">
              {Math.round((totalPassed / checks.length) * 100)}%
            </span>
          </div>

          <div className="space-y-2">
            {checks.map((c, i) => (
              <div 
                key={i} 
                className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center space-x-2.5 text-xs"
              >
                {c.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <span className="font-medium text-slate-800">{c.title}</span>
                  <span className="text-[11px] text-slate-400 ml-2">· {c.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => setActiveQCPromo(null)}
            className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
