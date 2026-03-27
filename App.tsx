
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { TOPICS } from './constants';
import { Topic, DeepDiveResponse } from './types';
import { getDeepDive } from './services/geminiService';
import MemoryDiagram from './components/MemoryDiagram';
import MarkdownRenderer from './components/MarkdownRenderer';
import QuizSection from './components/QuizSection';
import CodeExamplesSection from './components/CodeExamplesSection';
import InterviewInsightsSection from './components/InterviewInsightsSection';
import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, increment } from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: { userId: 'anonymous' },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

const TABS = [
  { id: 'study', label: 'Study' },
  { id: 'code',  label: 'Code' },
  { id: 'quiz',  label: 'Quiz' },
  { id: 'tips',  label: 'Tips' },
] as const;

const App: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<DeepDiveResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'study' | 'code' | 'quiz' | 'tips'>('study');
  const [searchQuery, setSearchQuery] = useState('');
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('completedTopics');
    if (saved) {
      try { return new Set(JSON.parse(saved)); } catch { return new Set(); }
    }
    return new Set();
  });

  useEffect(() => {
    localStorage.setItem('completedTopics', JSON.stringify(Array.from(completedTopics)));
  }, [completedTopics]);

  useEffect(() => {
    const statsDocRef = doc(db, 'stats', 'global');
    const unsubscribe = onSnapshot(statsDocRef, (snapshot) => {
      if (snapshot.exists()) {
        setVisitorCount(snapshot.data().visitorCount);
      } else {
        setDoc(statsDocRef, { visitorCount: 0 }).catch(err => handleFirestoreError(err, OperationType.WRITE, 'stats/global'));
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'stats/global'));

    const hasVisited = sessionStorage.getItem('hasVisited');
    if (!hasVisited) {
      const incrementVisitor = async () => {
        try {
          const snapshot = await getDoc(statsDocRef);
          if (snapshot.exists()) {
            await updateDoc(statsDocRef, { visitorCount: increment(1) });
          } else {
            await setDoc(statsDocRef, { visitorCount: 1 });
          }
          sessionStorage.setItem('hasVisited', 'true');
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, 'stats/global');
        }
      };
      incrementVisitor();
    }
    return () => unsubscribe();
  }, []);

  const handleTopicClick = useCallback(async (topic: Topic) => {
    setSelectedTopic(topic);
    setLoading(true);
    setResponse(null);
    setError(null);
    setActiveTab('study');
    try {
      const data = await getDeepDive(topic.query);
      setResponse(data);
    } catch (err) {
      console.error(err);
      setError("All API keys are currently rate-limited. Please try again in a minute.");
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleCompleted = (topicId: string) => {
    setCompletedTopics(prev => {
      const next = new Set(prev);
      if (next.has(topicId)) next.delete(topicId); else next.add(topicId);
      return next;
    });
  };

  const filteredTopics = useMemo(() =>
    TOPICS.filter(t =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
    ), [searchQuery]);

  const groupedTopics = useMemo(() => {
    const groups: Record<string, Topic[]> = {};
    filteredTopics.forEach(topic => {
      if (!groups[topic.category]) groups[topic.category] = [];
      groups[topic.category].push(topic);
    });
    return groups;
  }, [filteredTopics]);

  const progress = Math.round((completedTopics.size / TOPICS.length) * 100);

  return (
    <div className="min-h-screen bg-[#08090e] flex flex-col md:flex-row overflow-hidden h-screen font-sans">

      {/* ── SIDEBAR ── */}
      <aside className="w-full md:w-72 bg-[#0c0f1c] border-r border-white/[0.05] flex flex-col h-full z-20 flex-shrink-0">

        {/* Logo + Progress + Search */}
        <div className="p-5 border-b border-white/[0.05] sticky top-0 z-10 bg-[#0c0f1c]">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-base flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                boxShadow: '0 0 16px rgba(59,130,246,0.5), 0 0 40px rgba(59,130,246,0.15)',
              }}
            >
              i
            </div>
            <div>
              <h1 className="font-black text-white tracking-tight text-base leading-none">iOS Prep</h1>
              <p className="text-[9px] text-blue-400 font-bold tracking-[0.2em] uppercase mt-0.5">Interview Coach</p>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Progress</span>
              <span className="text-[10px] font-black text-blue-400">{completedTopics.size}/{TOPICS.length}</span>
            </div>
            <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out progress-glow"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #2563eb, #60a5fa)',
                }}
              />
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl py-2 px-4 pl-9 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all duration-200"
            />
            <svg className="w-3.5 h-3.5 text-slate-600 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Topic List */}
        <nav className="flex-1 overflow-y-auto py-3 custom-scrollbar">
          {Object.entries(groupedTopics).map(([category, topics]) => (
            <div key={category} className="mb-5 px-3">
              <h3 className="text-[8px] font-black text-slate-600 uppercase tracking-[0.25em] mb-2 px-2 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-blue-500/60 inline-block" />
                {category}
              </h3>
              <div className="space-y-0.5">
                {topics.map((topic) => {
                  const isActive = selectedTopic?.id === topic.id;
                  return (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicClick(topic)}
                      className={`w-full text-left px-2.5 py-2.5 rounded-xl transition-all duration-200 group flex items-start gap-2.5 border relative cursor-pointer ${
                        isActive ? 'topic-active border-blue-500/30' : 'border-transparent hover:bg-white/[0.04] hover:border-white/[0.06]'
                      }`}
                    >
                      <span className="text-base leading-none mt-0.5 flex-shrink-0">{topic.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold text-xs truncate pr-5 transition-colors ${isActive ? 'text-blue-300' : 'text-slate-400 group-hover:text-slate-200'}`}>
                          {topic.title}
                        </div>
                        <div className={`text-[10px] line-clamp-1 mt-0.5 transition-colors ${isActive ? 'text-blue-400/60' : 'text-slate-600'}`}>
                          {topic.description}
                        </div>
                      </div>
                      {completedTopics.has(topic.id) && (
                        <div className="absolute right-2.5 top-3">
                          <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Cards */}
        <div className="p-3 border-t border-white/[0.05] space-y-2">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">System</span>
              <span className="status-dot-active w-1.5 h-1.5 rounded-full block" />
            </div>
            <p className="text-[11px] font-bold text-emerald-400 mt-0.5">Online</p>
          </div>

          {visitorCount !== null && (
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Visitors</span>
                <svg className="w-3 h-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <p className="text-base font-black visitor-number">{visitorCount.toLocaleString()}</p>
            </div>
          )}
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 overflow-y-auto relative custom-scrollbar bg-[#08090e]">

        {!selectedTopic ? (
          /* ── WELCOME SCREEN ── */
          <div className="relative min-h-full flex flex-col items-center justify-center text-center px-6 py-20 overflow-hidden">

            {/* Ambient Orbs */}
            <div className="orb-blue w-[600px] h-[600px] -top-40 -left-40 animate-orb-drift" style={{ animationDelay: '0s' }} />
            <div className="orb-purple w-[500px] h-[500px] -bottom-20 -right-20 animate-orb-drift" style={{ animationDelay: '-4s' }} />
            <div className="orb-cyan w-[400px] h-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-orb-drift" style={{ animationDelay: '-8s' }} />

            {/* Grid overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.025]"
              style={{
                backgroundImage: 'linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)',
                backgroundSize: '60px 60px',
              }}
            />

            {/* Star particles */}
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="star"
                style={{
                  left: `${(i * 17 + 5) % 100}%`,
                  top: `${(i * 23 + 10) % 100}%`,
                  '--duration': `${3 + (i % 4)}s`,
                  '--delay': `${(i * 0.4) % 3}s`,
                  '--max-opacity': `${0.2 + (i % 3) * 0.1}`,
                } as React.CSSProperties}
              />
            ))}

            <div className="relative z-10 max-w-2xl mx-auto">
              {/* Floating Logo */}
              <div className="relative mb-10 flex justify-center">
                <div
                  className="relative w-28 h-28 rounded-[2rem] flex items-center justify-center animate-float"
                  style={{
                    background: 'linear-gradient(135deg, #111827 0%, #1e2a42 100%)',
                    border: '1px solid rgba(59,130,246,0.2)',
                    boxShadow: '0 0 40px rgba(59,130,246,0.25), 0 0 80px rgba(59,130,246,0.08), 0 24px 48px rgba(0,0,0,0.5)',
                  }}
                >
                  <span className="text-5xl select-none">🍎</span>
                  {/* Orbit ring */}
                  <div
                    className="absolute inset-0 rounded-[2rem] border border-blue-500/20 animate-spin-slow"
                    style={{ margin: '-8px' }}
                  />
                </div>
              </div>

              {/* Headline */}
              <h2 className="text-5xl md:text-6xl font-black tracking-tight leading-none mb-5 animate-fade-in-up">
                <span className="gradient-text-white">Master the</span>
                <br />
                <span className="gradient-text"> iOS Interview</span>
              </h2>

              <p className="text-slate-500 text-lg font-medium mb-10 leading-relaxed max-w-lg mx-auto animate-fade-in-up animate-delay-100">
                A world-class interactive preparation tool for senior engineering roles.
                AI-powered deep dives, interactive diagrams &amp; quizzes.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 w-full mb-10 animate-fade-in-up animate-delay-200">
                {[
                  { value: TOPICS.length, label: 'Topics' },
                  { value: new Set(TOPICS.map(t => t.category)).size, label: 'Categories' },
                  { value: '∞', label: 'AI Depth' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="glass-card p-4 rounded-2xl"
                    style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)' }}
                  >
                    <div className="text-2xl font-black gradient-text">{stat.value}</div>
                    <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={() => handleTopicClick(TOPICS[0])}
                className="btn-primary-glow text-white px-10 py-4 rounded-2xl font-black text-base flex items-center gap-3 mx-auto animate-fade-in-up animate-delay-300"
              >
                Start Studying
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>

        ) : (
          /* ── TOPIC VIEW ── */
          <div className="max-w-4xl mx-auto px-6 md:px-10 py-10 pb-32 animate-fade-in">

            {/* Header */}
            <header className="mb-10">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <span className="category-badge px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {selectedTopic.category}
                  </span>
                  <span className="text-slate-700">/</span>
                  <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Deep Dive</span>
                </div>

                {response && !loading && (
                  <button
                    onClick={() => toggleCompleted(selectedTopic.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all duration-200 border ${
                      completedTopics.has(selectedTopic.id)
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-white/[0.03] text-slate-500 border-white/[0.07] hover:border-blue-500/40 hover:text-blue-400'
                    }`}
                  >
                    {completedTopics.has(selectedTopic.id) ? (
                      <>
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Studied
                      </>
                    ) : 'Mark Studied'}
                  </button>
                )}
              </div>

              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none mb-4 gradient-text-white">
                {selectedTopic.title}
              </h2>
              <p className="text-slate-500 text-base font-medium max-w-2xl leading-relaxed">
                {selectedTopic.description}
              </p>
            </header>

            {/* Tabs */}
            <div
              className="flex gap-1 p-1 rounded-2xl mb-10 sticky top-4 z-10"
              style={{
                background: 'rgba(12, 15, 28, 0.85)',
                border: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
            >
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all duration-200 border ${
                    activeTab === tab.id
                      ? 'tab-active'
                      : 'text-slate-600 hover:text-slate-400 border-transparent hover:bg-white/[0.03]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Loading */}
            {loading && (
              <div className="space-y-10 py-10 animate-fade-in">
                <div className="flex flex-col items-center justify-center gap-6">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-2 border-white/[0.05]" />
                    <div
                      className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin"
                      style={{ boxShadow: '0 0 16px rgba(59,130,246,0.4)' }}
                    />
                    <div className="absolute inset-2 rounded-full border border-blue-400/20 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }} />
                  </div>
                  <p className="text-xs text-slate-600 font-black tracking-[0.3em] uppercase animate-pulse">
                    Synthesizing Expert Content
                  </p>
                </div>
                <div className="space-y-3 max-w-2xl mx-auto">
                  {[100, 83, 67, 91, 75].map((w, i) => (
                    <div key={i} className="skeleton h-3 rounded-full" style={{ width: `${w}%` }} />
                  ))}
                  <div className="h-4" />
                  {[88, 72, 95, 60].map((w, i) => (
                    <div key={i} className="skeleton h-3 rounded-full" style={{ width: `${w}%` }} />
                  ))}
                </div>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div
                className="p-8 rounded-3xl border border-rose-500/20 animate-scale-in"
                style={{ background: 'rgba(239,68,68,0.05)', boxShadow: '0 0 40px rgba(239,68,68,0.08)' }}
              >
                <div className="flex items-center gap-4 mb-3">
                  <div
                    className="p-3 rounded-xl"
                    style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.2)' }}
                  >
                    <svg className="w-6 h-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-black text-rose-300 text-lg">Error</h3>
                    <p className="text-rose-500/70 text-sm">Content generation failed</p>
                  </div>
                </div>
                <p className="text-rose-400/80 text-sm leading-relaxed">{error}</p>
              </div>
            )}

            {/* Content */}
            {!loading && !error && response && (
              <div className="animate-fade-in-up">
                {activeTab === 'study' && (
                  <div className="space-y-8">
                    {response.diagramData && (
                      <section>
                        <div className="flex items-center gap-2.5 mb-4">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{
                              background: 'rgba(59,130,246,0.15)',
                              border: '1px solid rgba(59,130,246,0.2)',
                              boxShadow: '0 0 12px rgba(59,130,246,0.15)',
                            }}
                          >
                            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.172-1.172a4 4 0 015.656 0l1.172 1.172a4 4 0 010 5.656l-1.172 1.172a4 4 0 01-5.656 0L11 11.657" />
                            </svg>
                          </div>
                          <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Architectural Visualization</h3>
                        </div>
                        <div
                          className="rounded-2xl overflow-hidden"
                          style={{ border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 0 40px rgba(59,130,246,0.06)' }}
                        >
                          <MemoryDiagram nodes={response.diagramData.nodes} links={response.diagramData.links} />
                        </div>
                      </section>
                    )}

                    <article
                      className="p-7 md:p-10 rounded-2xl"
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        boxShadow: '0 4px 40px rgba(0,0,0,0.3)',
                      }}
                    >
                      <MarkdownRenderer content={response.content} />
                    </article>
                  </div>
                )}

                {activeTab === 'code' && <CodeExamplesSection examples={response.codeExamples} />}
                {activeTab === 'quiz' && <QuizSection questions={response.quizQuestions} />}
                {activeTab === 'tips' && (
                  <InterviewInsightsSection tips={response.interviewTips} mistakes={response.commonMistakes} />
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className="fixed bottom-0 left-0 right-0 py-3 px-8 text-center text-[9px] text-slate-700 font-black tracking-[0.35em] uppercase z-30 md:left-72"
        style={{
          background: 'rgba(8,9,14,0.9)',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          backdropFilter: 'blur(12px)',
        }}
      >
        Engineered By Md Sadidur Rahman
      </footer>
    </div>
  );
};

export default App;
