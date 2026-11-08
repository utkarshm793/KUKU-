import React, { useState } from 'react';
import { usePromoIQ } from '../context/PromoIQContext';
import { 
  Search, 
  Download, 
  Check, 
  X, 
  ShieldCheck 
} from 'lucide-react';

export const PromoLibrary: React.FC = () => {
  const { promos, updatePromoStatus, exportAsCSV, exportAsJSON, setActiveQCPromo } = usePromoIQ();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [minScore, setMinScore] = useState<number>(0);

  const filteredPromos = promos.filter(p => {
    const matchesSearch = 
      p.hook.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.cliffhanger.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.reason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.review_status === statusFilter;
    const matchesScore = p.overall_score >= minScore;
    return matchesSearch && matchesStatus && matchesScore;
  });

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Promo Library</h2>
          <p className="text-xs text-slate-500">Review and approve promotional cuts.</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={exportAsJSON}
            className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 transition cursor-pointer"
          >
            JSON
          </button>
          <button
            onClick={exportAsCSV}
            className="flex items-center space-x-1 px-3 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-medium hover:bg-violet-700 transition cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center space-x-2 flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search dialogue lines..."
            className="w-full text-xs bg-transparent focus:outline-none text-slate-800 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg">
            {['All', 'Approved', 'Pending', 'Rejected'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 py-0.5 rounded-md font-medium text-[11px] transition cursor-pointer ${
                  statusFilter === status 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <select
            value={minScore}
            onChange={e => setMinScore(Number(e.target.value))}
            className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-700"
          >
            <option value={0}>All Scores</option>
            <option value={70}>70+ pts</option>
            <option value={80}>80+ pts</option>
            <option value={85}>85+ pts</option>
          </select>
        </div>
      </div>

      {/* Promos Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200/80">
              <tr>
                <th className="p-3 pl-4">Ep</th>
                <th className="p-3">Timestamps</th>
                <th className="p-3">Duration</th>
                <th className="p-3">Score</th>
                <th className="p-3">Hook & Cliffhanger</th>
                <th className="p-3">Status</th>
                <th className="p-3 pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPromos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400">
                    No matching promo candidates found.
                  </td>
                </tr>
              ) : (
                filteredPromos.map(promo => (
                  <tr key={promo.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3 pl-4 font-mono font-semibold text-slate-800">
                      {promo.episode}
                    </td>
                    <td className="p-3 font-mono text-slate-600 whitespace-nowrap">
                      {promo.start_timestamp} – {promo.end_timestamp}
                    </td>
                    <td className="p-3 font-mono text-slate-800">
                      {promo.duration_seconds}s
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-slate-900">{promo.overall_score}</span>
                    </td>
                    <td className="p-3 max-w-sm">
                      <p className="truncate text-slate-800 font-medium">{promo.hook}</p>
                      <p className="truncate text-slate-400 text-[11px]">{promo.cliffhanger}</p>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        promo.review_status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        promo.review_status === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {promo.review_status}
                      </span>
                    </td>
                    <td className="p-3 pr-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => updatePromoStatus(promo.id, 'Approved')}
                          className={`p-1 rounded border cursor-pointer ${
                            promo.review_status === 'Approved' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-400 border-slate-200 hover:text-emerald-600'
                          }`}
                          title="Approve"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => updatePromoStatus(promo.id, 'Rejected')}
                          className={`p-1 rounded border cursor-pointer ${
                            promo.review_status === 'Rejected' ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-slate-400 border-slate-200 hover:text-rose-600'
                          }`}
                          title="Reject"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setActiveQCPromo(promo)}
                          className="p-1 rounded border bg-white text-slate-400 border-slate-200 hover:text-violet-600 cursor-pointer"
                          title="Audit"
                        >
                          <ShieldCheck className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
