import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

export const apiRouter = express.Router();

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: apiKey || 'dummy-key',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// 1. Health check
apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'LALA Language Assistant', timestamp: new Date().toISOString() });
});

// 2. Interactive Roleplay / Chat
apiRouter.post('/chat', async (req, res) => {
  try {
    const {
      messages = [],
      targetLanguage = 'English',
      nativeLanguage = 'Korean',
      scenario = 'Casual Daily Conversation',
      partnerRole = 'Friendly Local Friend',
      userLevel = 'Intermediate (B1-B2)',
    } = req.body;

    const ai = getGeminiClient();

    const systemPrompt = `You are LALA, an engaging, supportive, and natural AI Language Learning Assistant.
You are playing the role of: "${partnerRole}" in the scenario: "${scenario}".
Target language being practiced: "${targetLanguage}".
User's native language: "${nativeLanguage}".
User's proficiency level: "${userLevel}".

Instructions:
1. Reply naturally in character in the ${targetLanguage}. Keep replies lively, conversational (1-3 sentences), and end with a thought-provoking follow-up question or natural conversational hook.
2. Provide a natural translation into ${nativeLanguage}.
3. Analyze the user's latest message:
   - If there is any grammatical mistake or unnatural phrasing, provide a constructive "Better Way to Say It" suggestion with a short explanation in ${nativeLanguage}. If the user's input is already perfect, offer a fun native slang/idiom alternative or compliment them.
   - Extract 1 or 2 key vocabulary words or idioms from this turn with pronunciation guide and ${nativeLanguage} definition.
4. Output JSON adhering to the schema.`;

    const formattedHistory = messages.map((m: { role: string; content: string }) => `${m.role === 'user' ? 'User' : 'LALA'}: ${m.content}`).join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: `Chat History:\n${formattedHistory}\n\nPlease respond to the user's latest input following the instructions.`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: `Character reply in ${targetLanguage}`,
            },
            translation: {
              type: Type.STRING,
              description: `Translation of the reply in ${nativeLanguage}`,
            },
            userFeedback: {
              type: Type.OBJECT,
              properties: {
                hasCorrection: { type: Type.BOOLEAN },
                originalSegment: { type: Type.STRING },
                improvedVersion: { type: Type.STRING },
                explanation: { type: Type.STRING },
                nuanceTag: { type: Type.STRING, description: 'e.g. Grammar, More Natural, Polite, Slang' },
              },
              required: ['hasCorrection', 'improvedVersion', 'explanation'],
            },
            suggestedReplies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: `3 quick suggested reply options the user could say next in ${targetLanguage}`,
            },
            keyVocabulary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  phonetic: { type: Type.STRING },
                  meaning: { type: Type.STRING },
                  example: { type: Type.STRING },
                },
                required: ['word', 'meaning'],
              },
            },
          },
          required: ['reply', 'translation', 'suggestedReplies', 'keyVocabulary'],
        },
      },
    });

    const raw = response.text || '{}';
    const parsed = JSON.parse(raw);
    res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error('Chat API error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to process chat',
      data: {
        reply: "That sounds wonderful! Let's continue practicing together.",
        translation: "정말 멋지네요! 계속해서 함께 연습해봐요.",
        userFeedback: {
          hasCorrection: false,
          improvedVersion: "You expressed yourself very clearly!",
          explanation: "자연스럽게 잘 말씀하셨습니다.",
          nuanceTag: "Great",
        },
        suggestedReplies: ["Tell me more about that!", "What do you recommend?", "Let me think about it."],
        keyVocabulary: [
          { word: "fluent", phonetic: "/ˈfluː.ənt/", meaning: "유창한", example: "You are getting more fluent every day." }
        ]
      }
    });
  }
});

