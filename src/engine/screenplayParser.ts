import { ScreenplayDialogue, ScreenplayEpisode } from '../types';

/**
 * Parses timestamp string "MM:SS.ms" or "HH:MM:SS" into decimal seconds
 */
export function timestampToSeconds(ts: string): number {
  const clean = ts.trim().replace(/[\[\]\(\)]/g, '');
  const parts = clean.split(':');
  if (parts.length === 2) {
    const mins = parseFloat(parts[0]) || 0;
    const secs = parseFloat(parts[1]) || 0;
    return mins * 60 + secs;
  } else if (parts.length === 3) {
    const hrs = parseFloat(parts[0]) || 0;
    const mins = parseFloat(parts[1]) || 0;
    const secs = parseFloat(parts[2]) || 0;
    return hrs * 3600 + mins * 60 + secs;
  }
  return 0;
}

export function secondsToTimestamp(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  const ms = Math.floor((secs - Math.floor(secs)) * 100);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

/**
 * Universal Screenplay Parser
 * Handles:
 * 1. Timestamped dialogue: [00:12.50 - 00:16.80] KAVYA: You've been lying to me!
 * 2. Range lines: 00:15 - 00:25 DEV: I did it to protect our family.
 * 3. CSV format: Timestamp_Start,Timestamp_End,Character,Dialogue
 */
export function parseScreenplayText(content: string, episodeNum: number = 1, title: string = ''): ScreenplayEpisode {
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  const events: ScreenplayDialogue[] = [];
  let maxSecs = 0;

  const timestampRangeRegex = /\[?(\d{1,2}:\d{2}(?:\.\d{1,3})?)\s*(?:-|to|–)\s*(\d{1,2}:\d{2}(?:\.\d{1,3})?)\]?\s*([A-Za-z0-9_\s]+?):\s*(.+)/i;
  const singleTimestampRegex = /\[?(\d{1,2}:\d{2}(?:\.\d{1,3})?)\]?\s*([A-Za-z0-9_\s]+?):\s*(.+)/i;
  const actionRegex = /\[?(\d{1,2}:\d{2}(?:\.\d{1,3})?)\]?\s*\[ACTION\]\s*(.+)/i;

  let lastEnd = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // CSV format check
    if (line.includes(',') && (line.toLowerCase().includes('start') || (i === 0 && line.split(',').length >= 3))) {
      continue; // Skip CSV headers
    }
    const csvParts = line.split(',');
    if (csvParts.length >= 4 && /^\d{1,2}:\d{2}/.test(csvParts[0].trim())) {
      const startS = timestampToSeconds(csvParts[0]);
      const endS = timestampToSeconds(csvParts[1]);
      const speaker = csvParts[2].trim();
      const text = csvParts.slice(3).join(',').replace(/^"|"$/g, '').trim();
      events.push({
        id: `ep${episodeNum}_ev_${i}`,
        speaker,
        text,
        startTimestamp: secondsToTimestamp(startS),
        endTimestamp: secondsToTimestamp(endS),
        startSeconds: startS,
        endSeconds: endS,
        isAction: speaker.toUpperCase() === 'ACTION'
      });
      maxSecs = Math.max(maxSecs, endS);
      continue;
    }

    // Match Action format
    const actionMatch = line.match(actionRegex);
    if (actionMatch) {
      const startS = timestampToSeconds(actionMatch[1]);
      const endS = startS + 2.5;
      events.push({
        id: `ep${episodeNum}_ev_${i}`,
        speaker: 'ACTION',
        text: actionMatch[2],
        startTimestamp: secondsToTimestamp(startS),
        endTimestamp: secondsToTimestamp(endS),
        startSeconds: startS,
        endSeconds: endS,
        isAction: true
      });
      maxSecs = Math.max(maxSecs, endS);
      continue;
    }

    // Match Range timestamp format
    const rangeMatch = line.match(timestampRangeRegex);
    if (rangeMatch) {
      const startS = timestampToSeconds(rangeMatch[1]);
      const endS = timestampToSeconds(rangeMatch[2]);
      events.push({
        id: `ep${episodeNum}_ev_${i}`,
        speaker: rangeMatch[3].trim(),
        text: rangeMatch[4].trim(),
        startTimestamp: secondsToTimestamp(startS),
        endTimestamp: secondsToTimestamp(endS),
        startSeconds: startS,
        endSeconds: endS,
        isAction: false
      });
      maxSecs = Math.max(maxSecs, endS);
      lastEnd = endS;
      continue;
    }

    // Match Single timestamp format
    const singleMatch = line.match(singleTimestampRegex);
    if (singleMatch) {
      const startS = timestampToSeconds(singleMatch[1]);
      const estimatedDuration = Math.max(2.0, Math.min(6.0, singleMatch[3].split(' ').length * 0.35));
      const endS = startS + estimatedDuration;
      events.push({
        id: `ep${episodeNum}_ev_${i}`,
        speaker: singleMatch[2].trim(),
        text: singleMatch[3].trim(),
        startTimestamp: secondsToTimestamp(startS),
        endTimestamp: secondsToTimestamp(endS),
        startSeconds: startS,
        endSeconds: endS,
        isAction: false
      });
      maxSecs = Math.max(maxSecs, endS);
      lastEnd = endS;
      continue;
    }
  }

  // Fallback if no timestamps were discovered: synthesize incremental timestamps
  if (events.length === 0 && lines.length > 0) {
    let cursor = 0;
    lines.forEach((line, idx) => {
      const colonIndex = line.indexOf(':');
      const speaker = colonIndex > -1 ? line.substring(0, colonIndex).trim() : 'SPEAKER';
      const text = colonIndex > -1 ? line.substring(colonIndex + 1).trim() : line;
      const dur = Math.max(2.5, text.split(' ').length * 0.38);
      const startS = cursor;
      const endS = cursor + dur;
      events.push({
        id: `ep${episodeNum}_synth_${idx}`,
        speaker,
        text,
        startTimestamp: secondsToTimestamp(startS),
        endTimestamp: secondsToTimestamp(endS),
        startSeconds: startS,
        endSeconds: endS,
        isAction: speaker.toUpperCase() === 'ACTION'
      });
      cursor = endS + 0.4;
    });
    maxSecs = cursor;
  }

  return {
    id: `ep_${episodeNum}_${Date.now()}`,
    episodeNumber: episodeNum,
    title: title || `Episode ${episodeNum}`,
    totalDurationSeconds: Math.ceil(maxSecs) || 90,
    events,
    rawText: content
  };
}
