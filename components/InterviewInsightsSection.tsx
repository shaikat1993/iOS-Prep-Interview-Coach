import React from 'react';

interface InterviewInsightsSectionProps {
  tips: string[];
  mistakes: string[];
}

const InterviewInsightsSection: React.FC<InterviewInsightsSectionProps> = ({ tips = [], mistakes = [] }) => {
  if ((!tips || tips.length === 0) && (!mistakes || mistakes.length === 0)) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Tips */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: 'rgba(234,179,8,0.04)',
          border: '1px solid rgba(234,179,8,0.15)',
          boxShadow: '0 0 30px rgba(234,179,8,0.04)',
        }}
      >
        <div className="flex items-center gap-2.5 mb-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.2)' }}
          >
            <svg className="w-3.5 h-3.5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <div>
            <h3 className="font-black text-yellow-300 text-sm">Interview Gold</h3>
            <p className="text-[10px] text-yellow-600/70 font-medium uppercase tracking-wide mt-0.5">What top-company interviewers look for</p>
          </div>
        </div>

        <ul className="space-y-3">
          {tips.map((tip, i) => (
            <li key={i} className="flex gap-3">
              <span
                className="flex-shrink-0 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center mt-0.5"
                style={{ background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.2)', color: '#fbbf24' }}
              >
                {i + 1}
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">{tip}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Mistakes */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: 'rgba(239,68,68,0.04)',
          border: '1px solid rgba(239,68,68,0.12)',
          boxShadow: '0 0 30px rgba(239,68,68,0.04)',
        }}
      >
        <div className="flex items-center gap-2.5 mb-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.18)' }}
          >
            <svg className="w-3.5 h-3.5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="font-black text-rose-300 text-sm">Common Mistakes</h3>
            <p className="text-[10px] text-rose-600/70 font-medium uppercase tracking-wide mt-0.5">What costs candidates the offer</p>
          </div>
        </div>

        <ul className="space-y-3">
          {mistakes.map((mistake, i) => (
            <li key={i} className="flex gap-3">
              <svg className="w-4 h-4 text-rose-500/70 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <p className="text-xs text-slate-400 leading-relaxed">{mistake}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default InterviewInsightsSection;
