import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Mic, MicOff, Volume2, Sparkles, CheckCircle2, 
  AlertCircle, RefreshCw, ChevronRight, Bookmark, BookmarkCheck,
  Play, BookOpen, MessageSquarePlus, User, Bot, HelpCircle
} from 'lucide-react';
import { ChatMessage, Scenario, VocabularyCard } from '../types';
import { SCENARIOS } from '../data/languages';
import { speechManager } from '../utils/speech';
import { fetchChatReply } from '../services/api';

interface RoleplayTabProps {
  targetLang: string;
  nativeLang: string;
  userLevel: string;
  onBookmarkWord: (word: VocabularyCard) => void;
  bookmarkedWords: VocabularyCard[];
}

export const RoleplayTab: React.FC<RoleplayTabProps> = ({
  targetLang,
  nativeLang,
  userLevel,
  onBookmarkWord,
  bookmarkedWords,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(SCENARIOS[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: SCENARIOS[0].initialLalaReply,
      translation: SCENARIOS[0].initialLalaKo,
      timestamp: 'Just now',
      suggestedReplies: [
        SCENARIOS[0].starterPhrase,
        "What do you recommend for someone who likes nutty coffee?",
        "Do you have decaf options with oat milk?"
      ],
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showTranslations, setShowTranslations] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(0.95);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSelectScenario = (sc: Scenario) => {
    setSelectedScenario(sc);
    setMessages([
      {
        id: `sc-${Date.now()}`,
        role: 'assistant',
        content: sc.initialLalaReply,
        translation: sc.initialLalaKo,
        timestamp: 'Just now',
        suggestedReplies: [
          sc.starterPhrase,
          "Could you give me a recommendation based on what's popular?",
          "I have a quick question before we begin."
        ],
      }
    ]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInputText('');
    setIsLoading(true);

    try {
      const historyPayload = updatedHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const replyData = await fetchChatReply({
        messages: historyPayload,
        targetLanguage: targetLang,
        nativeLanguage: nativeLang,
        scenario: selectedScenario.title,
        partnerRole: selectedScenario.role,
        userLevel: userLevel,
      });

      const assistantMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: replyData.reply,
        translation: replyData.translation,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        feedback: replyData.userFeedback,
        suggestedReplies: replyData.suggestedReplies,
        keyVocabulary: replyData.keyVocabulary,
      };

      setMessages([...updatedHistory, assistantMsg]);

      // Auto speak assistant message
      speechManager.speak(replyData.reply, targetLang === 'English' ? 'en-US' : 'en-US', playbackSpeed);
    } catch (err: any) {
      console.error(err);
      const fallbackMsg: ChatMessage = {
        id: `bot-fallback-${Date.now()}`,
        role: 'assistant',
        content: "That sounds great! What would you like to explore next in this conversation?",
        translation: "좋은 답변입니다! 다음으로 어떤 대화를 이어가 볼까요?",
        timestamp: 'Just now',
        suggestedReplies: ["Let's try another topic.", "Can you explain that expression?"]
      };
      setMessages([...updatedHistory, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMic = () => {
    if (isRecording) {
      speechManager.stopListening();
      setIsRecording(false);
    } else {
      setSpeechError(null);
      const started = speechManager.startListening(
        targetLang === 'English' ? 'en-US' : 'ko-KR',
        (transcript, isFinal) => {
          setInputText(transcript);
          if (isFinal) {
            speechManager.stopListening();
            setIsRecording(false);
          }
        },
        (err) => {
          setSpeechError('음성 인식을 사용할 수 없거나 마이크 권한이 필요합니다.');
          setIsRecording(false);
        },
        () => {
          setIsRecording(false);
        }
      );
      if (started) {
        setIsRecording(true);
      }
    }
  };

  const playVoice = (text: string, speed = playbackSpeed) => {
    speechManager.speak(text, targetLang === 'English' ? 'en-US' : 'en-US', speed);
  };

  const isWordSaved = (wordText: string) => {
    return bookmarkedWords.some((w) => w.word.toLowerCase() === wordText.toLowerCase());
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Sidebar: Scenario Selector */}
      <div className="lg:col-span-4 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Roleplay Scenarios</h3>
            <p className="text-xs text-slate-500">실전 상황을 선택하고 대화하세요</p>
          </div>
          <span className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 font-semibold rounded-full border border-indigo-100">
            {SCENARIOS.length} Situations
          </span>
        </div>

        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {SCENARIOS.map((sc) => {
            const isSelected = selectedScenario.id === sc.id;
            return (
              <div
                key={sc.id}
                id={`scenario-card-${sc.id}`}
                onClick={() => handleSelectScenario(sc)}
                className={`p-3.5 rounded-xl cursor-pointer transition-all border text-left ${
                  isSelected
                    ? 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-400/40 shadow-xs'
                    : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs sm:text-sm text-slate-900">{sc.title}</span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                    {sc.role}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-1.5 font-medium">{sc.titleKo}</p>
                <p className="text-[11px] text-slate-500 line-clamp-2">{sc.description}</p>
              </div>
            );
          })}
        </div>

        {/* Practice Stats & Settings */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Audio Playback Speed</span>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md text-[11px] font-semibold">
              <button
                onClick={() => setPlaybackSpeed(0.8)}
                className={`px-2 py-0.5 rounded ${playbackSpeed === 0.8 ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500'}`}
              >
                0.8x (Slow)
              </button>
              <button
                onClick={() => setPlaybackSpeed(1.0)}
                className={`px-2 py-0.5 rounded ${playbackSpeed === 1.0 ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500'}`}
              >
                1.0x (Normal)
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Show Korean Translation</span>
            <input
              type="checkbox"
              id="toggle-translation-checkbox"
              checked={showTranslations}
              onChange={(e) => setShowTranslations(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Main Conversation Stream */}
      <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[740px]">
        {/* Header inside chat */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              🤖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm sm:text-base">{selectedScenario.title}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-medium">
                  {selectedScenario.role}
                </span>
              </div>
              <p className="text-xs text-slate-500">{selectedScenario.titleKo}</p>
            </div>
          </div>

          <button
            id="restart-dialogue-btn"
            onClick={() => handleSelectScenario(selectedScenario)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>대화 리셋</span>
          </button>
        </div>

        {/* Message Bubble List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-2`}>
                <div className="flex items-start gap-2.5 max-w-[85%] sm:max-w-[78%]">
                  {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0 mt-1">
                      LA
                    </div>
                  )}

                  <div
                    className={`rounded-2xl px-4 py-3.5 text-sm leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-xs'
                        : 'bg-slate-100 text-slate-900 rounded-tl-xs border border-slate-200/70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <span className={`text-[11px] font-semibold ${isUser ? 'text-indigo-200' : 'text-slate-500'}`}>
                        {isUser ? 'You' : selectedScenario.role}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => playVoice(msg.content)}
                          className={`p-1 rounded hover:bg-black/10 transition-colors ${
                            isUser ? 'text-indigo-100' : 'text-slate-500 hover:text-indigo-600'
                          }`}
                          title="발음 듣기"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <span className={`text-[10px] ${isUser ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>

                    <p className="font-medium text-sm sm:text-[15px]">{msg.content}</p>

                    {/* Korean Translation */}
                    {showTranslations && msg.translation && (
                      <p className={`mt-2 pt-2 text-xs border-t ${isUser ? 'border-indigo-500 text-indigo-100' : 'border-slate-200 text-slate-600'}`}>
                        {msg.translation}
                      </p>
                    )}
                  </div>
                </div>

                {/* Real-time Feedback & Nuance Card (if provided by AI for user's previous input) */}
                {msg.feedback && (
                  <div className="w-full max-w-[85%] sm:max-w-[78%] bg-gradient-to-r from-amber-50/80 to-amber-100/50 border border-amber-200/90 rounded-xl p-3.5 text-xs text-slate-800 space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-amber-800">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>LALA 실시간 표현 코칭</span>
                      </div>
                      {msg.feedback.nuanceTag && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-200/70 text-amber-900 rounded-full">
                          {msg.feedback.nuanceTag}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold">원어민 추천 표현: </span>
                      <span className="font-bold text-indigo-700">{msg.feedback.improvedVersion}</span>
                      <button
                        onClick={() => playVoice(msg.feedback?.improvedVersion || '')}
                        className="inline-flex items-center ml-1.5 text-indigo-600 hover:text-indigo-800"
                        title="추천 표현 발음 듣기"
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-slate-600 leading-normal">{msg.feedback.explanation}</p>
                  </div>
                )}

                {/* Key Vocabulary Extracted */}
                {msg.keyVocabulary && msg.keyVocabulary.length > 0 && (
                  <div className="w-full max-w-[85%] sm:max-w-[78%] bg-indigo-50/60 border border-indigo-100 rounded-xl p-3 text-xs space-y-2">
                    <div className="flex items-center justify-between text-indigo-900 font-bold text-[11px]">
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-indigo-600" />
                        <span>핵심 어휘 & 표현</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.keyVocabulary.map((vocab, idx) => {
                        const saved = isWordSaved(vocab.word);
                        return (
                          <div key={idx} className="bg-white p-2.5 rounded-lg border border-indigo-100 flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900">{vocab.word}</span>
                                {vocab.phonetic && (
                                  <span className="text-[10px] text-slate-400 font-mono">{vocab.phonetic}</span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-600 font-medium">{vocab.meaning}</p>
                              {vocab.example && (
                                <p className="text-[10px] text-slate-500 italic mt-0.5">"{vocab.example}"</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0 ml-2">
                              <button
                                onClick={() => playVoice(vocab.word)}
                                className="p-1 text-slate-400 hover:text-indigo-600"
                                title="발음 듣기"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  onBookmarkWord({
                                    word: vocab.word,
                                    ipa: vocab.phonetic || '',
                                    partOfSpeech: 'Expression',
                                    koreanDefinition: vocab.meaning,
                                    collocations: [],
                                    exampleSentence: vocab.example || '',
                                    exampleTranslation: vocab.meaning,
                                    tag: 'Roleplay',
                                  })
                                }
                                className={`p-1 ${saved ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-600'}`}
                                title={saved ? '저장됨' : '단어장에 저장'}
                              >
                                {saved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Suggested Reply Chips */}
                {msg.suggestedReplies && msg.suggestedReplies.length > 0 && !isUser && (
                  <div className="w-full max-w-[85%] sm:max-w-[78%] space-y-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-slate-400">💡 다음 추천 답변 (클릭하여 전송):</span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedReplies.map((reply, rIdx) => (
                        <button
                          key={rIdx}
                          onClick={() => handleSendMessage(reply)}
                          className="text-left text-xs bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-300 px-3 py-1.5 rounded-lg transition-colors font-medium shadow-2xs"
                        >
                          "{reply}"
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3 text-slate-500 text-xs font-medium py-2">
              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center animate-pulse">
                LA
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 animate-bounce"></span>
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]"></span>
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]"></span>
                <span className="ml-1 text-slate-500">LALA가 답변과 문장 피드백을 생성하고 있습니다...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input & Voice Controls */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50/50 rounded-b-2xl space-y-2">
          {speechError && (
            <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{speechError}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* Mic Toggle Button */}
            <button
              id="toggle-mic-btn"
              onClick={toggleMic}
              className={`p-3 rounded-xl transition-all shadow-xs shrink-0 flex items-center justify-center ${
                isRecording
                  ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-200'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-indigo-600'
              }`}
              title={isRecording ? '음성 녹음 중지' : '음성으로 말하기'}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Text Input */}
            <input
              id="roleplay-chat-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={`${selectedScenario.title} 상황에 맞춰 대화해보세요... (예: ${selectedScenario.starterPhrase})`}
              disabled={isLoading}
              className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400"
            />

            {/* Send Button */}
            <button
              id="send-chat-btn"
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputText.trim()}
              className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0 text-sm"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">전송</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
