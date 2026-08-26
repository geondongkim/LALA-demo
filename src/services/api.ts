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
    const response = await fetch('/api/health');
    if (!response.ok) return false;
    const payload = (await response.json()) as HealthResponse;
    return payload.status === 'ok' && payload.gemini === 'configured';
  } catch {
    return false;
  }
}

export async function generateDocent(input: DocentInput): Promise<string> {
  const response = await fetch('/api/docent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  const payload = (await response.json().catch(() => ({}))) as DocentResponse;
  if (!response.ok || !payload.success || !payload.data?.script) {
    throw new DocentApiError(payload.error || 'docent_request_failed', response.status);
  }

  return payload.data.script;
}
