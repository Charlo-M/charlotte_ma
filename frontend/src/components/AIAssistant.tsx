import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  X,
  Send,
  User,
  Bot,
  Sparkles,
  Loader2,
  Maximize2,
  Minimize2,
  Briefcase,
} from 'lucide-react';
import { analyzeJobMatch, analyzeJobMatchUrl, sendMessageToGemini } from '../services/geminiService';
import { ChatMessage } from '../types';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function isProbablyUrl(text: string): boolean {
  const t = text.trim();
  return /^https?:\/\/\S+$/i.test(t);
}

const AIAssistant: React.FC = () => {
  // UI State
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showCallout, setShowCallout] = useState(false);
  const [isJobMode, setIsJobMode] = useState(false);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hi! I'm Charlotte's intelligent career agent. I can answer questions about her experience, or enable 'Job Fit Mode' to analyze how well she matches your job description.",
      timestamp: new Date(),
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const inputLooksLikeUrl = useMemo(() => isProbablyUrl(inputValue), [inputValue]);

  // Show callout after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) setShowCallout(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isMaximized, isJobMode]);

  const toggleChat = () => {
    setIsOpen((v) => !v);
    if (!isOpen) setShowCallout(false);
  };

  const toggleMaximize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMaximized((v) => !v);
  };

  const handleCalloutClick = () => {
    setIsOpen(true);
    setShowCallout(false);
    setIsJobMode(true);
  };

  const pushBot = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, role: 'model', text, timestamp: new Date() },
    ]);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const content = inputValue.trim();
    if (!content) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsProcessing(true);

    try {
      if (isJobMode) {
        const looksUrl = isProbablyUrl(content);

        if (looksUrl) {
          pushBot('Got the link. Extracting the job description and running match analysis…');
        }

        const analysis = looksUrl ? await analyzeJobMatchUrl(content) : await analyzeJobMatch(content);

        if (analysis) {
          const botMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: "I've analyzed the job description. Here is my objective assessment:",
            timestamp: new Date(),
            analysis,
          };
          setMessages((prev) => [...prev, botMsg]);
          setIsJobMode(false);
        } else {
          if (looksUrl) {
            pushBot(
              "I couldn’t extract enough job text from that link (many job sites block scraping). Please paste the full job description text directly for an accurate analysis."
            );
          } else {
            pushBot(
              "I ran into an issue analyzing that job description. Please try again, or paste a slightly shorter JD if it's extremely long."
            );
          }
        }
      } else {
        const responseText = await sendMessageToGemini(content);
        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: responseText,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (error) {
      console.error(error);
      pushBot("I'm having trouble connecting to the server. Please try again in a moment.");
    } finally {
      setIsProcessing(false);
    }
  };

  const renderMessage = (msg: ChatMessage) => {
    const isUser = msg.role === 'user';

    return (
      <div
        key={msg.id}
        className={`flex gap-4 mb-6 group min-w-0 ${isUser ? 'flex-row-reverse' : ''} animate-in slide-in-from-bottom-2 duration-300`}
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg ring-2 ring-opacity-50 transition-all duration-300 ${
            isUser ? 'bg-indigo-600 ring-indigo-400' : 'bg-slate-800 ring-slate-600'
          }`}
        >
          {isUser ? <User size={18} className="text-white" /> : <Bot size={18} className="text-accent" />}
        </div>

        <div className={`flex flex-col max-w-[85%] min-w-0 ${isUser ? 'items-end' : 'items-start'}`}>
          <div
            className={`px-5 py-4 rounded-2xl shadow-md text-sm leading-relaxed whitespace-pre-wrap relative overflow-hidden overflow-x-hidden min-w-0 ${
              isUser
                ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none'
                : 'bg-slate-800/80 backdrop-blur-md border border-slate-700/50 text-slate-200 rounded-tl-none'
            }`}
          >
            {isUser && <div className="absolute inset-0 bg-white/5 pointer-events-none"></div>}

            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => (
                  <p className="text-sm leading-relaxed min-w-0 break-words" style={{ overflowWrap: 'anywhere' }}>
                    {children}
                  </p>
                ),
                ul: ({ children }) => <ul className="list-disc pl-5 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1">{children}</ol>,
                li: ({ children }) => (
                  <li className="text-sm leading-relaxed break-words" style={{ overflowWrap: 'anywhere' }}>
                    {children}
                  </li>
                ),
                strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                em: ({ children }) => <em className="italic text-slate-100">{children}</em>,
                a: ({ children, href }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent underline hover:text-accent-hover break-all whitespace-normal"
                    style={{ overflowWrap: 'anywhere', wordBreak: 'break-all' }}
                  >
                    {children}
                  </a>
                ),
                code: ({ inline, children }) =>
                  inline ? (
                    <code className="px-1.5 py-0.5 rounded bg-slate-950/60 border border-slate-700 text-slate-100 text-[0.85em] break-all">
                      {children}
                    </code>
                  ) : (
                    <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-950/70 border border-slate-700 p-3">
                      <code className="text-slate-100 text-xs">{children}</code>
                    </pre>
                  ),
              }}
            >
              {msg.text}
            </ReactMarkdown>
          </div>

          {msg.analysis && (
            <div className="mt-4 w-full bg-slate-900/90 border border-slate-700 rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-500 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -z-10"></div>

              <div className="bg-slate-800/80 backdrop-blur-sm p-4 border-b border-slate-700 flex items-center justify-between">
                <h4 className="font-bold text-white flex items-center">
                  <Briefcase size={16} className="text-accent mr-2" /> Compatibility Report
                </h4>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    msg.analysis.matchScore >= 80
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : msg.analysis.matchScore >= 60
                      ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}
                >
                  {msg.analysis.matchScore}% Match
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Verdict</div>
                  <p className="text-white font-medium leading-relaxed">{msg.analysis.verdict}</p>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Key Strengths</div>
                  <ul className="space-y-2">
                    {msg.analysis.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start">
                        <span className="text-green-500 mr-2 mt-0.5">✓</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                  <div className="text-xs font-semibold text-yellow-500 uppercase tracking-wider mb-1">Gap Analysis</div>
                  <p className="text-sm text-slate-300 italic">"{msg.analysis.gapAnalysis}"</p>
                </div>
              </div>
            </div>
          )}

          <span className="text-[10px] text-slate-500 mt-2 px-1">
            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    );
  };

  return (
    <>
      {!isOpen && showCallout && (
        <div className="fixed bottom-24 right-6 z-50 max-w-xs animate-in slide-in-from-bottom-5 duration-500">
          <div
            onClick={handleCalloutClick}
            className="bg-white/95 backdrop-blur-md text-slate-900 p-4 rounded-xl shadow-2xl border border-white/50 relative group cursor-pointer hover:bg-white transition-colors"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowCallout(false);
              }}
              className="absolute -top-2 -right-2 bg-slate-200 hover:bg-slate-300 rounded-full p-1 text-slate-600 transition-colors shadow-sm"
            >
              <X size={14} />
            </button>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <Briefcase size={20} className="text-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-snug text-slate-800">
                  Hiring? Test match percentage by pasting a job description link!
                </p>
                <p className="text-xs text-accent font-bold mt-2 flex items-center group-hover:underline">
                  Start Analysis <Sparkles size={10} className="ml-1" />
                </p>
              </div>
            </div>
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white transform rotate-45 border-b border-r border-slate-200 group-hover:bg-slate-50"></div>
          </div>
        </div>
      )}

      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 z-50 group flex items-center justify-center w-16 h-16 bg-accent hover:bg-accent-hover text-white rounded-full shadow-2xl shadow-accent/40 transition-all hover:scale-110 active:scale-95"
        >
          <MessageSquare size={28} />
          <span className="absolute -top-2 -right-2 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-sky-500 border-2 border-slate-900"></span>
          </span>
        </button>
      )}

      <div
        className={`fixed z-50 transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) bg-slate-900/95 backdrop-blur-xl shadow-2xl overflow-hidden border border-slate-700
          ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10 pointer-events-none'}
          ${isMaximized ? 'inset-4 md:inset-10 rounded-2xl' : 'bottom-6 right-6 w-[95vw] md:w-[400px] h-[600px] rounded-2xl'}
        `}
      >
        <div className="bg-slate-800/80 backdrop-blur-md p-4 border-b border-slate-700/50 flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 animate-pulse-slow"></div>
              <Sparkles size={20} className="text-white relative z-10" />
            </div>
            <div>
              <h3 className="font-bold text-white leading-none tracking-tight">AI Agent</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xs text-slate-400 font-medium">Online & Ready</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={toggleMaximize}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors hidden md:block"
              title={isMaximized ? 'Minimize' : 'Maximize'}
            >
              {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button onClick={toggleChat} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex flex-col h-[calc(100%-4rem)] bg-slate-900/30 relative">
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 scroll-smooth">
            {messages.map(renderMessage)}

            {isProcessing && (
              <div className="flex gap-4 animate-in fade-in duration-300 min-w-0">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                  <Bot size={18} className="text-accent" />
                </div>
                <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-2xl rounded-tl-none px-5 py-4 flex items-center shadow-md min-w-0">
                  <Loader2 size={18} className="animate-spin text-accent mr-3" />
                  <span className="text-sm text-slate-400 animate-pulse">
                    {isJobMode ? 'Analyzing Job Compatibility...' : 'Thinking...'}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className={`p-4 bg-slate-800/90 backdrop-blur-md border-t border-slate-700 transition-colors duration-500 ${isJobMode ? 'border-t-accent/30 bg-indigo-950/30' : ''}`}>
            <form onSubmit={handleSendMessage} className="flex gap-2 items-center relative">
              <button
                type="button"
                onClick={() => setIsJobMode((v) => !v)}
                className={`p-3 rounded-xl transition-all duration-300 border ${
                  isJobMode
                    ? 'bg-accent text-white border-accent shadow-[0_0_15px_rgba(56,189,248,0.5)]'
                    : 'bg-slate-700/50 text-slate-400 border-slate-600/50 hover:bg-slate-700 hover:text-white'
                }`}
                title={isJobMode ? 'Disable Job Fit Analysis' : 'Enable Job Fit Analysis'}
              >
                <Briefcase size={20} />
              </button>

              <div className="flex-1 relative group min-w-0">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={isJobMode ? 'Paste Job Description or Link here...' : 'Message...'}
                  className={`w-full text-white placeholder-slate-500 rounded-xl px-4 py-3 border focus:outline-none pr-10 transition-all ${
                    isJobMode
                      ? 'bg-slate-900/80 border-accent focus:ring-1 focus:ring-accent shadow-[0_0_10px_rgba(56,189,248,0.1)]'
                      : 'bg-slate-900/50 border-slate-700 focus:border-accent focus:ring-1 focus:ring-accent'
                  }`}
                />

                {isJobMode && inputLooksLikeUrl && (
                  <div className="mt-2 text-[11px] text-slate-400">
                    Tip: Some job sites block scraping. If extraction fails, paste the full JD text.
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isProcessing || !inputValue.trim()}
                className="bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all shadow-lg shadow-accent/20 active:scale-95 hover:scale-105"
              >
                <Send size={20} />
              </button>
            </form>

            <div className="text-center mt-2 flex justify-between items-center px-2 h-5">
              <span className="text-[10px] text-slate-500 flex items-center">
                Powered by Gemini AI <Sparkles size={8} className="ml-1 text-accent" />
              </span>
              {isJobMode && (
                <span className="text-[10px] text-accent animate-pulse font-bold tracking-wide uppercase flex items-center">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full mr-1.5"></span>
                  Job Match Mode
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIAssistant;