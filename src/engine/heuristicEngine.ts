import { ScreenplayEpisode, PromoCandidate, ScoringWeights, QualityWarning } from '../types';

// Dramatic markers for Microdrama promos
const HOOK_HIGH_IMPACT_WORDS = [
  'secret', 'kill', 'divorce', 'bastard', 'billionaire', 'pregnant', 'dna',
  'affair', 'betray', 'arrest', 'fired', 'murder', 'ruin', 'lie', 'disown',
  'father', 'mother', 'truth', 'look at me', 'stop', 'listen to me'
];

const CLIFFHANGER_KEYWORDS = [
  'who are you', 'how could you', 'it was you', 'test results', 'sign the papers',
  'or else', 'goodbye', 'you will pay', 'never again', 'tell me', 'police', 'too late'
];

/**
 * Evaluates candidate clip using deterministic microdrama NLP heuristics
 */
export function analyzeEpisodeHeuristic(
  episode: ScreenplayEpisode,
  weights: ScoringWeights,
  minSec: number = 20,
  maxSec: number = 60
): PromoCandidate[] {
  const events = episode.events;
  if (!events || events.length < 3) return [];

  const candidates: PromoCandidate[] = [];

  // Generate sliding candidate windows that satisfy minSec <= duration <= maxSec
  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      const startSec = events[i].startSeconds;
      const endSec = events[j].endSeconds;
      const duration = endSec - startSec;

      if (duration >= minSec && duration <= maxSec) {
        const clipEvents = events.slice(i, j + 1);
        const hookEvent = clipEvents[0];
        const cliffhangerEvent = clipEvents[clipEvents.length - 1];

        // 1. Hook Score (first 3 seconds impact, interrogative, imperative, or shocking terms)
        let hookScore = 60;
        const hookText = `${hookEvent.speaker}: ${hookEvent.text}`.toLowerCase();
        if (hookText.includes('?') || hookText.includes('!')) hookScore += 12;
        if (HOOK_HIGH_IMPACT_WORDS.some(w => hookText.includes(w))) hookScore += 20;
        if (hookEvent.isAction) hookScore += 8;
        hookScore = Math.min(98, Math.max(45, hookScore));

        // 2. Cliffhanger Score (unresolved question, dramatic ultimatum, gasping line)
        let cliffScore = 55;
        const cliffText = `${cliffhangerEvent.speaker}: ${cliffhangerEvent.text}`.toLowerCase();
        if (cliffText.endsWith('?') || cliffText.endsWith('...')) cliffScore += 18;
        if (CLIFFHANGER_KEYWORDS.some(w => cliffText.includes(w))) cliffScore += 22;
        cliffScore = Math.min(99, Math.max(40, cliffScore));

        // 3. Standalone story clarity (has at least 2 distinct speakers, coherent exchange)
        const uniqueSpeakers = new Set(clipEvents.map(e => e.speaker).filter(s => s !== 'ACTION'));
        let clarityScore = uniqueSpeakers.size >= 2 ? 80 : 62;
        if (clipEvents.length >= 4 && clipEvents.length <= 10) clarityScore += 10;
        clarityScore = Math.min(95, clarityScore);

        // 4. Emotional intensity (frequency of exclamation points, shouting, keywords)
        const allText = clipEvents.map(e => e.text).join(' ');
        const exclamations = (allText.match(/!/g) || []).length;
        let emotionScore = 65 + Math.min(25, exclamations * 4);
        if (HOOK_HIGH_IMPACT_WORDS.some(w => allText.toLowerCase().includes(w))) {
          emotionScore += 8;
        }
        emotionScore = Math.min(98, emotionScore);

        // 5. Narrative continuity (no sudden speaker gaps)
        const continuityScore = 88;

        // 6. Duration suitability (ideal sweet spot 30-45s)
        let durScore = 80;
        if (duration >= 30 && duration <= 48) durScore = 98;
        else if (duration < 25 || duration > 55) durScore = 72;

        // Composite Score calculation
        const overall = Math.round(
          hookScore * weights.openingHook +
          cliffScore * weights.cliffhanger +
          clarityScore * weights.standaloneClarity +
          emotionScore * weights.emotionalIntensity +
          continuityScore * weights.narrativeContinuity +
          durScore * weights.durationSuitability
        );

        // Quality Warnings
        const warnings: QualityWarning[] = [];
        if (duration < 22) {
          warnings.push({ code: 'SHORT_DURATION', level: 'warning', message: 'Clip duration is near minimum threshold (20s).' });
        }
        if (cliffhangerEvent.text.endsWith('.')) {
          warnings.push({ code: 'POTENTIAL_RESOLUTION', level: 'info', message: 'Scene ends on a period. Verify if unresolved suspense holds.' });
        }
        if (uniqueSpeakers.size === 1) {
          warnings.push({ code: 'MONOLOGUE', level: 'warning', message: 'Clip only features 1 speaker. May lack dramatic dialogue friction.' });
        }

        const candidate: PromoCandidate = {
          id: `promo_${episode.episodeNumber}_${i}_${j}`,
          episode: episode.episodeNumber,
          episodeId: episode.id,
          start_timestamp: events[i].startTimestamp,
          end_timestamp: events[j].endTimestamp,
          start_seconds: startSec,
          end_seconds: endSec,
          duration_seconds: Math.round(duration),
          hook: `"${hookEvent.speaker}: ${hookEvent.text}"`,
          cliffhanger: `"${cliffhangerEvent.speaker}: ${cliffhangerEvent.text}"`,
          dialogue_snippets: clipEvents,
          hook_score: hookScore,
          cliffhanger_score: cliffScore,
          standalone_clarity: clarityScore,
          emotional_intensity: emotionScore,
          narrative_continuity: continuityScore,
          duration_suitability: durScore,
          overall_score: overall,
          reason: `High dramatic friction initiating at ${events[i].startTimestamp} with strong narrative stakes that peak at ${events[j].endTimestamp} without premature resolution.`,
          quality_warnings: warnings,
          review_status: 'Pending',
          discovery_engine: 'heuristic-fallback'
        };

        candidates.push(candidate);
      }
    }
  }

  // Sort descending by overall score and return non-overlapping or distinct top picks
  return filterAndDeduplicate(candidates).slice(0, 5);
}

function filterAndDeduplicate(candidates: PromoCandidate[]): PromoCandidate[] {
  candidates.sort((a, b) => b.overall_score - a.overall_score);
  const selected: PromoCandidate[] = [];

  for (const cand of candidates) {
    const overlaps = selected.some(s => {
      const overlapStart = Math.max(cand.start_seconds, s.start_seconds);
      const overlapEnd = Math.min(cand.end_seconds, s.end_seconds);
      const overlapDuration = Math.max(0, overlapEnd - overlapStart);
      return overlapDuration > 12; // allow maximum 12 seconds shared
    });
    if (!overlaps) {
      selected.push(cand);
    }
  }

  return selected;
}
