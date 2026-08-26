import type { Language } from '../data';

export interface DocentInput {
  placeName: string;
  region: string;
  language: Language;
  evidence: {
    reason: string;
    source: string;
    dataAsOf: string;
  };
}

interface DocentResponse {
  success?: boolean;
  error?: string;
  data?: { script?: string };
}

interface HealthResponse {
  status?: string;
  gemini?: string;
}

const healthRequestTimeoutMs = 5_000;
const docentRequestTimeoutMs = 25_000;

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(timeout);
  }
}

export class DocentApiError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
  ) {
    super(code);
    this.name = 'DocentApiError';
  }
}

export async function isGeminiConfigured(): Promise<boolean> {
  try {
    const response = await fetchWithTimeout('/api/health', undefined, healthRequestTimeoutMs);
    if (!response.ok) return false;
    const payload = (await response.json()) as HealthResponse;
    return payload.status === 'ok' && payload.gemini === 'configured';
  } catch {
    return false;
  }
}

export async function generateDocent(input: DocentInput): Promise<string> {
  const response = await fetchWithTimeout(
    '/api/docent',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
    docentRequestTimeoutMs,
  );

  const payload = (await response.json().catch(() => ({}))) as DocentResponse;
  if (!response.ok || !payload.success || !payload.data?.script) {
    throw new DocentApiError(payload.error || 'docent_request_failed', response.status);
  }

  return payload.data.script;
}
