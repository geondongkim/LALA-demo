/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { RoleplayTab } from './components/RoleplayTab';
import { SpeakingLabTab } from './components/SpeakingLabTab';
import { PolishTab } from './components/PolishTab';
import { WordLabTab } from './components/WordLabTab';
import { QuizTab } from './components/QuizTab';
import { TabMode, VocabularyCard } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabMode>('roleplay');
  const [targetLang, setTargetLang] = useState('English');
  const [nativeLang, setNativeLang] = useState('Korean');
  const [userLevel, setUserLevel] = useState('Intermediate (B1-B2)');

  // Local storage bookmarks
  const [bookmarkedWords, setBookmarkedWords] = useState<VocabularyCard[]>(() => {
    try {
      const saved = localStorage.getItem('lala_saved_words');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('lala_saved_words', JSON.stringify(bookmarkedWords));
    } catch (e) {
      console.error(e);
    }
  }, [bookmarkedWords]);

  const handleToggleBookmark = (word: VocabularyCard) => {
    setBookmarkedWords((prev) => {
      const exists = prev.some((w) => w.word.toLowerCase() === word.word.toLowerCase());
      if (exists) {
        return prev.filter((w) => w.word.toLowerCase() !== word.word.toLowerCase());
      } else {
        return [word, ...prev];
      }
    });
  };

  const handleBookmarkWord = (word: VocabularyCard) => {
    setBookmarkedWords((prev) => {
      const exists = prev.some((w) => w.word.toLowerCase() === word.word.toLowerCase());
      if (exists) return prev;
      return [word, ...prev];
    });
  };

  const handleRemoveBookmark = (wordText: string) => {
    setBookmarkedWords((prev) => prev.filter((w) => w.word.toLowerCase() !== wordText.toLowerCase()));
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        targetLang={targetLang}
        onChangeTargetLang={setTargetLang}
        userLevel={userLevel}
        onChangeUserLevel={setUserLevel}
        savedWordsCount={bookmarkedWords.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'roleplay' && (
          <RoleplayTab
            targetLang={targetLang}
            nativeLang={nativeLang}
            userLevel={userLevel}
            onBookmarkWord={handleBookmarkWord}
            bookmarkedWords={bookmarkedWords}
          />
        )}

        {currentTab === 'speaking' && (
          <SpeakingLabTab
            targetLang={targetLang}
            nativeLang={nativeLang}
          />
        )}

        {currentTab === 'polish' && (
          <PolishTab
            targetLang={targetLang}
            nativeLang={nativeLang}
          />
        )}

        {currentTab === 'wordlab' && (
          <WordLabTab
            targetLang={targetLang}
            nativeLang={nativeLang}
            bookmarkedWords={bookmarkedWords}
            onToggleBookmark={handleToggleBookmark}
            onRemoveBookmark={handleRemoveBookmark}
          />
        )}

        {currentTab === 'quiz' && (
          <QuizTab
            targetLang={targetLang}
            nativeLang={nativeLang}
            userLevel={userLevel}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white/70 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">LALA Language AI Demo</span>
            <span>• Powered by Gemini 3.7 Flash & Web Speech API</span>
          </div>
          <div className="text-slate-400">
            실시간 회화 롤플레잉, IPA 발음 코칭, 문장 뉘앙스 변환, 스마트 단어장
          </div>
        </div>
      </footer>
    </div>
  );
}
