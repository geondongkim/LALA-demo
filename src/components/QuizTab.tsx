import React, { useState } from 'react';
import { 
  CheckCircle2, XCircle, Sparkles, RefreshCw, Trophy, 
  HelpCircle, ArrowRight, BookOpen, AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizResult } from '../types';
import { generateQuiz } from '../services/api';

interface QuizTabProps {
  targetLang: string;
  nativeLang: string;
  userLevel: string;
}

export const QuizTab: React.FC<QuizTabProps> = ({ targetLang, nativeLang, userLevel }) => {
  const [topic, setTopic] = useState('Conversational Nuance & Slang');
  const [isLoading, setIsLoading] = useState(false);
  const [quizData, setQuizData] = useState<QuizResult | null>({
    title: "상황별 원어민 뉘앙스 & 비즈니스 표현 퀴즈",
    questions: [
      {
        id: 1,
        question: "회의 일정을 나중으로 '연기하다'라고 정중하게 말할 때 가장 자연스러운 표현은?",
        situation: "팀원들과의 스프린트 회의에서 급한 안건으로 인해 일정을 뒤로 미뤄야 하는 상황",
        options: [
          "Could we push back the meeting to 4 PM?",
          "Could we put behind the meeting to 4 PM?",
          "Could we pull over the meeting to 4 PM?",
          "Could we back up the meeting to 4 PM?"
        ],
        correctIndex: 0,
        explanation: "'push back'은 미팅이나 일정을 뒤로 미룰 때 가장 널리 쓰이는 표준적인 비즈니스 숙어입니다.",
        culturalNuance: "'delay'나 'postpone'보다 'push back'이 실무 대화 및 슬랙에서 훨씬 부드럽고 자연스럽습니다."
      },
      {
        id: 2,
        question: "친구가 맛있는 음식을 먹고 'It hits the spot!'이라고 했습니다. 무슨 의미일까요?",
        situation: "추운 겨울날 뜨끈한 라멘 국물을 한 입 마시고 감탄하는 상황",
        options: [
          "음식이 너무 짜서 자극적이다.",
          "딱 원하던 바로 그 맛이다! (기막히게 맛있다)",
          "그 장소를 찾아가기가 너무 힘들었다.",
          "배가 불러서 더 이상 못 먹겠다."
        ],
        correctIndex: 1,
        explanation: "'hit the spot'은 갈증이나 허기, 기대를 완벽하게 충족시켜 만족스러울 때 쓰는 관용구입니다.",
        culturalNuance: "음식뿐만 아니라 시원한 음료나 마사지 등 피로를 풀어주는 상황에서도 자주 사용됩니다."
      },
      {
        id: 3,
        question: "동료의 의견에 100% 동의하며 '완전 내 말이 그 말이야!'라고 맞장구칠 때 쓰는 표현은?",
        situation: "복잡한 기획안을 간단히 줄이자는 동료의 제안에 강력히 찬성하는 상황",
        options: [
          "Tell me about it!",
          "Ask me about it!",
          "Talk to my hand!",
          "Hear me out!"
        ],
        correctIndex: 0,
        explanation: "'Tell me about it!'은 '그거에 대해 말해봐'가 아니라 '내 말이 그 말이야 / 내가 왜 모르겠어'라는 강한 공감 표현입니다.",
        culturalNuance: "상대방의 푸념이나 통찰에 깊이 동의할 때 고개를 끄덕이며 억양을 살려 말합니다."
      },
      {
        id: 4,
        question: "프로젝트 마감이 매우 촉박하여 발등에 불이 떨어진 상황을 나타내는 관용구는?",
        situation: "데모 발표 전날 밤까지 코드를 마무리해야 하는 긴박한 상황",
        options: [
          "We're down to the wire.",
          "We're under the bridge.",
          "We're up in the cloud.",
          "We're on the fence."
        ],
        correctIndex: 0,
        explanation: "'down to the wire'는 경마에서 결승선의 철사(wire)에 도달하기 직전의 긴박한 순간에서 유래된 이디엄입니다.",
        culturalNuance: "스타트업 및 IT 기업 스프린트 막바지에 자주 등장하는 핵심 표현입니다."
      }
    ]
  });

  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [qId: number]: number }>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const handleGenerateNewQuiz = async (topicToUse?: string) => {
    const activeTopic = topicToUse || topic;
    if (!activeTopic.trim() || isLoading) return;
    setIsLoading(true);
    setUserAnswers({});
    setCurrentIdx(0);
    setIsCompleted(false);

    try {
      const data = await generateQuiz({
        topic: activeTopic,
        targetLanguage: targetLang,
        nativeLanguage: nativeLang,
        level: userLevel,
      });
      setQuizData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (qId: number, optionIdx: number) => {
    if (userAnswers[qId] !== undefined) return; // already answered
    const updated = { ...userAnswers, [qId]: optionIdx };
    setUserAnswers(updated);

    // Check if this was the last question
    if (quizData && Object.keys(updated).length === quizData.questions.length) {
      setIsCompleted(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const currentQ = quizData?.questions[currentIdx];
  const totalQ = quizData?.questions.length || 0;
  const answeredCount = Object.keys(userAnswers).length;

  const calculateScore = () => {
    if (!quizData) return 0;
    let correct = 0;
    quizData.questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) correct++;
    });
    return correct;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-pink-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-md">
            <Trophy className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Situational & Cultural Quiz</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">상황별 실전 뉘앙스 퀴즈</h2>
          <p className="text-pink-100 text-xs sm:text-sm max-w-xl leading-relaxed">
            원어민들이 실제로 사용하는 생생한 관용 표현, 문화적 뉘앙스, 비즈니스 에티켓을 문제를 풀며 체득하세요.
          </p>
        </div>

        <button
          onClick={() => handleGenerateNewQuiz()}
          disabled={isLoading}
          className="px-5 py-3 rounded-xl bg-white text-slate-900 hover:bg-pink-50 text-xs font-bold transition-colors flex items-center gap-2 shadow-sm shrink-0"
        >
          <RefreshCw className={`w-4 h-4 text-pink-600 ${isLoading ? 'animate-spin' : ''}`} />
          <span>새 퀴즈 세트 생성</span>
        </button>
      </div>

      {quizData && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Header & Progress */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Question {currentIdx + 1} of {totalQ}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">{quizData.title}</h3>
            </div>
            <div className="flex items-center gap-1">
              {quizData.questions.map((q, idx) => {
                const ans = userAnswers[q.id];
                const isAnswered = ans !== undefined;
                const isCorrect = isAnswered && ans === q.correctIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                      currentIdx === idx
                        ? 'ring-2 ring-indigo-600 ring-offset-2'
                        : ''
                    } ${
                      !isAnswered
                        ? 'bg-slate-100 text-slate-600'
                        : isCorrect
                        ? 'bg-emerald-500 text-white'
                        : 'bg-rose-500 text-white'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Question */}
          {currentQ && (
            <div className="space-y-5">
              {currentQ.situation && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span><strong>상황 설정:</strong> {currentQ.situation}</span>
                </div>
              )}

              <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {currentQ.question}
              </h4>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt, optIdx) => {
                  const hasAnswered = userAnswers[currentQ.id] !== undefined;
                  const isSelected = userAnswers[currentQ.id] === optIdx;
                  const isCorrect = optIdx === currentQ.correctIndex;

                  let btnStyle = 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100';
                  if (hasAnswered) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold';
                    } else if (isSelected) {
                      btnStyle = 'bg-rose-50 border-rose-400 text-rose-950 font-bold';
                    } else {
                      btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(currentQ.id, optIdx)}
                      disabled={hasAnswered}
                      className={`w-full p-4 rounded-xl border text-left text-sm transition-all flex items-center justify-between ${btnStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>

                      {hasAnswered && (
                        <div>
                          {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                          {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-600" />}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Cultural Nuance (Shown after answering) */}
              {userAnswers[currentQ.id] !== undefined && (
                <div className="p-4 sm:p-5 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-2 text-xs text-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      LALA 정답 해설
                    </span>
                    <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                      userAnswers[currentQ.id] === currentQ.correctIndex
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {userAnswers[currentQ.id] === currentQ.correctIndex ? '정답입니다! 🎉' : '아쉬워요, 오답입니다!'}
                    </span>
                  </div>
                  <p className="leading-relaxed text-slate-700">{currentQ.explanation}</p>
                  {currentQ.culturalNuance && (
                    <div className="pt-2 border-t border-indigo-100/80 text-indigo-950 font-medium">
                      💡 <strong>원어민 뉘앙스 팁:</strong> {currentQ.culturalNuance}
                    </div>
                  )}
                </div>
              )}

              {/* Prev / Next controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
                  disabled={currentIdx === 0}
                  className="px-4 py-2 text-xs font-bold text-slate-600 disabled:opacity-30 hover:text-slate-900"
                >
                  이전 문제
                </button>

                {currentIdx < totalQ - 1 ? (
                  <button
                    onClick={() => setCurrentIdx(currentIdx + 1)}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                  >
                    <span>다음 문제</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleGenerateNewQuiz()}
                    className="px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                  >
                    <span>다른 주제 퀴즈 풀기</span>
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Quiz Completion Summary Card */}
          {isCompleted && (
            <div className="p-6 bg-gradient-to-br from-indigo-50 to-pink-50 border border-indigo-200 rounded-2xl text-center space-y-3">
              <Trophy className="w-10 h-10 text-amber-500 mx-auto" />
              <h4 className="font-black text-xl text-slate-900">퀴즈 완료!</h4>
              <p className="text-sm text-slate-600">
                총 {totalQ}문제 중 <strong className="text-indigo-700 font-bold">{calculateScore()}문제</strong>를 맞히셨습니다!
              </p>
              <div className="pt-2">
                <button
                  onClick={() => handleGenerateNewQuiz()}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  새로운 퀴즈 세트 도전하기
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
