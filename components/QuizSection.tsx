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
    setRevealed(prev => ({ ...prev, [questionIndex]: true }));
    if (Object.keys(revealed).length + 1 === questions.length) {
      setQuizComplete(true);
    }
  };

  const score = Object.entries(revealed).filter(([idx]) => 
    answers[parseInt(idx)] === questions[parseInt(idx)].correctIndex
  ).length;

  const resetQuiz = () => {
    setAnswers({});
    setRevealed({});
    setQuizComplete(false);
  };

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">🧠</span>
        <h2 className="text-xl font-bold text-slate-800">Interview Quiz</h2>
        <span className="text-sm text-slate-500 ml-2">Test your understanding</span>
        {Object.keys(revealed).length > 0 && (
          <span className="ml-auto text-sm font-semibold text-blue-600">
            Score: {score}/{Object.keys(revealed).length}
          </span>
        )}
      </div>

      <div className="space-y-6">
        {questions.map((q, qi) => {
          const selectedAnswer = answers[qi];
          const isRevealed = revealed[qi];
          const isCorrect = selectedAnswer === q.correctIndex;

          return (
            <div key={qi} className={`rounded-xl border-2 p-5 transition-all ${
              isRevealed 
                ? isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
                : 'border-slate-200 bg-white'
            }`}>
              <p className="font-semibold text-slate-800 mb-4">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold mr-2">{qi + 1}</span>
                {q.question}
              </p>
              
              <div className="space-y-2 mb-4">
                {q.options.map((option, oi) => {
                  let optionStyle = 'border-slate-200 bg-white hover:bg-slate-50 cursor-pointer';
                  if (selectedAnswer === oi && !isRevealed) {
                    optionStyle = 'border-blue-400 bg-blue-50 cursor-pointer';
                  }
                  if (isRevealed) {
                    if (oi === q.correctIndex) {
                      optionStyle = 'border-green-400 bg-green-100 cursor-default';
                    } else if (oi === selectedAnswer) {
                      optionStyle = 'border-red-400 bg-red-100 cursor-default';
                    } else {
                      optionStyle = 'border-slate-200 bg-slate-50 cursor-default opacity-60';
                    }
                  }

                  return (
                    <div
                      key={oi}
                      onClick={() => handleAnswer(qi, oi)}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${optionStyle}`}
                    >
                      <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        selectedAnswer === oi && !isRevealed ? 'border-blue-500 bg-blue-500 text-white' :
                        isRevealed && oi === q.correctIndex ? 'border-green-500 bg-green-500 text-white' :
                        isRevealed && oi === selectedAnswer ? 'border-red-500 bg-red-500 text-white' :
                        'border-slate-300 text-slate-500'
                      }`}>
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <span className="text-sm text-slate-700">{option}</span>
                      {isRevealed && oi === q.correctIndex && <span className="ml-auto text-green-600">✓</span>}
                      {isRevealed && oi === selectedAnswer && oi !== q.correctIndex && <span className="ml-auto text-red-600">✗</span>}
                    </div>
                  );
                })}
              </div>

              {!isRevealed && (
                <button
                  onClick={() => revealAnswer(qi)}
                  disabled={selectedAnswer === undefined}
                  className="text-sm px-4 py-2 rounded-lg bg-blue-600 text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                >
                  Check Answer
                </button>
              )}

              {isRevealed && (
                <div className={`mt-3 p-3 rounded-lg text-sm ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  <strong>{isCorrect ? '✅ Correct!' : '❌ Not quite.'}</strong> {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {quizComplete && (
        <div className="mt-6 p-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center">
          <div className="text-3xl mb-2">{score === questions.length ? '🏆' : score >= questions.length / 2 ? '👍' : '📚'}</div>
          <p className="text-lg font-bold">Quiz Complete! Score: {score}/{questions.length}</p>
          <p className="text-sm opacity-80 mt-1">
            {score === questions.length ? 'Perfect score! You really know this topic.' : 
             score >= questions.length / 2 ? 'Good understanding. Review the missed questions.' :
             'Keep studying. Re-read the deep dive above.'}
          </p>
          <button onClick={resetQuiz} className="mt-3 px-4 py-2 bg-white text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors">
            Retake Quiz
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizSection;
