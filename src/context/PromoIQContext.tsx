import React, { createContext, useContext, useState, useEffect } from 'react';
import { ScreenplayEpisode, PromoCandidate, PromoIQSettings, ScoringWeights, ReviewStatus } from '../types';
import { SAMPLE_MICRODRAMAS } from '../data/sampleMicrodramas';
import { parseScreenplayText } from '../engine/screenplayParser';
import { analyzeEpisodeHeuristic } from '../engine/heuristicEngine';
import { analyzeEpisodeWithGemini } from '../engine/geminiEngine';

interface PromoIQContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  episodes: ScreenplayEpisode[];
  promos: PromoCandidate[];
  isAnalyzing: boolean;
  analysisProgress: number;
  settings: PromoIQSettings;
  updateSettings: (newSettings: Partial<PromoIQSettings>) => void;
  updateWeights: (newWeights: Partial<ScoringWeights>) => void;
  loadSampleData: () => void;
  uploadFiles: (files: File[]) => Promise<void>;
  runAnalysisOnEpisodes: (episodeIds?: string[]) => Promise<void>;
  updatePromoStatus: (promoId: string, status: ReviewStatus, notes?: string) => void;
  exportAsJSON: () => void;
  exportAsCSV: () => void;
  selectedEpisodeForInspector: ScreenplayEpisode | null;
  setSelectedEpisodeForInspector: (ep: ScreenplayEpisode | null) => void;
  activeQCPromo: PromoCandidate | null;
  setActiveQCPromo: (promo: PromoCandidate | null) => void;
  isDemoLoaded: boolean;
}

const defaultWeights: ScoringWeights = {
  openingHook: 0.25,
  cliffhanger: 0.25,
  standaloneClarity: 0.20,
  emotionalIntensity: 0.15,
  narrativeContinuity: 0.10,
  durationSuitability: 0.05
};

const defaultSettings: PromoIQSettings = {
  geminiApiKey: '',
  model: 'gemini-3.8-flash',
  scoringWeights: defaultWeights,
  minDurationSeconds: 20,
  maxDurationSeconds: 60
};

const PromoIQContext = createContext<PromoIQContextType | undefined>(undefined);

