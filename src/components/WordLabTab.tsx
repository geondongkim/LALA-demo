import React, { useState } from 'react';
import { 
  BookOpen, Sparkles, Bookmark, BookmarkCheck, Volume2, 
  Search, Tag, Lightbulb, Trash2, Filter, Layers
} from 'lucide-react';
import { VocabularyCard } from '../types';
import { generateWordLab } from '../services/api';
import { speechManager } from '../utils/speech';

interface WordLabTabProps {
  targetLang: string;
  nativeLang: string;
  bookmarkedWords: VocabularyCard[];
  onToggleBookmark: (word: VocabularyCard) => void;
  onRemoveBookmark: (wordText: string) => void;
}

export const WordLabTab: React.FC<WordLabTabProps> = ({
  targetLang,
  nativeLang,
  bookmarkedWords,
  onToggleBookmark,
  onRemoveBookmark,
}) => {
  const [topic, setTopic] = useState('Tech Startup & Everyday Fluency');
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'explore' | 'bookmarks'>('explore');
  const [cards, setCards] = useState<VocabularyCard[]>([
    {
      word: "pivot",
      ipa: "/ˈpɪv.ət/",
      partOfSpeech: "verb / noun",
      koreanDefinition: "사업 방향이나 전략을 신속하게 전환하다",
      englishDefinition: "To rapidly change strategic direction in response to market feedback.",
      collocations: ["make a pivot", "strategic pivot", "pivot smoothly"],
      exampleSentence: "When initial user feedback arrived, the team decided to pivot toward enterprise customers.",
      exampleTranslation: "초기 사용자 피드백을 받은 후, 팀은 엔터프라이즈 고객을 타깃으로 피벗하기로 결정했습니다.",
      mnemonicTip: "농구에서 한 발을 딛고 방향을 휙 돌리는 '피벗' 동작을 상상하세요.",
      tag: "Business & Tech"
    },
    {
      word: "streamline",
      ipa: "/ˈstriːm.laɪn/",
      partOfSpeech: "verb",
      koreanDefinition: "불필요한 단계를 없애고 업무나 프로세스를 효율화하다",
      englishDefinition: "To make a system, process, or organization more efficient and effective.",
      collocations: ["streamline the workflow", "streamline operations", "streamline communication"],
      exampleSentence: "Our new automated tool helps streamline the onboarding experience for new hires.",
      exampleTranslation: "우리의 새로운 자동화 도구는 신규 입사자의 온보딩 프로세스를 효율화하는 데 도움을 줍니다.",
      mnemonicTip: "물 흐르듯(stream) 매끄러운 선(line)을 만들어 저항 없이 빠르게 만드는 모습.",
      tag: "Essential Workplace"
    },
    {
      word: "touch base",
      ipa: "/tʌtʃ beɪs/",
      partOfSpeech: "idiom",
      koreanDefinition: "~와 간단히 연락을 취하다 / 근황 및 진행상황을 점검하다",
      englishDefinition: "To briefly establish contact or catch up with someone.",
      collocations: ["touch base with someone", "touch base next week"],
      exampleSentence: "Let's touch base tomorrow morning after the product release goes live.",
      exampleTranslation: "제품 릴리스가 배포된 후 내일 아침에 간단히 진행 상황을 확인합시다.",
      mnemonicTip: "야구에서 베이스를 살짝 터치하고 가듯, 가볍게 체크하는 미팅.",
      tag: "Native Idiom"
    },
    {
      word: "leverage",
      ipa: "/ˈlev.ər.ɪdʒ/",
      partOfSpeech: "verb",
      koreanDefinition: "기존 자원이나 강점을 극대화하여 활용하다",
      englishDefinition: "To use something that you already have in order to achieve something new or better.",
      collocations: ["leverage assets", "leverage technology", "leverage data insights"],
      exampleSentence: "We need to leverage AI models to automate our customer feedback categorization.",
      exampleTranslation: "우리는 고객 피드백 분류를 자동화하기 위해 AI 모델을 적극 활용해야 합니다.",
      mnemonicTip: "지렛대(lever)의 원리처럼 작은 힘으로 큰 성과를 이끌어내는 힘.",
      tag: "High-Frequency"
    }
  ]);

  const presetTopics = [
    "Tech Startup & Everyday Fluency",
    "Casual Coffee Chat & Slang",
    "Job Interview & Resume Power Verbs",
    "Travel, Dining & Hotel Etiquette",
    "Conflict Resolution & Polite Negotiation",
  ];

  const handleGenerate = async (topicToUse?: string) => {
    const activeTopic = topicToUse || topic;
    if (!activeTopic.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const data = await generateWordLab({
        topic: activeTopic,
        targetLanguage: targetLang,
        nativeLanguage: nativeLang,
        count: 5,
      });
      setCards(data.cards);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const playVoice = (text: string) => {
    speechManager.speak(text, targetLang === 'English' ? 'en-US' : 'en-US', 0.9);
  };

  const isBookmarked = (wordText: string) => {
    return bookmarkedWords.some((w) => w.word.toLowerCase() === wordText.toLowerCase());
  };

  const displayList = viewMode === 'explore' ? cards : bookmarkedWords;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-orange-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-md">
            <BookOpen className="w-3.5 h-3.5 text-amber-200" />
            <span>AI Smart Vocabulary & Collocation Lab</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">표현 & 어휘 마스터 허브</h2>
          <p className="text-amber-100 text-xs sm:text-sm max-w-xl leading-relaxed">
            원어민들이 실제 대화에서 가장 자주 쓰는 핵심 표현, 뉘앙스, 연어(Collocation), 기억 연상법(Mnemonic)을 한눈에 학습하고 단어장에 저장하세요.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-white/20 p-1 rounded-xl backdrop-blur-md shrink-0">
          <button
            onClick={() => setViewMode('explore')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'explore' ? 'bg-white text-orange-900 shadow-xs' : 'text-white hover:bg-white/10'
            }`}
          >
            어휘 탐색 (AI Lab)
          </button>
          <button
            onClick={() => setViewMode('bookmarks')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'bookmarks' ? 'bg-white text-orange-900 shadow-xs' : 'text-white hover:bg-white/10'
            }`}
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>저장된 단어장 ({bookmarkedWords.length})</span>
          </button>
        </div>
      </div>

      {viewMode === 'explore' && (
        <>
          {/* Topic Generator Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">주제 또는 관심사 입력:</label>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                placeholder="예: 실리콘밸리 스타트업, 카페 주문, 여행 영어, 일상 감정 표현..."
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-slate-900"
              />
              <button
                onClick={() => handleGenerate()}
                disabled={isLoading || !topic.trim()}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                    생성 중...
                  </span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>새 단어 카드 추출</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Topic Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-400">추천 테마:</span>
              {presetTopics.map((pt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTopic(pt);
                    handleGenerate(pt);
                  }}
                  className="text-xs bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-600 px-3 py-1 rounded-lg transition-colors border border-slate-200 font-medium"
                >
                  {pt}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Cards List */}
      <div className="space-y-4">
        {displayList.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700 text-base">저장된 단어가 없습니다</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              어휘 탐색 탭이나 대화 연습(Roleplay) 탭에서 북마크 아이콘을 눌러 나만의 단어장에 저장해 보세요.
            </p>
            <button
              onClick={() => setViewMode('explore')}
              className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              어휘 탐색하러 가기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {displayList.map((card, idx) => {
              const saved = isBookmarked(card.word);
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Header: Word, IPA, Tag, Actions */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-xl text-slate-900">{card.word}</h3>
                          {card.tag && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                              {card.tag}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-mono text-slate-400">{card.ipa}</span>
                          <span className="text-xs text-slate-400 font-medium">• {card.partOfSpeech}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => playVoice(card.word)}
                          className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-50 transition-colors"
                          title="발음 듣기"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onToggleBookmark(card)}
                          className={`p-2 rounded-lg transition-colors ${
                            saved
                              ? 'text-amber-600 bg-amber-50'
                              : 'text-slate-400 hover:text-amber-600 hover:bg-slate-50'
                          }`}
                          title={saved ? '저장 취소' : '단어장에 저장'}
                        >
                          {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                        </button>
                        {viewMode === 'bookmarks' && (
                          <button
                            onClick={() => onRemoveBookmark(card.word)}
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="단어장에서 삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Definition */}
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-800">{card.koreanDefinition}</p>
                      {card.englishDefinition && (
                        <p className="text-xs text-slate-500 leading-normal">{card.englishDefinition}</p>
                      )}
                    </div>

                    {/* Collocations */}
                    {card.collocations && card.collocations.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">자주 함께 쓰이는 연어 (Collocations):</span>
                        <div className="flex flex-wrap gap-1.5">
                          {card.collocations.map((col, cIdx) => (
                            <span key={cIdx} className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                              {col}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Example sentence */}
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 leading-snug">"{card.exampleSentence}"</span>
                        <button
                          onClick={() => playVoice(card.exampleSentence)}
                          className="text-slate-400 hover:text-amber-600 ml-2"
                          title="예문 듣기"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-slate-500 text-[11px]">{card.exampleTranslation}</p>
                    </div>
                  </div>

                  {/* Mnemonic Memory Tip */}
                  {card.mnemonicTip && (
                    <div className="pt-2 border-t border-slate-100 flex items-start gap-2 text-[11px] text-amber-900 bg-amber-50/50 p-2.5 rounded-lg">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span><strong>기억 꿀팁:</strong> {card.mnemonicTip}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
