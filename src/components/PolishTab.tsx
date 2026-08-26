import React, { useState } from 'react';
import { 
  Sparkles, Copy, Check, Volume2, ArrowRight, BookOpen, 
  MessageSquare, Briefcase, Zap, GraduationCap, Lightbulb 
} from 'lucide-react';
import { PolishData } from '../types';
import { polishSentence } from '../services/api';
import { speechManager } from '../utils/speech';

interface PolishTabProps {
  targetLang: string;
  nativeLang: string;
}

export const PolishTab: React.FC<PolishTabProps> = ({ targetLang, nativeLang }) => {
  const [inputText, setInputText] = useState("I want to discuss about the project schedule because deadline is very tight.");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [result, setResult] = useState<PolishData | null>({
    originalAnalysis: "원문은 의미가 명확히 통하지만, 'discuss about'은 중복 전치사 오류(discuss는 타동사)이며, 'very tight'를 상황별로 더 풍부하고 세련된 어휘로 대체할 수 있습니다.",
    styles: {
      casual: {
        text: "Hey, can we quickly touch base on the timeline? Things are getting pretty hectic with the deadline.",
        koreanMeaning: "야, 일정 관련해서 잠깐 얘기할 수 있어? 마감 때문에 꽤 빠듯해지고 있거든.",
        usageContext: "동료나 친한 팀원들과의 슬랙/캐주얼 대화"
      },
      business: {
        text: "I would like to align on the project timeline, as we are navigating some pressing delivery deadlines.",
        koreanMeaning: "임박한 납기 일정을 고려하여 프로젝트 타임라인을 다시 조율하고자 합니다.",
        usageContext: "공식 업무 이메일, 고객사 및 임원진 커뮤니케이션"
      },
      idiomatic: {
        text: "We really need to put our heads together on the schedule since we're down to the wire.",
        koreanMeaning: "마감이 코앞이라 발등에 불이 떨어진 상황이니 머리를 맞대고 일정을 조율해야 해요.",
        usageContext: "원어민들이 즐겨 쓰는 생생한 관용 표현 (down to the wire)"
      },
      academic: {
        text: "It is imperative that we review the project milestones given the imminent delivery constraints.",
        koreanMeaning: "임박한 납기 제약을 감안할 때 프로젝트 마일스톤에 대한 재검토가 필수적입니다.",
        usageContext: "공식 보고서, 학술 발표 및 정책 문서"
      }
    },
    keyPhrases: [
      { phrase: "touch base on", meaning: "~에 대해 간단히 의견을 나누다" },
      { phrase: "down to the wire", meaning: "마지막 순간까지 치열한 / 마감이 임박한" },
      { phrase: "align on", meaning: "~에 대해 조율하고 합의하다" },
      { phrase: "imperative", meaning: "반드시 해야 하는, 대단히 중요한" }
    ]
  });

  const handlePolish = async () => {
    if (!inputText.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const data = await polishSentence({
        text: inputText,
        targetLanguage: targetLang,
        nativeLanguage: nativeLang,
      });
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const playVoice = (text: string) => {
    speechManager.speak(text, targetLang === 'English' ? 'en-US' : 'en-US', 0.95);
  };

  const sampleInputs = [
    "I want to change the meeting time to tomorrow 3pm.",
    "Your opinion is good but I have other thought.",
    "Can you teach me how to do this report?",
    "I am very tired today because I worked all night.",
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header card */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-teal-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Style & Nuance Transformer</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">문장 뉘앙스 & 스타일 변환기</h2>
          <p className="text-teal-100 text-xs sm:text-sm max-w-xl leading-relaxed">
            작성한 문장을 입력하면 일상 캐주얼, 프로페셔널 비즈니스, 원어민 이디엄, 격식 있는 아카데믹 스타일 4가지로 완벽하게 탈바꿈해 드립니다.
          </p>
        </div>
      </div>

      {/* Input box */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">변환할 문장 입력 (어떤 표현이든 좋습니다):</label>
          <span className="text-xs text-slate-400 font-medium">{inputText.length} 글자</span>
        </div>

        <textarea
          id="polish-input-textarea"
          rows={3}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="변환하고 싶은 문장을 입력하세요..."
          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-900 resize-none leading-relaxed"
        />

        {/* Quick Sample Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-400">예시 문장:</span>
          {sampleInputs.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => setInputText(sample)}
              className="text-left text-xs bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 px-3 py-1 rounded-lg transition-colors border border-slate-200"
            >
              "{sample.slice(0, 32)}..."
            </button>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            id="polish-action-btn"
            onClick={handlePolish}
            disabled={isLoading || !inputText.trim()}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                AI 변환 중...
              </span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>4가지 스타일로 다듬기</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results grid */}
      {result && (
        <div className="space-y-6">
          {/* Original Sentence Analysis */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-2xs">
            <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <span className="font-bold text-amber-900 text-sm">원문 정밀 분석 & 클리닉</span>
              <p className="text-slate-700 leading-relaxed">{result.originalAnalysis}</p>
            </div>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* 1. Casual */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-slate-900">1. Casual & Friendly</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                    친구·동료 대화
                  </span>
                </div>
                <p className="text-base font-bold text-slate-900 leading-snug">
                  "{result.styles.casual.text}"
                </p>
                <p className="text-xs text-slate-600 font-medium">
                  {result.styles.casual.koreanMeaning}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="text-[11px] italic">{result.styles.casual.usageContext}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => playVoice(result.styles.casual.text)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-slate-50"
                    title="발음 듣기"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => copyToClipboard(result.styles.casual.text, 'casual')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-slate-50 flex items-center gap-1"
                    title="문장 복사"
                  >
                    {copiedKey === 'casual' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Business */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-slate-900">2. Professional & Business</span>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                    비즈니스 이메일·회의
                  </span>
                </div>
                <p className="text-base font-bold text-slate-900 leading-snug">
                  "{result.styles.business.text}"
                </p>
                <p className="text-xs text-slate-600 font-medium">
                  {result.styles.business.koreanMeaning}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="text-[11px] italic">{result.styles.business.usageContext}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => playVoice(result.styles.business.text)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-50"
                    title="발음 듣기"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => copyToClipboard(result.styles.business.text, 'business')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-50 flex items-center gap-1"
                    title="문장 복사"
                  >
                    {copiedKey === 'business' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Idiomatic */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
                      <Zap className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-slate-900">3. Native Idiomatic & Trendy</span>
                  </div>
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100">
                    생생한 관용구·슬랭
                  </span>
                </div>
                <p className="text-base font-bold text-slate-900 leading-snug">
                  "{result.styles.idiomatic.text}"
                </p>
                <p className="text-xs text-slate-600 font-medium">
                  {result.styles.idiomatic.koreanMeaning}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="text-[11px] italic">{result.styles.idiomatic.usageContext}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => playVoice(result.styles.idiomatic.text)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-50"
                    title="발음 듣기"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => copyToClipboard(result.styles.idiomatic.text, 'idiomatic')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-50 flex items-center gap-1"
                    title="문장 복사"
                  >
                    {copiedKey === 'idiomatic' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Academic */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-slate-900">4. Academic & Formal</span>
                  </div>
                  <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                    격식 문어체·보고서
                  </span>
                </div>
                <p className="text-base font-bold text-slate-900 leading-snug">
                  "{result.styles.academic.text}"
                </p>
                <p className="text-xs text-slate-600 font-medium">
                  {result.styles.academic.koreanMeaning}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="text-[11px] italic">{result.styles.academic.usageContext}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => playVoice(result.styles.academic.text)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-slate-50"
                    title="발음 듣기"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => copyToClipboard(result.styles.academic.text, 'academic')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-slate-50 flex items-center gap-1"
                    title="문장 복사"
                  >
                    {copiedKey === 'academic' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Key Phrases extracted */}
          {result.keyPhrases && result.keyPhrases.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-teal-600" />
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wider">
                  문장 속 핵심 표현 & 연어 (Collocations)
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {result.keyPhrases.map((kp, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-xs text-slate-900 block">{kp.phrase}</span>
                    <span className="text-[11px] text-slate-600 font-medium">{kp.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
