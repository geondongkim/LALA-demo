import React, { useState } from 'react';
import { 
  Volume2, Mic, MicOff, Sparkles, CheckCircle, RefreshCw, 
  HelpCircle, Award, ArrowRight, ShieldCheck, Flame
} from 'lucide-react';
import { PRESET_SPEAKING_CHALLENGES } from '../data/languages';
import { PronunciationData } from '../types';
import { evaluatePronunciation } from '../services/api';
import { speechManager } from '../utils/speech';

interface SpeakingLabTabProps {
  targetLang: string;
  nativeLang: string;
}

export const SpeakingLabTab: React.FC<SpeakingLabTabProps> = ({ targetLang, nativeLang }) => {
  const [selectedPreset, setSelectedPreset] = useState(PRESET_SPEAKING_CHALLENGES[0]);
  const [customPhrase, setCustomPhrase] = useState(PRESET_SPEAKING_CHALLENGES[0].phrase);
  const [analysisData, setAnalysisData] = useState<PronunciationData | null>({
    ipa: "/lɛts tʌtʃ beɪs nɛkst ˈmʌn.deɪ tuː flɛʃ aʊt ðə ˈroʊd.mæp/",
    breakdown: [
      { chunk: "Let's touch base", stress: "Primary", tip: "'touch'와 'base'가 자연스럽게 이어지며 [치] 소리가 거칠지 않게 넘어갑니다." },
      { chunk: "next Monday", stress: "Primary", tip: "'next'의 마지막 t 소리는 약화되고 'Monday'의 첫 음절에 강세가 들어갑니다." },
      { chunk: "to flesh out", stress: "Secondary", tip: "'flesh'와 'out'이 연음되어 [플레샤웃]처럼 발음됩니다." },
      { chunk: "the roadmap", stress: "Primary", tip: "'road'에 강세를 두고 'map'은 가볍고 명확하게 닫아줍니다." }
    ],
    linkingRules: [
      "touch + base: /tʃ/와 /b/ 사이 무성파열음 연계",
      "flesh + out: 자음(/ʃ/) + 모음(/aʊ/) 연음 규칙 (Liaison)",
      "to reduction: /tuː/가 약화되어 가벼운 /tə/로 발음"
    ],
    nativeSpeakerTips: "한국어 화자가 자주 범하는 '단어별 끊어 읽기'를 피하고, 멜로디의 굴곡을 타듯 하나의 호흡으로 낭독하세요.",
    difficultyScore: 3,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedSpeech, setRecordedSpeech] = useState<string>('');
  const [matchScore, setMatchScore] = useState<number | null>(null);

  const handleEvaluate = async (phraseToEval: string) => {
    if (!phraseToEval.trim() || isLoading) return;
    setIsLoading(true);
    setRecordedSpeech('');
    setMatchScore(null);

    try {
      const data = await evaluatePronunciation({
        phrase: phraseToEval,
        targetLanguage: targetLang,
        nativeLanguage: nativeLang,
      });
      setAnalysisData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = (preset: typeof PRESET_SPEAKING_CHALLENGES[0]) => {
    setSelectedPreset(preset);
    setCustomPhrase(preset.phrase);
    handleEvaluate(preset.phrase);
  };

  const handlePlayAudio = (text: string, speed = 0.9) => {
    speechManager.speak(text, targetLang === 'English' ? 'en-US' : 'en-US', speed);
  };

  const startVoiceTest = () => {
    if (isRecording) {
      speechManager.stopListening();
      setIsRecording(false);
    } else {
      setRecordedSpeech('');
      setMatchScore(null);

      const started = speechManager.startListening(
        targetLang === 'English' ? 'en-US' : 'ko-KR',
        (transcript, isFinal) => {
          setRecordedSpeech(transcript);
          if (isFinal) {
            speechManager.stopListening();
            setIsRecording(false);

            // Simple similarity calculation
            const targetWords = customPhrase.toLowerCase().replace(/[^a-z0-9\s]/gi, '').split(/\s+/);
            const userWords = transcript.toLowerCase().replace(/[^a-z0-9\s]/gi, '').split(/\s+/);
            let matches = 0;
            userWords.forEach((w) => {
              if (targetWords.includes(w)) matches++;
            });
            const score = Math.min(100, Math.round((matches / Math.max(1, targetWords.length)) * 100));
            setMatchScore(score);
          }
        },
        (err) => {
          console.error(err);
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-indigo-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-md">
            <Flame className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Phonetic & Rhythm Coach</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">발음 & 억양 마스터 랩</h2>
          <p className="text-indigo-100 text-xs sm:text-sm max-w-xl leading-relaxed">
            원어민처럼 부드럽고 자연스럽게 말할 수 있도록 음소 단위 발음기호(IPA), 강세(Stress), 연음(Linking), 한국인 맞춤 코칭을 제공합니다.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            onClick={() => handlePlayAudio(customPhrase, 0.75)}
            className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors flex items-center gap-2 backdrop-blur-md border border-white/20"
          >
            <Volume2 className="w-4 h-4 text-amber-300" />
            <span>느린 속도 (0.75x)</span>
          </button>
          <button
            onClick={() => handlePlayAudio(customPhrase, 1.0)}
            className="px-4 py-2.5 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 text-xs font-bold transition-colors flex items-center gap-2 shadow-sm"
          >
            <Volume2 className="w-4 h-4 text-indigo-600" />
            <span>정상 속도 (1.0x)</span>
          </button>
        </div>
      </div>

      {/* Preset Challenge Cards */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">추천 실전 트레이닝 문장</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRESET_SPEAKING_CHALLENGES.map((preset) => {
            const isSelected = selectedPreset.id === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-3.5 rounded-2xl cursor-pointer transition-all border text-left flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-50/90 border-indigo-300 ring-2 ring-indigo-400/30'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {preset.category}
                    </span>
                    <span className="text-[10px] text-indigo-600 font-semibold">{preset.level}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 line-clamp-2 mb-1">"{preset.phrase}"</p>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1">{preset.hint}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Phrase Input Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <label className="text-xs font-bold text-slate-700 block">직접 문장을 입력하여 발음 분석하기:</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customPhrase}
            onChange={(e) => setCustomPhrase(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleEvaluate(customPhrase)}
            placeholder="발음과 억양을 분석하고 싶은 문장을 입력하세요..."
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900"
          />
          <button
            onClick={() => handleEvaluate(customPhrase)}
            disabled={isLoading || !customPhrase.trim()}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>분석 실행</span>
          </button>
        </div>
      </div>

      {/* Analysis Results Area */}
      {analysisData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Phonetic Breakdown */}
          <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                  국제 음성 기호 (IPA)
                </span>
                <span className="text-xs text-slate-500 font-medium">난이도: {'★'.repeat(analysisData.difficultyScore)}{'☆'.repeat(5 - analysisData.difficultyScore)}</span>
              </div>
              <div className="p-4 bg-slate-900 rounded-xl text-indigo-200 font-mono text-base sm:text-lg tracking-wide flex items-center justify-between">
                <span>{analysisData.ipa}</span>
                <button
                  onClick={() => handlePlayAudio(customPhrase)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="원어민 발음 듣기"
                >
                  <Volume2 className="w-5 h-5 text-indigo-300" />
                </button>
              </div>
            </div>

            {/* Syllable Chunks & Stress Guide */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">청크별 강세 & 조음 팁</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {analysisData.breakdown.map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{item.chunk}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.stress === 'Primary' 
                          ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {item.stress} Stress
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Linking Rules */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">연음 및 음운 변동 규칙 (Liaison)</h4>
              <ul className="space-y-1.5">
                {analysisData.linkingRules.map((rule, rIdx) => (
                  <li key={rIdx} className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Native Speaker Tip */}
            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-1">
              <span className="font-bold text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                한국인 화자를 위한 원포인트 처방
              </span>
              <p className="leading-relaxed text-slate-700">{analysisData.nativeSpeakerTips}</p>
            </div>
          </div>

          {/* Right: Live Speech Practice & Scoring */}
          <div className="lg:col-span-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">직접 말하며 실시간 테스트</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                마이크 버튼을 누르고 문장을 또박또박 낭독해 보세요. 음성 인식 정확도와 유창도를 판정해 드립니다.
              </p>

              {/* Mic Action Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100 border border-slate-200 text-center space-y-4">
                <button
                  id="record-practice-btn"
                  onClick={startVoiceTest}
                  className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center transition-all shadow-md ${
                    isRecording
                      ? 'bg-rose-600 text-white ring-8 ring-rose-200 animate-pulse'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
                </button>

                <p className="text-xs font-semibold text-slate-700">
                  {isRecording ? '듣고 있습니다... 문장을 말씀하세요' : '클릭하여 음성 녹음 시작'}
                </p>

                {recordedSpeech && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-left text-xs space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">인식된 음성:</span>
                    <p className="font-semibold text-slate-800">"{recordedSpeech}"</p>
                  </div>
                )}

                {matchScore !== null && (
                  <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-1 text-center">
                    <span className="text-xs font-semibold text-indigo-700">발음 일치율 스코어</span>
                    <div className="text-3xl font-black text-indigo-900">{matchScore}%</div>
                    <p className="text-[11px] text-indigo-600 font-medium">
                      {matchScore >= 80 ? '🎉 원어민 수준의 훌륭한 발음입니다!' : '💪 연음과 강세에 유의하여 다시 시도해 보세요.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="text-center pt-2">
              <span className="text-[11px] text-slate-400">Web Speech Recognition & Synthesis API 연동</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
