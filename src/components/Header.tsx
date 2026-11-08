import React from 'react';
import { usePromoIQ } from '../context/PromoIQContext';
import { Sparkles, Download } from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    runAnalysisOnEpisodes, 
    isAnalyzing, 
    promos, 
    exportAsCSV, 
    isDemoLoaded 
  } = usePromoIQ();

  return (
    <header className="h-14 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 flex items-center justify-between z-10">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-slate-600">Ready</span>
        </div>
        {isDemoLoaded && (
          <span className="bg-slate-100 text-slate-600 text-[11px] px-2 py-0.5 rounded-full font-medium">
            Demo Project
          </span>
        )}
      </div>

      <div className="flex items-center space-x-2.5">
        <button
          onClick={exportAsCSV}
          disabled={promos.length === 0}
          className="flex items-center space-x-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg transition disabled:opacity-40 cursor-pointer shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export</span>
        </button>

        <button
          onClick={() => runAnalysisOnEpisodes()}
          disabled={isAnalyzing}
          className="flex items-center space-x-1.5 text-xs font-medium text-white bg-violet-600 hover:bg-violet-700 px-3.5 py-1.5 rounded-lg shadow-xs transition disabled:opacity-50 cursor-pointer"
        >
          {isAnalyzing ? (
            <>
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Scanning...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Find Promos</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
