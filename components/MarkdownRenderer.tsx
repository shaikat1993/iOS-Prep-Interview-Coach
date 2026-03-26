
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="markdown-body">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]} 
        components={{
          // Custom handling for headings to add section-specific styling
          h2: ({ children }) => {
            const text = children?.toString() || '';
            let borderClass = 'border-l-4 pl-4 ';
            
            if (text.includes('🎯')) borderClass += 'border-blue-500 bg-blue-50/30';
            else if (text.includes('🔬')) borderClass += 'border-purple-500 bg-purple-50/30';
            else if (text.includes('⚡')) borderClass += 'border-orange-500 bg-orange-50/30';
            else if (text.includes('🚨')) borderClass += 'border-red-500 bg-red-50/30';
            else if (text.includes('📊')) borderClass += 'border-teal-500 bg-teal-50/30';
            else borderClass = 'border-b border-slate-200 pb-2';

            return (
              <h2 className={`py-3 rounded-r-xl transition-all ${borderClass}`}>
                {children}
              </h2>
            );
          },
          // Custom blockquote for Mental Models
          blockquote: ({ children }) => (
            <blockquote className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <div className="font-bold text-blue-600 text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                <span>🧠</span> Mental Model
              </div>
              {children}
            </blockquote>
          ),
          // Custom handling for code blocks to avoid hydration errors
          pre: ({ children }) => {
            return (
              <div className="relative group my-8">
                <div className="absolute right-4 top-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-800/50 backdrop-blur-sm px-2 py-1 rounded border border-slate-700 z-10 select-none">
                  Swift
                </div>
                <pre className="!m-0 shadow-2xl">
                  {children}
                </pre>
              </div>
            );
          },
          code: ({ inline, className, children, ...props }: any) => {
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
