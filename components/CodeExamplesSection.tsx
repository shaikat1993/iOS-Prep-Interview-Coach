import React, { useState } from 'react';
import { CodeExample } from '../types';

interface CodeExamplesSectionProps {
  examples: CodeExample[];
}

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

  const levelColors = ['bg-green-100 text-green-700 border-green-200', 'bg-yellow-100 text-yellow-700 border-yellow-200', 'bg-red-100 text-red-700 border-red-200'];
  const levelLabels = ['Basic', 'Intermediate', 'Advanced'];

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">💻</span>
        <h2 className="text-xl font-bold text-slate-800">Code Examples</h2>
        <span className="text-sm text-slate-500 ml-2">Progressive learning</span>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {examples.map((ex, i) => (
          <button
            key={i}
            onClick={() => setActiveExample(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              activeExample === i 
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                : `${levelColors[i] || 'bg-slate-100 text-slate-700 border-slate-200'} hover:opacity-80`
            }`}
          >
            {levelLabels[i] || `Example ${i + 1}`}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span className="ml-3 text-slate-300 text-xs font-mono truncate max-w-[200px] md:max-w-md">{examples[activeExample]?.title}</span>
          </div>
          <button
            onClick={copyCode}
            className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1 flex-shrink-0"
          >
            {copied ? '✓ Copied!' : '⎘ Copy'}
          </button>
        </div>
        <pre className="bg-slate-900 p-5 overflow-x-auto text-sm">
          <code className="text-green-300 font-mono leading-relaxed whitespace-pre">
            {examples[activeExample]?.code}
          </code>
        </pre>
        <div className="p-4 bg-blue-50 border-t border-blue-100">
          <p className="text-sm text-blue-800">
            <strong>💡 What this shows:</strong> {examples[activeExample]?.explanation}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CodeExamplesSection;