// 3. Pronunciation Evaluation
apiRouter.post('/pronunciation-evaluate', async (req, res) => {
  try {
    const { phrase, targetLanguage = 'English', nativeLanguage = 'Korean' } = req.body;
    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: `Evaluate the pronunciation, intonation, and rhythm challenges for speaking this phrase in ${targetLanguage}:
Phrase: "${phrase}"
Explain in ${nativeLanguage}.`,
      config: {
        systemInstruction: `You are LALA Pronunciation Master. Analyze phonetic challenges, liaison/linking rules, stress patterns, and common mistakes by native ${nativeLanguage} speakers.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ipa: { type: Type.STRING, description: 'IPA phonetic transcription' },
            breakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  chunk: { type: Type.STRING },
                  stress: { type: Type.STRING, description: 'Primary, Secondary, or Unstressed' },
                  tip: { type: Type.STRING },
                },
                required: ['chunk', 'stress', 'tip'],
              },
            },
            linkingRules: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Liaison or sound assimilation tips',
            },
            nativeSpeakerTips: {
              type: Type.STRING,
              description: `Key tip specifically for ${nativeLanguage} speakers`,
            },
            difficultyScore: { type: Type.INTEGER, description: '1 to 5 scale' },
          },
          required: ['ipa', 'breakdown', 'linkingRules', 'nativeSpeakerTips', 'difficultyScore'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error('Pronunciation eval error:', err);
    res.status(500).json({
      success: false,
      data: {
        ipa: "/prəˌnʌn.siˈeɪ.ʃən/",
        breakdown: [
          { chunk: "Phrase", stress: "Primary", tip: "Clear initial consonant articulation" }
        ],
        linkingRules: ["Smooth transition between vowel endings and consonant starts"],
        nativeSpeakerTips: "Focus on rhythm and syllable weight rather than flat pitch.",
        difficultyScore: 2,
      }
    });
  }
});

// 4. Polish & Nuance Transformer
apiRouter.post('/polish', async (req, res) => {
  const { text = '', targetLanguage = 'English', nativeLanguage = 'Korean' } = req.body || {};
  try {
    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: `Transform and polish this sentence into 4 distinct styles in ${targetLanguage}:
Original sentence: "${text}"
Target language: ${targetLanguage}
User native language: ${nativeLanguage}`,
      config: {
        systemInstruction: `You are LALA Expression & Nuance Studio. Given a user sentence, produce 4 high-quality natural variations:
1. Casual & Friendly (everyday chatting)
2. Professional & Business (email, workplace)
3. Native Idiomatic / Trendy (expressive, punchy)
4. Academic & Elegant (formal writing)
Also provide breakdown analysis in ${nativeLanguage}.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            originalAnalysis: {
              type: Type.STRING,
              description: `Critique of the original sentence in ${nativeLanguage}`,
            },
            styles: {
              type: Type.OBJECT,
              properties: {
                casual: {
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING },
                    koreanMeaning: { type: Type.STRING },
                    usageContext: { type: Type.STRING },
                  },
                  required: ['text', 'koreanMeaning', 'usageContext'],
                },
                business: {
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING },
                    koreanMeaning: { type: Type.STRING },
                    usageContext: { type: Type.STRING },
                  },
                  required: ['text', 'koreanMeaning', 'usageContext'],
                },
                idiomatic: {
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING },
                    koreanMeaning: { type: Type.STRING },
                    usageContext: { type: Type.STRING },
                  },
                  required: ['text', 'koreanMeaning', 'usageContext'],
                },
                academic: {
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING },
                    koreanMeaning: { type: Type.STRING },
                    usageContext: { type: Type.STRING },
                  },
                  required: ['text', 'koreanMeaning', 'usageContext'],
                },
              },
              required: ['casual', 'business', 'idiomatic', 'academic'],
            },
            keyPhrases: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phrase: { type: Type.STRING },
                  meaning: { type: Type.STRING },
                },
                required: ['phrase', 'meaning'],
              },
            },
          },
          required: ['originalAnalysis', 'styles', 'keyPhrases'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error('Polish error:', err);
    res.status(500).json({
      success: false,
      error: err.message,
      data: {
        originalAnalysis: "원문이 충분히 이해 가능하지만 상황에 맞춰 더 세련되게 다듬을 수 있습니다.",
        styles: {
          casual: { text: text, koreanMeaning: "편안한 대화체", usageContext: "친구들과의 일상 대화" },
          business: { text: `I would like to convey that: ${text}`, koreanMeaning: "비즈니스 표현", usageContext: "업무 이메일 및 회의" },
          idiomatic: { text: text, koreanMeaning: "원어민 뉘앙스", usageContext: "자연스러운 관용구" },
          academic: { text: `It is observed that ${text}`, koreanMeaning: "격식 있는 문어체", usageContext: "에세이 및 보고서" }
        },
        keyPhrases: []
      }
    });
  }
});

// 5. Word Lab
apiRouter.post('/word-lab', async (req, res) => {
  try {
    const { topic = 'Tech & Business', targetLanguage = 'English', nativeLanguage = 'Korean', count = 5 } = req.body;
    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: `Generate ${count} high-impact expressions, idioms, and advanced vocabulary words related to "${topic}" in ${targetLanguage}.
Provide explanations, collocations, and memory hooks in ${nativeLanguage}.`,
      config: {
        systemInstruction: `You are LALA Vocabulary Lab. Curate practical, highly useful language cards.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topicOverview: { type: Type.STRING },
            cards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  ipa: { type: Type.STRING },
                  partOfSpeech: { type: Type.STRING },
                  koreanDefinition: { type: Type.STRING },
                  englishDefinition: { type: Type.STRING },
                  collocations: { type: Type.ARRAY, items: { type: Type.STRING } },
                  exampleSentence: { type: Type.STRING },
                  exampleTranslation: { type: Type.STRING },
                  mnemonicTip: { type: Type.STRING, description: 'Easy memory hook or origin story' },
                  tag: { type: Type.STRING, description: 'e.g. Essential, Business, Slang, High-frequency' },
                },
                required: ['word', 'ipa', 'partOfSpeech', 'koreanDefinition', 'exampleSentence', 'exampleTranslation'],
              },
            },
          },
          required: ['topicOverview', 'cards'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error('Word Lab error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Quiz
apiRouter.post('/quiz', async (req, res) => {
  try {
    const { topic = 'Everyday Expressions', targetLanguage = 'English', nativeLanguage = 'Korean', level = 'Intermediate' } = req.body;
    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: `Create a 4-question interactive learning quiz for ${targetLanguage} learners at ${level} level on the topic of "${topic}".
Explanations in ${nativeLanguage}.`,
      config: {
        systemInstruction: 'You are LALA Quiz Master. Generate engaging questions testing nuances, idioms, situational dialogues, and grammatical precision.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  question: { type: Type.STRING },
                  situation: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                  culturalNuance: { type: Type.STRING },
                },
                required: ['id', 'question', 'options', 'correctIndex', 'explanation'],
              },
            },
          },
          required: ['title', 'questions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error('Quiz error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});
