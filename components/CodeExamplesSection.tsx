import React, { useState } from 'react';
import { CodeExample } from '../types';

interface CodeExamplesSectionProps {
  examples: CodeExample[];
}

const LEVEL_STYLES = [
  { label: 'Basic',        active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',  inactive: 'text-slate-600 border-white/[0.06] hover:text-emerald-400 hover:border-emerald-500/20' },
  { label: 'Intermediate', active: 'bg-amber-500/15 text-amber-400 border-amber-500/30',        inactive: 'text-slate-600 border-white/[0.06] hover:text-amber-400 hover:border-amber-500/20' },
  { label: 'Advanced',     active: 'bg-rose-500/15 text-rose-400 border-rose-500/30',           inactive: 'text-slate-600 border-white/[0.06] hover:text-rose-400 hover:border-rose-500/20' },
];

const CodeExamplesSection: React.FC<CodeExamplesSectionProps> = ({ examples }) => {
  if (!examples || examples.length === 0) return null;

  const [activeExample, setActiveExample] = useState(0);
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    if (!examples[activeExample]) return;
    navigator.clipboard.writeText(examples[activeExample].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Level selector */}
      <div className="flex gap-2 flex-wrap">
        {examples.map((_, i) => {
          const style = LEVEL_STYLES[i] ?? LEVEL_STYLES[2];
          return (
            <button
              key={i}
              onClick={() => setActiveExample(i)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200 ${
                activeExample === i ? style.active : style.inactive
              }`}
            >
              {style.label}
            </button>
          );
        })}
      </div>

      {/* Code block */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 4px 40px rgba(0,0,0,0.5)' }}
      >
        {/* Editor chrome */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ background: '#0d1117', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span
              className="ml-3 text-slate-500 text-[11px] font-mono truncate max-w-[180px] md:max-w-sm"
            >
              {examples[activeExample]?.title}
            </span>
          </div>
          <button
            onClick={copyCode}
            className={`text-[11px] font-bold flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all duration-200 ${
              copied
                ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                : 'text-slate-600 hover:text-slate-300 border border-transparent hover:border-white/[0.08] hover:bg-white/[0.04]'
            }`}
          >
            {copied ? (
              <>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>

        {/* Code */}
        <pre
          className="p-5 overflow-x-auto text-sm custom-scrollbar"
          style={{ background: '#0a0d1a', minHeight: '180px' }}
        >
          <code className="font-mono leading-relaxed whitespace-pre" style={{ color: '#a5b4fc', fontSize: '0.8rem' }}>
            {examples[activeExample]?.code}
          </code>
        </pre>

        {/* Explanation */}
        <div
          className="px-5 py-4"
          style={{
            background: 'rgba(59,130,246,0.04)',
            borderTop: '1px solid rgba(59,130,246,0.1)',
          }}
        >
          <div className="flex items-start gap-2.5">
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.2)' }}
            >
              <svg className="w-3 h-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              <span className="font-bold text-blue-400">What this shows: </span>
              {examples[activeExample]?.explanation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeExamplesSection;
