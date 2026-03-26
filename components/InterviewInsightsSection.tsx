import React from 'react';

interface InterviewInsightsSectionProps {
  tips: string[];
  mistakes: string[];
}

const InterviewInsightsSection: React.FC<InterviewInsightsSectionProps> = ({ tips = [], mistakes = [] }) => {
  if ((!tips || tips.length === 0) && (!mistakes || mistakes.length === 0)) return null;

  return (
    <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🎯</span>
          <h3 className="font-bold text-amber-900">Interview Gold</h3>
        </div>
        <p className="text-xs text-amber-700 mb-3 font-medium uppercase tracking-wide">What top-company interviewers actually look for</p>
        <ul className="space-y-3">
          {tips.map((tip, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-400 text-amber-900 text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
              <p className="text-sm text-amber-800">{tip}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">⚠️</span>
          <h3 className="font-bold text-red-900">Common Mistakes</h3>
        </div>
        <p className="text-xs text-red-700 mb-3 font-medium uppercase tracking-wide">What costs candidates the job offer</p>
        <ul className="space-y-3">
          {mistakes.map((mistake, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex-shrink-0 text-red-500 mt-0.5 font-bold">✗</span>
              <p className="text-sm text-red-800">{mistake}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default InterviewInsightsSection;
