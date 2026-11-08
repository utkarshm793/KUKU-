import React, { useState } from 'react';
import { usePromoIQ } from '../context/PromoIQContext';
import { RotateCcw, Check } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const { settings, updateSettings, updateWeights } = usePromoIQ();
  const [savedAlert, setSavedAlert] = useState<boolean>(false);

  const weights = settings.scoringWeights;

  const handleWeightChange = (key: keyof typeof weights, value: number) => {
    updateWeights({ [key]: value / 100 });
  };

  const resetDefaultWeights = () => {
    updateWeights({
      openingHook: 0.25,
      cliffhanger: 0.25,
      standaloneClarity: 0.20,
      emotionalIntensity: 0.15,
      narrativeContinuity: 0.10,
      durationSuitability: 0.05
    });
  };

  const handleSaveModel = () => {
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-10">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Settings & Scoring</h2>
        <p className="text-xs text-slate-500">Fine-tune discovery weights and model preference.</p>
      </div>

      {/* Model Selection */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-xs font-semibold text-slate-800">Model Provider</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-medium text-slate-600 block mb-1">Gemini Model</label>
            <select
              value={settings.model}
              onChange={e => updateSettings({ model: e.target.value as any })}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
            >
              <option value="gemini-3.8-flash">Gemini 3.8 Flash (Fast, Recommended)</option>
              <option value="gemini-4-argon">Gemini 4 Argon (Deep Reasoning)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-600 block mb-1">API Key</label>
            <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-lg text-xs text-emerald-700 font-medium flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Configured securely</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSaveModel}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-medium transition cursor-pointer shadow-xs"
        >
          {savedAlert ? <Check className="w-3.5 h-3.5" /> : null}
          <span>{savedAlert ? 'Saved' : 'Save'}</span>
        </button>
      </div>

      {/* Scoring Weights */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-800">Scoring Weights</h3>
          <button
            onClick={resetDefaultWeights}
            className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        <div className="space-y-3">
          {[
            { key: 'openingHook', label: 'Opening Hook', val: weights.openingHook, max: 50 },
            { key: 'cliffhanger', label: 'Cliffhanger Suspense', val: weights.cliffhanger, max: 50 },
            { key: 'standaloneClarity', label: 'Standalone Clarity', val: weights.standaloneClarity, max: 40 },
            { key: 'emotionalIntensity', label: 'Emotional Tension', val: weights.emotionalIntensity, max: 30 },
            { key: 'narrativeContinuity', label: 'Narrative Flow', val: weights.narrativeContinuity, max: 30 },
            { key: 'durationSuitability', label: 'Duration Fit', val: weights.durationSuitability, max: 20 },
          ].map(item => (
            <div key={item.key}>
              <div className="flex justify-between text-xs text-slate-700 mb-1">
                <span>{item.label}</span>
                <span className="font-mono text-slate-500">{Math.round(item.val * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max={item.max}
                value={item.val * 100}
                onChange={e => handleWeightChange(item.key as any, Number(e.target.value))}
                className="w-full accent-violet-600 cursor-pointer h-1 bg-slate-100 rounded-lg appearance-none"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
