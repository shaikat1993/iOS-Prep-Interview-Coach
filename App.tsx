
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
    authInfo: {
      userId: 'anonymous', // We are allowing public read/write for stats
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

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
      try {
        return new Set(JSON.parse(saved));
      } catch (e) {
        return new Set();
      }
    }
    return new Set();
  });

  useEffect(() => {
    localStorage.setItem('completedTopics', JSON.stringify(Array.from(completedTopics)));
  }, [completedTopics]);

  // Visitor Counter Logic
  useEffect(() => {
    const statsDocRef = doc(db, 'stats', 'global');
    
    // Listen for real-time updates
    const unsubscribe = onSnapshot(statsDocRef, (snapshot) => {
      if (snapshot.exists()) {
        setVisitorCount(snapshot.data().visitorCount);
      } else {
        // Initialize if doesn't exist
        setDoc(statsDocRef, { visitorCount: 0 }).catch(err => handleFirestoreError(err, OperationType.WRITE, 'stats/global'));
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'stats/global'));

    // Increment count once per session
    const hasVisited = sessionStorage.getItem('hasVisited');
    if (!hasVisited) {
      const incrementVisitor = async () => {
        try {
          const snapshot = await getDoc(statsDocRef);
          if (snapshot.exists()) {
            await updateDoc(statsDocRef, {
              visitorCount: increment(1)
            });
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
      setError("Failed to load deep dive. Please ensure your API key is correct.");
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleCompleted = (topicId: string) => {
    setCompletedTopics(prev => {
      const next = new Set(prev);
      if (next.has(topicId)) next.delete(topicId);
      else next.add(topicId);
      return next;
    });
  };

  const filteredTopics = useMemo(() => {
    return TOPICS.filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

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
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden h-screen font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col h-full shadow-sm z-20 transition-all">
        <div className="p-6 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200">
              i
            </div>
            <div>
              <h1 className="font-black text-slate-900 tracking-tight text-lg leading-none">iOS Prep</h1>
              <p className="text-[10px] text-blue-600 font-bold tracking-widest uppercase mt-1">Interview Coach</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Progress</span>
              <span className="text-xs font-black text-blue-600">{completedTopics.size} / {TOPICS.length}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <input 
              type="text"
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
          {Object.entries(groupedTopics).map(([category, topics]) => (
            <div key={category} className="space-y-3">
              <h3 className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                {category}
              </h3>
              <div className="space-y-1">
                {topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicClick(topic)}
                    className={`w-full text-left px-3 py-3 rounded-xl transition-all duration-200 group flex items-start gap-3 border relative ${
                      selectedTopic?.id === topic.id
                        ? 'bg-blue-50 border-blue-100 text-blue-700 shadow-sm ring-1 ring-blue-500/5'
                        : 'bg-white border-transparent hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="text-xl leading-none mt-0.5">{topic.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate pr-6">{topic.title}</div>
                      <div className={`text-[11px] line-clamp-1 mt-0.5 ${
                        selectedTopic?.id === topic.id ? 'text-blue-600/70' : 'text-slate-400'
                      }`}>
                        {topic.description}
                      </div>
                    </div>
                    {completedTopics.has(topic.id) && (
                      <div className="absolute right-3 top-4 text-green-500">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Status</h4>
              <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
            </div>
            <p className="text-[11px] font-bold text-slate-600">Active</p>
          </div>
          
          {visitorCount !== null && (
            <div className="mt-2 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Visitors</h4>
                <svg className="w-3 h-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <p className="text-lg font-black text-slate-900">{visitorCount.toLocaleString()}</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-12 relative custom-scrollbar">
        {!selectedTopic ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto py-20">
            <div className="relative mb-12">
              <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 animate-pulse"></div>
              <div className="relative w-32 h-32 bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center rotate-12 hover:rotate-0 transition-all duration-500 border border-slate-100">
                <span className="text-6xl">🍎</span>
              </div>
            </div>
            
            <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
              Master the <span className="text-blue-600">iOS Interview</span>
            </h2>
            <p className="text-slate-500 text-xl font-medium mb-12 leading-relaxed">
              A world-class interactive preparation tool for senior engineering roles. 
              Deep dives, interactive diagrams, and AI-powered insights.
            </p>

            <div className="grid grid-cols-2 gap-4 w-full mb-12">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="text-3xl font-black text-slate-900 mb-1">{TOPICS.length}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Core Topics</div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="text-3xl font-black text-slate-900 mb-1">
                  {new Set(TOPICS.map(t => t.category)).size}
                </div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Categories</div>
              </div>
            </div>

            <button 
              onClick={() => handleTopicClick(TOPICS[0])}
              className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center gap-3"
            >
              Start Studying
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto pb-32">
            {/* Header */}
            <header className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100">
                    {selectedTopic.category}
                  </span>
                  <span className="text-slate-300">/</span>
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Deep Dive</span>
                </div>
                
                {response && !loading && (
                  <button 
                    onClick={() => toggleCompleted(selectedTopic.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                      completedTopics.has(selectedTopic.id)
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-500 hover:text-blue-600'
                    }`}
                  >
                    {completedTopics.has(selectedTopic.id) ? (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Studied
                      </>
                    ) : (
                      <>Mark as Studied ✓</>
                    )}
                  </button>
                )}
              </div>
              
              <h2 className="text-6xl font-black text-slate-900 tracking-tight leading-none mb-6">
                {selectedTopic.title}
              </h2>
              <p className="text-slate-500 text-xl font-medium max-w-2xl leading-relaxed">
                {selectedTopic.description}
              </p>
            </header>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl mb-12 sticky top-0 z-10 backdrop-blur-md bg-slate-100/80 border border-slate-200">
              {[
                { id: 'study', label: '📖 Study Material' },
                { id: 'code', label: '💻 Code Examples' },
                { id: 'quiz', label: '🧠 Quiz' },
                { id: 'tips', label: '🎯 Interview Tips' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Loading State */}
            {loading ? (
              <div className="space-y-12 py-12">
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-4 border-blue-600/10 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-sm text-slate-400 mt-8 font-black tracking-widest uppercase animate-pulse">
                    Synthesizing Expert Content...
                  </p>
                </div>
                <div className="space-y-6 max-w-2xl mx-auto">
                  <div className="h-4 bg-slate-200 rounded-full w-full animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded-full w-5/6 animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded-full w-4/6 animate-pulse"></div>
                </div>
              </div>
            ) : error ? (
              <div className="bg-rose-50 border-2 border-rose-100 p-10 rounded-[2.5rem] text-rose-900 shadow-xl shadow-rose-100/50">
                <div className="flex items-center gap-6 mb-4">
                  <div className="bg-rose-500 text-white p-4 rounded-2xl shadow-lg shadow-rose-200">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-black text-2xl">System Error</h3>
                    <p className="font-bold opacity-60">Failed to synthesize deep dive</p>
                  </div>
                </div>
                <p className="font-medium text-lg leading-relaxed">{error}</p>
              </div>
            ) : response && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                {activeTab === 'study' && (
                  <div className="space-y-16">
                    {/* Diagram Section */}
                    {response.diagramData && (
                      <section className="space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.172-1.172a4 4 0 015.656 0l1.172 1.172a4 4 0 010 5.656l-1.172 1.172a4 4 0 01-5.656 0L11 11.657" />
                            </svg>
                          </div>
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Architectural Visualization</h3>
                        </div>
                        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden">
                          <MemoryDiagram 
                            nodes={response.diagramData.nodes} 
                            links={response.diagramData.links} 
                          />
                        </div>
                      </section>
                    )}

                    {/* Textual Content */}
                    <article className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-sm">
                      <MarkdownRenderer content={response.content} />
                    </article>
                  </div>
                )}

                {activeTab === 'code' && (
                  <CodeExamplesSection examples={response.codeExamples} />
                )}

                {activeTab === 'quiz' && (
                  <QuizSection questions={response.quizQuestions} />
                )}

                {activeTab === 'tips' && (
                  <InterviewInsightsSection 
                    tips={response.interviewTips} 
                    mistakes={response.commonMistakes} 
                  />
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 py-4 px-8 text-center text-[10px] text-slate-400 font-black tracking-[0.3em] uppercase md:left-80 z-30">
        Engineered By Md Sadidur Rahman
      </footer>
    </div>
  );
};

export default App;
