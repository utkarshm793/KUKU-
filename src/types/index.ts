export interface ScreenplayDialogue {
  id: string;
  speaker: string;
  text: string;
  startTimestamp: string; // e.g. "00:15.20"
  endTimestamp: string;   // e.g. "00:22.00"
  startSeconds: number;
  endSeconds: number;
  isAction?: boolean;
}

export interface ScreenplayEpisode {
  id: string;
  episodeNumber: number;
  title: string;
  totalDurationSeconds: number;
  events: ScreenplayDialogue[];
  rawText: string;
}

export type ReviewStatus = 'Pending' | 'Approved' | 'Rejected';

export interface QualityWarning {
  code: string;
  level: 'info' | 'warning' | 'error';
  message: string;
}

export interface PromoCandidate {
  id: string;
  episode: number;
  episodeId: string;
  start_timestamp: string;
  end_timestamp: string;
  start_seconds: number;
  end_seconds: number;
  duration_seconds: number;
  hook: string;
  cliffhanger: string;
  dialogue_snippets: ScreenplayDialogue[];
  hook_score: number;             // 0-100
  cliffhanger_score: number;      // 0-100
  standalone_clarity: number;     // 0-100
  emotional_intensity: number;    // 0-100
  narrative_continuity: number;   // 0-100
  duration_suitability: number;   // 0-100
  overall_score: number;          // Weighted composite 0-100
  reason: string;
  quality_warnings: QualityWarning[];
  review_status: ReviewStatus;
  editor_notes?: string;
  discovery_engine: 'gemini-3.8-flash' | 'gemini-4-argon' | 'heuristic-fallback';
}

export interface ScoringWeights {
  openingHook: number;        // default 0.25
  cliffhanger: number;        // default 0.25
  standaloneClarity: number;  // default 0.20
  emotionalIntensity: number; // default 0.15
  narrativeContinuity: number;// default 0.10
  durationSuitability: number;// default 0.05
}

export interface PromoIQSettings {
  geminiApiKey: string;
  model: 'gemini-3.8-flash' | 'gemini-4-argon';
  scoringWeights: ScoringWeights;
  minDurationSeconds: number;
  maxDurationSeconds: number;
}