export const PromoIQProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [episodes, setEpisodes] = useState<ScreenplayEpisode[]>([]);
  const [promos, setPromos] = useState<PromoCandidate[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [isDemoLoaded, setIsDemoLoaded] = useState<boolean>(false);
  const [selectedEpisodeForInspector, setSelectedEpisodeForInspector] = useState<ScreenplayEpisode | null>(null);
  const [activeQCPromo, setActiveQCPromo] = useState<PromoCandidate | null>(null);

  const [settings, setSettings] = useState<PromoIQSettings>(() => {
    const saved = localStorage.getItem('promoiq_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Normalize model to gemini-3.8-flash if legacy name was stored
        if (parsed.model === 'gemini-1.5-flash' || !parsed.model) {
          parsed.model = 'gemini-3.8-flash';
        }
        return { ...defaultSettings, ...parsed };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('promoiq_settings', JSON.stringify(settings));
  }, [settings]);

  // Pre-load demo microdramas on initial mount for instant evaluation
  useEffect(() => {
    loadSampleData();
  }, []);

  const updateSettings = (newSettings: Partial<PromoIQSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const updateWeights = (newWeights: Partial<ScoringWeights>) => {
    setSettings(prev => {
      const mergedWeights = { ...prev.scoringWeights, ...newWeights };
      return { ...prev, scoringWeights: mergedWeights };
    });
  };

  const loadSampleData = () => {
    const parsed = SAMPLE_MICRODRAMAS.map(s => parseScreenplayText(s.content, s.episodeNumber, s.title));
    setEpisodes(parsed);
    setIsDemoLoaded(true);

    // Run initial heuristic extraction for fast zero-wait experience
    const initialCandidates: PromoCandidate[] = [];
    parsed.forEach(ep => {
      const cands = analyzeEpisodeHeuristic(ep, settings.scoringWeights, settings.minDurationSeconds, settings.maxDurationSeconds);
      initialCandidates.push(...cands);
    });
    setPromos(initialCandidates);
  };

  const uploadFiles = async (files: File[]) => {
    setIsDemoLoaded(false);
    const newEpisodes: ScreenplayEpisode[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const text = await file.text();
      const epNum = i + 1;
      const title = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
      const parsed = parseScreenplayText(text, epNum, title);
      newEpisodes.push(parsed);
    }

    setEpisodes(newEpisodes);
    setPromos([]);
  };

  const runAnalysisOnEpisodes = async (episodeIds?: string[]) => {
    setIsAnalyzing(true);
    setAnalysisProgress(5);
    const targetEpisodes = episodeIds
      ? episodes.filter(e => episodeIds.includes(e.id))
      : episodes;

    const allNewCandidates: PromoCandidate[] = [];

    for (let i = 0; i < targetEpisodes.length; i++) {
      const ep = targetEpisodes[i];
      let results: PromoCandidate[] = [];

      try {
        results = await analyzeEpisodeWithGemini(ep, settings.model, settings.scoringWeights);
      } catch (err) {
        console.warn('Analysis error for episode:', ep.title, err);
        results = analyzeEpisodeHeuristic(ep, settings.scoringWeights, settings.minDurationSeconds, settings.maxDurationSeconds);
      }

      allNewCandidates.push(...results);
      setAnalysisProgress(Math.round(((i + 1) / targetEpisodes.length) * 100));
    }

    setPromos(prev => {
      const otherPromos = episodeIds
        ? prev.filter(p => !episodeIds.includes(p.episodeId))
        : [];
      return [...otherPromos, ...allNewCandidates].sort((a, b) => b.overall_score - a.overall_score);
    });

    setIsAnalyzing(false);
  };

  const updatePromoStatus = (promoId: string, status: ReviewStatus, notes?: string) => {
    setPromos(prev => prev.map(p => {
      if (p.id === promoId) {
        return {
          ...p,
          review_status: status,
          editor_notes: notes !== undefined ? notes : p.editor_notes
        };
      }
      return p;
    }));
  };

  const exportAsJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(promos, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `PromoIQ_Export_${Date.now()}.json`);
    dlAnchor.click();
  };

  const exportAsCSV = () => {
    const headers = ['Episode', 'Start Timestamp', 'End Timestamp', 'Duration (s)', 'Overall Score', 'Hook Score', 'Cliffhanger Score', 'Status', 'Hook', 'Cliffhanger', 'Engine'];
    const rows = promos.map(p => [
      p.episode,
      p.start_timestamp,
      p.end_timestamp,
      p.duration_seconds,
      p.overall_score,
      p.hook_score,
      p.cliffhanger_score,
      p.review_status,
      `"${p.hook.replace(/"/g, '""')}"`,
      `"${p.cliffhanger.replace(/"/g, '""')}"`,
      p.discovery_engine
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const dl = document.createElement('a');
    dl.setAttribute('href', encodeURI(csvContent));
    dl.setAttribute('download', `PromoIQ_Recommendations_${Date.now()}.csv`);
    dl.click();
  };

  return (
    <PromoIQContext.Provider value={{
      activeTab,
      setActiveTab,
      episodes,
      promos,
      isAnalyzing,
      analysisProgress,
      settings,
      updateSettings,
      updateWeights,
      loadSampleData,
      uploadFiles,
      runAnalysisOnEpisodes,
      updatePromoStatus,
      exportAsJSON,
      exportAsCSV,
      selectedEpisodeForInspector,
      setSelectedEpisodeForInspector,
      activeQCPromo,
      setActiveQCPromo,
      isDemoLoaded
    }}>
      {children}
    </PromoIQContext.Provider>
  );
};

export const usePromoIQ = () => {
  const context = useContext(PromoIQContext);
  if (!context) throw new Error('usePromoIQ must be used within PromoIQProvider');
  return context;
};
