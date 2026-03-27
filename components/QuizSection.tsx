import React, { useState } from 'react';
import { QuizQuestion } from '../types';

interface QuizSectionProps {
  questions: QuizQuestion[];
}

const QuizSection: React.FC<QuizSectionProps> = ({ questions }) => {
  if (!questions || questions.length === 0) return null;

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [quizComplete, setQuizComplete] = useState(false);

  const handleAnswer = (questionIndex: number, optionIndex: number) => {
    if (revealed[questionIndex]) return;
    setAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const revealAnswer = (questionIndex: number) => {
    if (answers[questionIndex] === undefined) return;
    const newRevealed = { ...revealed, [questionIndex]: true };
    setRevealed(newRevealed);
    if (Object.keys(newRevealed).length === questions.length) setQuizComplete(true);
  };

  const score = Object.entries(revealed).filter(([idx]) =>
    answers[parseInt(idx)] === questions[parseInt(idx)].correctIndex
  ).length;

  const resetQuiz = () => { setAnswers({}); setRevealed({}); setQuizComplete(false); };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-slate-200">Interview Quiz</h2>
          <p className="text-xs text-slate-600 mt-0.5">Test your real understanding</p>
        </div>
        {Object.keys(revealed).length > 0 && (
          <div
            className="px-3 py-1.5 rounded-xl text-xs font-black"
            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa' }}
          >
            Score: {score} / {Object.keys(revealed).length}
          </div>
        )}
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((q, qi) => {
          const selectedAnswer = answers[qi];
          const isRevealed = revealed[qi];
          const isCorrect = selectedAnswer === q.correctIndex;

          const cardBorder = isRevealed
            ? isCorrect ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'
            : 'rgba(255,255,255,0.05)';
          const cardBg = isRevealed
            ? isCorrect ? 'rgba(34,197,94,0.04)' : 'rgba(239,68,68,0.04)'
            : 'rgba(255,255,255,0.02)';

          return (
            <div
              key={qi}
              className="rounded-2xl p-5 transition-all duration-300"
              style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
            >
              {/* Question */}
              <p className="font-semibold text-slate-200 text-sm mb-4 leading-relaxed flex items-start gap-3">
                <span
                  className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa' }}
                >
                  {qi + 1}
                </span>
                {q.question}
              </p>

              {/* Options */}
              <div className="space-y-2 mb-4">
                {q.options.map((option, oi) => {
                  let bg = 'rgba(255,255,255,0.02)';
                  let border = 'rgba(255,255,255,0.06)';
                  let textColor = 'text-slate-400';
                  let cursor = 'cursor-pointer';
                  let dotBg = 'rgba(255,255,255,0.06)';
                  let dotText = 'text-slate-600';

                  if (!isRevealed && selectedAnswer === oi) {
                    bg = 'rgba(59,130,246,0.08)';
                    border = 'rgba(59,130,246,0.35)';
                    textColor = 'text-slate-200';
                    dotBg = '#3b82f6';
                    dotText = 'text-white';
                  }
                  if (isRevealed) {
                    cursor = 'cursor-default';
                    if (oi === q.correctIndex) {
                      bg = 'rgba(34,197,94,0.08)';
                      border = 'rgba(34,197,94,0.3)';
                      textColor = 'text-emerald-300';
                      dotBg = '#22c55e';
                      dotText = 'text-white';
                    } else if (oi === selectedAnswer) {
                      bg = 'rgba(239,68,68,0.08)';
                      border = 'rgba(239,68,68,0.25)';
                      textColor = 'text-rose-400';
                      dotBg = '#ef4444';
                      dotText = 'text-white';
                    } else {
                      textColor = 'text-slate-700';
                    }
                  }

                  return (
                    <div
                      key={oi}
                      onClick={() => handleAnswer(qi, oi)}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${textColor} ${cursor}`}
                      style={{ background: bg, borderColor: border }}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${dotText}`}
                        style={{ background: dotBg }}
                      >
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <span className="text-xs leading-relaxed">{option}</span>
                      {isRevealed && oi === q.correctIndex && (
                        <svg className="w-4 h-4 text-emerald-400 ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {isRevealed && oi === selectedAnswer && oi !== q.correctIndex && (
                        <svg className="w-4 h-4 text-rose-400 ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Check / Explanation */}
              {!isRevealed ? (
                <button
                  onClick={() => revealAnswer(qi)}
                  disabled={selectedAnswer === undefined}
                  className="text-xs px-4 py-2 rounded-xl font-bold transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                  style={
                    selectedAnswer !== undefined
                      ? {
                          background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                          color: '#fff',
                          boxShadow: '0 0 12px rgba(59,130,246,0.3)',
                        }
                      : { background: 'rgba(255,255,255,0.05)', color: '#475569' }
                  }
                >
                  Check Answer
                </button>
              ) : (
                <div
                  className="mt-1 p-3.5 rounded-xl text-xs leading-relaxed"
                  style={{
                    background: isCorrect ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
                    border: `1px solid ${isCorrect ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`,
                    color: isCorrect ? '#86efac' : '#fca5a5',
                  }}
                >
                  <span className="font-black">{isCorrect ? '✓ Correct! ' : '✗ Not quite. '}</span>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quiz Complete Banner */}
      {quizComplete && (
        <div
          className="p-6 rounded-2xl text-center animate-scale-in"
          style={{
            background: 'linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(109,40,217,0.15) 100%)',
            border: '1px solid rgba(99,102,241,0.2)',
            boxShadow: '0 0 40px rgba(59,130,246,0.1)',
          }}
        >
          <div className="text-3xl mb-2">
            {score === questions.length ? '🏆' : score >= questions.length / 2 ? '👍' : '📚'}
          </div>
          <p className="text-lg font-black gradient-text mb-1">
            {score} / {questions.length} Correct
          </p>
          <p className="text-xs text-slate-500 mb-4">
            {score === questions.length
              ? 'Perfect! You really know this topic.'
              : score >= questions.length / 2
              ? 'Good understanding. Review the missed ones.'
              : 'Keep studying — re-read the deep dive above.'}
          </p>
          <button
            onClick={resetQuiz}
            className="px-5 py-2 rounded-xl text-xs font-black transition-all duration-200"
            style={{
              background: 'rgba(59,130,246,0.15)',
              border: '1px solid rgba(59,130,246,0.25)',
              color: '#60a5fa',
            }}
          >
            Retake Quiz
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizSection;
