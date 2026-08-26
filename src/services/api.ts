import { ChatMessage, PolishData, PronunciationData, QuizResult, VocabularyCard } from '../types';

export async function fetchChatReply(params: {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  targetLanguage: string;
  nativeLanguage: string;
  scenario: string;
  partnerRole: string;
  userLevel: string;
}): Promise<{
  reply: string;
  translation: string;
  userFeedback: {
    hasCorrection: boolean;
    originalSegment?: string;
    improvedVersion: string;
    explanation: string;
    nuanceTag?: string;
  };
  suggestedReplies: string[];
  keyVocabulary: Array<{
    word: string;
    phonetic?: string;
    meaning: string;
    example?: string;
  }>;
}> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error(`Chat API failed with status ${res.status}`);
  }
  const json = await res.json();
  return json.data;
}

export async function evaluatePronunciation(params: {
  phrase: string;
  targetLanguage: string;
  nativeLanguage: string;
}): Promise<PronunciationData> {
  const res = await fetch('/api/pronunciation-evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error(`Pronunciation API failed with status ${res.status}`);
  }
  const json = await res.json();
  return json.data;
}

export async function polishSentence(params: {
  text: string;
  targetLanguage: string;
  nativeLanguage: string;
}): Promise<PolishData> {
  const res = await fetch('/api/polish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error(`Polish API failed with status ${res.status}`);
  }
  const json = await res.json();
  return json.data;
}

export async function generateWordLab(params: {
  topic: string;
  targetLanguage: string;
  nativeLanguage: string;
  count?: number;
}): Promise<{ topicOverview: string; cards: VocabularyCard[] }> {
  const res = await fetch('/api/word-lab', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error(`Word Lab API failed with status ${res.status}`);
  }
  const json = await res.json();
  return json.data;
}

export async function generateQuiz(params: {
  topic: string;
  targetLanguage: string;
  nativeLanguage: string;
  level?: string;
}): Promise<QuizResult> {
  const res = await fetch('/api/quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error(`Quiz API failed with status ${res.status}`);
  }
  const json = await res.json();
  return json.data;
}
