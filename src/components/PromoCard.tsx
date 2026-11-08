import React, { useState } from 'react';
import { PromoCandidate } from '../types';
import { usePromoIQ } from '../context/PromoIQContext';
import { 
  Clock, 
  Check, 
  X, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck
} from 'lucide-react';

interface PromoCardProps {
  promo: PromoCandidate;
  rank: number;
}

export const PromoCard: React.FC<PromoCardProps> = ({ promo, rank }) => {
  const { updatePromoStatus, setActiveQCPromo } = usePromoIQ();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [comment, setComment] = useState<string>(promo.editor_notes || '');

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition duration-150 overflow-hidden">
      {/* Top Bar */}
      <div className="px-4 py-3 bg-slate-50/60 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2.5">
          <span className="w-5 h-5 rounded-md bg-slate-900 text-white font-mono text-[11px] flex items-center justify-center font-bold">
            #{rank}
          </span>
          <span className="font-semibold text-xs text-slate-800">
            Ep {promo.episode}
          </span>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-mono bg-white px-2 py-0.5 rounded border border-slate-200/80">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{promo.start_timestamp} – {promo.end_timestamp}</span>
            <span className="text-slate-300">·</span>
            <span className="font-medium text-slate-700">{promo.duration_seconds}s</span>
          </div>
        </div>

        {/* Score & Actions */}
        <div className="flex items-center space-x-2.5">
          <div className="flex items-baseline space-x-0.5">
            <span className="text-base font-bold text-slate-900">{promo.overall_score}</span>
            <span className="text-[10px] text-slate-400">/100</span>
          </div>

          <div className="h-4 w-[1px] bg-slate-200" />

          <button
            onClick={() => updatePromoStatus(promo.id, 'Approved')}
            className={`p-1 rounded-md border text-xs transition cursor-pointer ${
              promo.review_status === 'Approved'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-slate-500 border-slate-200 hover:text-emerald-700 hover:border-emerald-300'
            }`}
            title="Approve"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => updatePromoStatus(promo.id, 'Rejected')}
            className={`p-1 rounded-md border text-xs transition cursor-pointer ${
              promo.review_status === 'Rejected'
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-white text-slate-500 border-slate-200 hover:text-rose-700 hover:border-rose-300'
            }`}
            title="Reject"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveQCPromo(promo)}
            className="p-1 rounded-md border border-slate-200 bg-white text-slate-500 hover:text-violet-600 transition cursor-pointer"
            title="QC Audit"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Snippets */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
          <div className="bg-violet-50/50 border border-violet-100/70 rounded-lg p-2.5">
            <span className="text-[10px] font-semibold text-violet-800 uppercase tracking-wide block mb-1">
              Hook ({promo.hook_score}%)
            </span>
            <p className="text-slate-800 leading-snug line-clamp-2">
              {promo.hook}
            </p>
          </div>

          <div className="bg-amber-50/50 border border-amber-100/70 rounded-lg p-2.5">
            <span className="text-[10px] font-semibold text-amber-800 uppercase tracking-wide block mb-1">
              Cliffhanger ({promo.cliffhanger_score}%)
            </span>
            <p className="text-slate-800 leading-snug line-clamp-2">
              {promo.cliffhanger}
            </p>
          </div>
        </div>

        {/* Why this works - single quiet line */}
        <p className="text-[11px] text-slate-500 line-clamp-1">
          <span className="font-medium text-slate-700">Rationale: </span>
          {promo.reason}
        </p>

        {/* Expanded View */}
        {isExpanded && (
          <div className="pt-3 border-t border-slate-100 space-y-3 text-xs">
            {/* 6 Score Meters */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-center">
              <div>
                <p className="text-[10px] text-slate-400">Hook</p>
                <p className="font-semibold text-slate-800">{promo.hook_score}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Cliffhanger</p>
                <p className="font-semibold text-slate-800">{promo.cliffhanger_score}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Clarity</p>
                <p className="font-semibold text-slate-800">{promo.standalone_clarity}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Intensity</p>
                <p className="font-semibold text-slate-800">{promo.emotional_intensity}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Continuity</p>
                <p className="font-semibold text-slate-800">{promo.narrative_continuity}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Duration</p>
                <p className="font-semibold text-slate-800">{promo.duration_suitability}</p>
              </div>
            </div>

            {/* Transcript */}
            <div className="space-y-1.5 max-h-40 overflow-y-auto bg-slate-50/70 p-2.5 rounded-lg border border-slate-100 text-[11px]">
              {promo.dialogue_snippets.map((ev, i) => (
                <div key={i} className="flex space-x-2 py-0.5">
                  <span className="font-mono text-slate-400 text-[10px] w-20 flex-shrink-0">
                    {ev.startTimestamp}
                  </span>
                  <span className="font-semibold text-slate-800 flex-shrink-0">
                    {ev.speaker}:
                  </span>
                  <span className="text-slate-600 truncate">
                    {ev.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Production Notes */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Add editor cut notes..."
                className="flex-1 text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
              />
              {comment !== (promo.editor_notes || '') && (
                <button
                  onClick={() => updatePromoStatus(promo.id, promo.review_status, comment)}
                  className="px-2.5 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-medium cursor-pointer"
                >
                  Save
                </button>
              )}
            </div>
          </div>
        )}

        {/* Toggle details */}
        <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
          <span>{promo.dialogue_snippets.length} lines</span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1 text-slate-500 hover:text-slate-800 cursor-pointer font-medium"
          >
            <span>{isExpanded ? 'Less' : 'Details'}</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>
    </div>
  );
};
