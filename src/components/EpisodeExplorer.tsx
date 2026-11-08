import React, { useState } from 'react';
import { usePromoIQ } from '../context/PromoIQContext';
import { ScreenplayEpisode } from '../types';
import { Clapperboard } from 'lucide-react';

export const EpisodeExplorer: React.FC = () => {
  const { episodes, promos, setActiveTab } = usePromoIQ();
  const [selectedEp, setSelectedEp] = useState<ScreenplayEpisode>(episodes[0] || null);

  React.useEffect(() => {
    if (episodes.length > 0 && (!selectedEp || !episodes.some(e => e.id === selectedEp.id))) {
      setSelectedEp(episodes[0]);
    }
  }, [episodes]);

  if (episodes.length === 0) {
    return (
      <div className="bg-white p-10 text-center rounded-xl border border-slate-200">
        <Clapperboard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-xs text-slate-500">No screenplays uploaded yet.</p>
      </div>
    );
  }

  const currentEpisodePromos = promos.filter(p => p.episode === selectedEp?.episodeNumber);

  return (
    <div className="space-y-5 max-w-6xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Episode Explorer</h2>
          <p className="text-xs text-slate-500">Inspect screenplay events and promo placements.</p>
        </div>
      </div>

      {/* Episode Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {episodes.map(ep => {
          const isSelected = selectedEp?.id === ep.id;
          const candidateCount = promos.filter(p => p.episode === ep.episodeNumber).length;
          return (
            <button
              key={ep.id}
              onClick={() => setSelectedEp(ep)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-2 transition cursor-pointer ${
                isSelected
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>Ep {ep.episodeNumber}: {ep.title}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                isSelected ? 'bg-violet-800 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {candidateCount}
              </span>
            </button>
          );
        })}
      </div>

      {selectedEp && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Episode Dialogue Stream */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">{selectedEp.title}</h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  {selectedEp.totalDurationSeconds}s total runtime
                </p>
              </div>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">
                {selectedEp.events.length} lines
              </span>
            </div>

            {/* Timeline Visualizer */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>00:00</span>
                <span>Promos Highlighted in Purple</span>
                <span>{selectedEp.totalDurationSeconds}s</span>
              </div>
              <div className="relative w-full h-6 bg-slate-100 rounded-md overflow-hidden border border-slate-200 flex items-center">
                {currentEpisodePromos.map((p, idx) => {
                  const leftPct = (p.start_seconds / selectedEp.totalDurationSeconds) * 100;
                  const widthPct = (p.duration_seconds / selectedEp.totalDurationSeconds) * 100;
                  return (
                    <div
                      key={p.id}
                      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                      className="absolute h-full bg-violet-500/80 border-x border-violet-700 flex items-center justify-center text-[9px] text-white font-bold cursor-pointer hover:bg-violet-600 transition"
                      title={`P${idx + 1}: ${p.start_timestamp} - ${p.end_timestamp}`}
                    >
                      P{idx + 1}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Script lines */}
            <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
              {selectedEp.events.map((ev, i) => (
                <div 
                  key={i} 
                  className={`p-2.5 rounded-lg border text-xs ${
                    ev.isAction 
                      ? 'bg-amber-50/20 border-amber-100/60 text-slate-500 italic' 
                      : 'bg-white border-slate-150'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-0.5">
                    <span className="font-mono text-[10px] text-violet-600 bg-violet-50 px-1 py-0.2 rounded font-medium">
                      {ev.startTimestamp}
                    </span>
                    <span className="font-semibold text-slate-800 text-[11px]">
                      {ev.speaker}
                    </span>
                  </div>
                  <p className="text-slate-700 text-xs">
                    {ev.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Episode Promos Sidebar */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-700">
              Discovered Clips ({currentEpisodePromos.length})
            </h3>
            {currentEpisodePromos.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-5 text-center text-xs text-slate-400">
                No promos for this episode yet.
              </div>
            ) : (
              currentEpisodePromos.map((p, idx) => (
                <div key={p.id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">
                      Clip #{idx + 1} ({p.duration_seconds}s)
                    </span>
                    <span className="font-bold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded text-[11px]">
                      {p.overall_score} pts
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {p.start_timestamp} – {p.end_timestamp}
                  </div>
                  <p className="text-slate-600 bg-slate-50 p-2 rounded line-clamp-2">
                    <span className="font-medium text-slate-800">Hook: </span>{p.hook}
                  </p>
                  <button
                    onClick={() => setActiveTab('promos')}
                    className="w-full text-center text-[11px] font-medium text-violet-600 hover:text-violet-700 pt-0.5 cursor-pointer"
                  >
                    View Card →
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
