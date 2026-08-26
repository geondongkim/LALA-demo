export type SupportedLanguage = 
  | 'English' 
  | 'Korean' 
  | 'Japanese' 
  | 'Spanish' 
  | 'French' 
  | 'German' 
  | 'Chinese';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  voiceLang: string;
}

export interface Scenario {
  id: string;
  title: string;
  titleKo: string;
  role: string;
  description: string;
  category: 'daily' | 'business' | 'travel' | 'social';
  iconName: string;
  starterPhrase: string;
  initialLalaReply: string;
  initialLalaKo: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  translation?: string;
  timestamp: string;
  feedback?: {
    hasCorrection: boolean;
    originalSegment?: string;
    improvedVersion: string;
    explanation: string;
    nuanceTag?: string;
  };
  suggestedReplies?: string[];
  keyVocabulary?: Array<{
    word: string;
    phonetic?: string;
    meaning: string;
    example?: string;
  }>;
}

export interface PronunciationBreakdown {
  chunk: string;
  stress: string;
  tip: string;
}

export interface PronunciationData {
  ipa: string;
  breakdown: PronunciationBreakdown[];
  linkingRules: string[];
  nativeSpeakerTips: string;
  difficultyScore: number;
}

export interface PolishStyleItem {
  text: string;
  koreanMeaning: string;
  usageContext: string;
}

export interface PolishData {
  originalAnalysis: string;
  styles: {
    casual: PolishStyleItem;
    business: PolishStyleItem;
    idiomatic: PolishStyleItem;
    academic: PolishStyleItem;
  };
  keyPhrases: Array<{
    phrase: string;
    meaning: string;
  }>;
}

export interface VocabularyCard {
  word: string;
  ipa: string;
  partOfSpeech: string;
  koreanDefinition: string;
  englishDefinition?: string;
  collocations: string[];
  exampleSentence: string;
  exampleTranslation: string;
  mnemonicTip?: string;
  tag?: string;
  isBookmarked?: boolean;
}

export interface QuizQuestion {
  id: number;
  question: string;
  situation?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  culturalNuance?: string;
}

export interface QuizResult {
  title: string;
  questions: QuizQuestion[];
}

export type TabMode = 'roleplay' | 'speaking' | 'polish' | 'wordlab' | 'quiz';
