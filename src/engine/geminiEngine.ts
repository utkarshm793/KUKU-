import { ScreenplayEpisode, PromoCandidate, ScoringWeights, QualityWarning } from '../types';
import { analyzeEpisodeHeuristic } from './heuristicEngine';

/**
 * Gemini AI structured microdrama promo discovery via server-side proxy
 */
export async function analyzeEpisodeWithGemini(
  episode: ScreenplayEpisode,
  modelName: 'gemini-3.8-flash' | 'gemini-4-argon' = 'gemini-3.8-flash',
  weights: ScoringWeights
): Promise<PromoCandidate[]> {
  try {
    const res = await fetch('/api/gemini/analyze-screenplay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        episode,
        model: modelName,
        weights
      })
    });

    if (!res.ok) {
      console.warn(`Server Gemini route returned status ${res.status}. Falling back to deterministic heuristic engine.`);
      return analyzeEpisodeHeuristic(episode, weights);
    }

    const data = await res.json();
    if (data.fallback || !Array.isArray(data.candidates)) {
      return analyzeEpisodeHeuristic(episode, weights);
    }

    const parsedJson = data.candidates;

    return parsedJson.map((item: any, idx: number) => {
      const overall = Math.round(
        (item.hook_score || 80) * weights.openingHook +
        (item.cliffhanger_score || 80) * weights.cliffhanger +
        (item.standalone_clarity || 80) * weights.standaloneClarity +
        (item.emotional_intensity || 80) * weights.emotionalIntensity +
        (item.narrative_continuity || 80) * weights.narrativeContinuity +
        (item.duration_suitability || 80) * weights.durationSuitability
      );

      const warnings: QualityWarning[] = [];
      const duration = item.duration_seconds || 35;
      if (duration < 20 || duration > 60) {
        warnings.push({ code: 'DURATION_LIMIT', level: 'warning', message: 'AI candidate duration is outside 20-60s window.' });
      }

      // Collect dialogue snippets from episode matching range
      const matchingEvents = episode.events.filter(e => 
        e.startTimestamp >= item.start_timestamp && e.endTimestamp <= item.end_timestamp
      );

      const matchedStartSec = episode.events.find(e => e.startTimestamp === item.start_timestamp)?.startSeconds;
      const matchedEndSec = episode.events.find(e => e.endTimestamp === item.end_timestamp)?.endSeconds;

      return {
        id: `promo_ai_${episode.episodeNumber}_${idx}_${Date.now()}`,
        episode: episode.episodeNumber,
        episodeId: episode.id,
        start_timestamp: item.start_timestamp,
        end_timestamp: item.end_timestamp,
        start_seconds: matchedStartSec !== undefined ? matchedStartSec : (matchingEvents[0]?.startSeconds || 0),
        end_seconds: matchedEndSec !== undefined ? matchedEndSec : (matchingEvents[matchingEvents.length - 1]?.endSeconds || duration),
        duration_seconds: duration,
        hook: item.hook,
        cliffhanger: item.cliffhanger,
        dialogue_snippets: matchingEvents.length > 0 ? matchingEvents : episode.events.slice(0, 4),
        hook_score: item.hook_score || 85,
        cliffhanger_score: item.cliffhanger_score || 85,
        standalone_clarity: item.standalone_clarity || 85,
        emotional_intensity: item.emotional_intensity || 85,
        narrative_continuity: item.narrative_continuity || 85,
        duration_suitability: item.duration_suitability || 85,
        overall_score: overall,
        reason: item.reason || 'Strong emotional cliffhanger and rapid hook identified by Gemini AI.',
        quality_warnings: warnings,
        review_status: 'Pending',
        discovery_engine: modelName
      };
    });
  } catch (err) {
    console.warn('Gemini request failed, fallback to heuristic engine:', err);
    return analyzeEpisodeHeuristic(episode, weights);
  }
}
