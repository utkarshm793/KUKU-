import React, { useState } from 'react';
import { usePromoIQ } from '../context/PromoIQContext';
import { 
  UploadCloud, 
  Play, 
  Sparkles 
} from 'lucide-react';

export const ScreenplayUploader: React.FC = () => {
  const { uploadFiles, loadSampleData, episodes, runAnalysisOnEpisodes, isAnalyzing, setActiveTab } = usePromoIQ();
  const [dragActive, setDragActive] = useState<boolean>(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      await uploadFiles(filesArray);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      await uploadFiles(filesArray);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-10">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Upload Screenplay</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Drop timestamped .txt or .csv script files.
        </p>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border border-dashed rounded-xl p-8 text-center transition ${
          dragActive
            ? 'border-violet-500 bg-violet-50/40'
            : 'border-slate-200 hover:border-slate-300 bg-white'
        }`}
      >
        <input
          type="file"
          id="screenplay-upload-input"
          multiple
          accept=".txt,.csv,.json"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="flex flex-col items-center pointer-events-none">
          <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center mb-3">
            <UploadCloud className="w-5 h-5" />
          </div>
          <p className="text-xs font-medium text-slate-700">
            Drop script files here or click to browse
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Supports [00:15 - 00:25] dialogue timestamps & CSVs
          </p>
        </div>
      </div>

      {/* Load Sample Data banner */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2.5">
          <Sparkles className="w-4 h-4 text-violet-600" />
          <span className="text-slate-700">Explore with demo microdrama episodes</span>
        </div>
        <button
          onClick={loadSampleData}
          className="px-3 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-medium text-slate-700 transition cursor-pointer"
        >
          Reset Demo
        </button>
      </div>

      {/* Parsed Episodes Preview */}
      {episodes.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-semibold text-slate-900">
              Episodes ({episodes.length})
            </h3>
            <button
              onClick={async () => {
                await runAnalysisOnEpisodes();
                setActiveTab('promos');
              }}
              disabled={isAnalyzing}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-medium transition disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <Play className="w-3 h-3" />
              <span>{isAnalyzing ? 'Analyzing...' : 'Analyze All'}</span>
            </button>
          </div>

          <div className="space-y-2">
            {episodes.map(ep => (
              <div 
                key={ep.id} 
                className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-medium text-slate-800">Ep {ep.episodeNumber}: {ep.title}</h4>
                  <p className="text-[11px] text-slate-400">
                    {ep.events.length} lines · {ep.totalDurationSeconds}s runtime
                  </p>
                </div>

                <button
                  onClick={async () => {
                    await runAnalysisOnEpisodes([ep.id]);
                    setActiveTab('promos');
                  }}
                  className="text-xs font-medium text-violet-600 hover:text-violet-700 cursor-pointer"
                >
                  Analyze
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
