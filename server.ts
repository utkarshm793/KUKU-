import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI server client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

// Server-side Gemini Promo Analysis Endpoint
app.post('/api/gemini/analyze-screenplay', async (req, res) => {
  const { episode, model = 'gemini-3.8-flash' } = req.body;

  if (!episode || !episode.rawText) {
    return res.status(400).json({ error: 'Episode data with rawText is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    // Return fallback signal so client seamlessly uses deterministic heuristics
    return res.json({ fallback: true, reason: 'No server GEMINI_API_KEY configured' });
  }

  // Model validation: gemini-3.8-flash or gemini-4-argon
  const validModel = model === 'gemini-4-argon' ? 'gemini-4-argon' : 'gemini-3.8-flash';

  const prompt = `
You are the Lead Promo Intelligence Architect for Kuku's AI microdrama studio.
Analyze this timestamped screenplay for Episode ${episode.episodeNumber}: "${episode.title}".
Extract 1 to 3 non-overlapping promotional moments between 20 and 60 seconds duration for TikTok/Reels/Shorts.

CRITICAL RULES:
1. ONLY select exact timestamps that exist in the screenplay. DO NOT invent dialogue or scenes.
2. The promo must start with a high-impact hook in the first 3 seconds (shocking revelation, confrontation, ultimatum, or action).
3. The promo must end on an unresolved, suspenseful cliffhanger or dramatic ultimatum so viewers feel compelled to watch the full episode.
4. It must be standalone and comprehensible to a first-time vertical viewer.

SCREENPLAY TEXT:
${episode.rawText}
`;

  try {
    const response = await ai.models.generateContent({
      model: validModel,
      contents: prompt,
      config: {
        systemInstruction: "You are an expert video viral marketing director and script editor for vertical microdramas.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              start_timestamp: {
                type: Type.STRING,
                description: "Starting timestamp format MM:SS.ms"
              },
              end_timestamp: {
                type: Type.STRING,
                description: "Ending timestamp format MM:SS.ms"
              },
              duration_seconds: {
                type: Type.NUMBER,
                description: "Total duration of this promo clip in seconds"
              },
              hook: {
                type: Type.STRING,
                description: "Exact starting dialogue or action in the first 3 seconds"
              },
              cliffhanger: {
                type: Type.STRING,
                description: "Exact ending line that leaves tension unresolved"
              },
              hook_score: {
                type: Type.NUMBER,
                description: "Score from 0 to 100 on hook impact"
              },
              cliffhanger_score: {
                type: Type.NUMBER,
                description: "Score from 0 to 100 on cliffhanger suspension"
              },
              standalone_clarity: {
                type: Type.NUMBER,
                description: "Score from 0 to 100 on clarity without full story context"
              },
              emotional_intensity: {
                type: Type.NUMBER,
                description: "Score from 0 to 100 on dramatic tension and friction"
              },
              narrative_continuity: {
                type: Type.NUMBER,
                description: "Score from 0 to 100 on conversational flow"
              },
              duration_suitability: {
                type: Type.NUMBER,
                description: "Score from 0 to 100 on duration match (sweet spot 30-45s)"
              },
              reason: {
                type: Type.STRING,
                description: "Detailed creative rationale explaining why this promo drives high conversion"
              }
            },
            propertyOrdering: [
              "start_timestamp",
              "end_timestamp",
              "duration_seconds",
              "hook",
              "cliffhanger",
              "hook_score",
              "cliffhanger_score",
              "standalone_clarity",
              "emotional_intensity",
              "narrative_continuity",
              "duration_suitability",
              "reason"
            ]
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      return res.json({ fallback: true, reason: 'Empty response from model' });
    }

    const candidates = JSON.parse(text);
    return res.json({ fallback: false, candidates });
  } catch (err: any) {
    console.error('Gemini server-side generation error:', err);
    return res.json({ fallback: true, error: err.message || 'Gemini error' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true }
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PromoIQ server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
