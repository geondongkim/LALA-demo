import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

export const apiRouter = express.Router();

const supportedLanguages = new Set(['ko', 'en', 'ja', 'zh-CN', 'zh-TW']);
const defaultModel = 'gemini-3.7-flash';
const modelRequestTimeoutMs = 20_000;

interface DocentRequest {
  placeName?: unknown;
  region?: unknown;
  language?: unknown;
  evidence?: {
    reason?: unknown;
    source?: unknown;
    dataAsOf?: unknown;
  };
}

function boundedText(value: unknown, maximumLength: number): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  if (!normalized || normalized.length > maximumLength) return null;
  return normalized;
}

apiRouter.get('/health', (_req, res) => {
  const configured = Boolean(process.env.GEMINI_API_KEY?.trim());
  res.json({
    status: 'ok',
    service: 'lala-travel-demo',
    gemini: configured ? 'configured' : 'not_configured',
  });
});

apiRouter.post('/docent', async (req, res) => {
  const body = (req.body ?? {}) as DocentRequest;
  const placeName = boundedText(body.placeName, 120);
  const region = boundedText(body.region, 120);
  const reason = boundedText(body.evidence?.reason, 500);
  const source = boundedText(body.evidence?.source, 200);
  const dataAsOf = boundedText(body.evidence?.dataAsOf, 120);
  const language = typeof body.language === 'string' && supportedLanguages.has(body.language)
    ? body.language
    : null;

  if (!placeName || !region || !language || !reason || !source || !dataAsOf) {
    res.status(400).json({ success: false, error: 'invalid_request' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    res.status(503).json({ success: false, error: 'gemini_not_configured' });
    return;
  }

  const model = process.env.GEMINI_MODEL?.trim() || defaultModel;
  const evidence = { placeName, region, reason, source, dataAsOf };

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model,
      contents: `Create a short visitor-facing docent script from this evidence only:\n${JSON.stringify(evidence)}`,
      config: {
        httpOptions: { timeout: modelRequestTimeoutMs },
        systemInstruction: [
          'You are the evidence-first LALA travel docent.',
          `Write only in the requested locale: ${language}.`,
          'Use only facts explicitly present in the supplied evidence.',
          'Do not infer history, opening hours, prices, popularity, or accessibility.',
          'Keep it welcoming, concrete, and useful to a first-time visitor.',
          'Return one plain-text script of 2 to 4 concise sentences.',
        ].join(' '),
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            script: { type: Type.STRING },
          },
          required: ['script'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}') as { script?: unknown };
    const script = boundedText(parsed.script, 2000);
    if (!script) throw new Error('InvalidModelResponse');

    res.json({ success: true, data: { script } });
  } catch (error: unknown) {
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    console.error('Gemini docent request failed', { errorName });
    res.status(502).json({ success: false, error: 'gemini_request_failed' });
  }
});
