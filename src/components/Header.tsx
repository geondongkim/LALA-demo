import React from 'react';
import { Sparkles, Globe, Volume2, Award, Zap, BookmarkCheck } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { TabMode } from '../types';

interface HeaderProps {
  currentTab: TabMode;
  onSelectTab: (tab: TabMode) => void;
  targetLang: string;
  onChangeTargetLang: (lang: string) => void;
  userLevel: string;
  onChangeUserLevel: (level: string) => void;
  savedWordsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  targetLang,
  onChangeTargetLang,
  userLevel,
  onChangeUserLevel,
  savedWordsCount,
}) => {
  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.name === targetLang) || SUPPORTED_LANGUAGES[0];

  const tabs: Array<{ id: TabMode; label: string; labelKo: string; icon: string }> = [
    { id: 'roleplay', label: 'AI Roleplay', labelKo: '상황별 회화', icon: '💬' },
    { id: 'speaking', label: 'Pronunciation Lab', labelKo: '발음 & 억양 코칭', icon: '🎙️' },
    { id: 'polish', label: 'Expression Polish', labelKo: '문장 뉘앙스 변환', icon: '✨' },
    { id: 'wordlab', label: 'Vocabulary Hub', labelKo: '표현 & 어휘 랩', icon: '📚' },
    { id: 'quiz', label: 'Context Quiz', labelKo: '실전 퀴즈', icon: '🎯' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">LALA</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  AI Language Lab
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Real-time Conversational Fluency & Pronunciation Coach</p>
            </div>
          </div>

          {/* Controls: Target Language & Level */}
          <div className="flex items-center gap-3">
            {/* Target Language Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-100/90 rounded-lg p-1 border border-slate-200 text-xs font-medium">
              <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
              <select
                id="target-lang-select"
                value={targetLang}
                onChange={(e) => onChangeTargetLang(e.target.value)}
                className="bg-transparent border-none text-slate-800 text-xs font-semibold focus:ring-0 focus:outline-none cursor-pointer pr-2"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.name}>
                    {lang.flag} {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>
            </div>

            {/* Proficiency Level Dropdown */}
            <div className="hidden md:flex items-center gap-1.5 bg-slate-100/90 rounded-lg p-1 border border-slate-200 text-xs font-medium">
              <Award className="w-3.5 h-3.5 text-amber-500 ml-1.5" />
              <select
                id="proficiency-level-select"
                value={userLevel}
                onChange={(e) => onChangeUserLevel(e.target.value)}
                className="bg-transparent border-none text-slate-800 text-xs font-semibold focus:ring-0 focus:outline-none cursor-pointer pr-2"
              >
                <option value="Beginner (A1-A2)">초급 (A1-A2)</option>
                <option value="Intermediate (B1-B2)">중급 (B1-B2)</option>
                <option value="Advanced (C1-C2)">고급 (C1-C2)</option>
              </select>
            </div>

            {/* Bookmarks Counter */}
            <div
              onClick={() => onSelectTab('wordlab')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200/70 text-indigo-700 text-xs font-semibold cursor-pointer hover:bg-indigo-100 transition-colors"
              title="북마크된 단어장 보기"
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>{savedWordsCount} 저장됨</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar py-2 border-t border-slate-100">
          {tabs.map((t) => {
            const isActive = currentTab === t.id;
            return (
              <button
                key={t.id}
                id={`nav-tab-${t.id}`}
                onClick={() => onSelectTab(t.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span className="text-base leading-none">{t.icon}</span>
                <span>{t.label}</span>
                <span className={`text-[11px] opacity-70 hidden md:inline font-normal ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                  {t.labelKo}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
