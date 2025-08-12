'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { MessageSquare, Send, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import type { OmQaResponse } from '@/types/om-types';

export const OMChatSidebar: React.FC = () => {
  const [question, setQuestion] = React.useState('');
  const [answer, setAnswer] = React.useState<string | null>(null);
  const [structured, setStructured] = React.useState<OmQaResponse | null>(null);
  const [assumptionsOpen, setAssumptionsOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const abortRef = React.useRef<AbortController | null>(null);

  // Auto-resize textarea when question changes
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [question]);

  const askQuestion = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!question.trim() || loading) return;

    setLoading(true);
    setError(null);
    setAnswer(null);
    setStructured(null);
    setAssumptionsOpen(false);

    // Cancel any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/om-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
        signal: controller.signal
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Request failed');

      // Prefer structured JSON; fallback to markdown answer if not present
      if (data?.data && typeof data.data.answer_markdown === 'string') {
        const s: OmQaResponse = data.data;
        setStructured(s);
        setAnswer(s.answer_markdown);
        setAssumptionsOpen(false); // default closed
      } else if (typeof data?.answer === 'string') {
        // Try parsing JSON in answer as an additional fallback
        try {
          const parsed = JSON.parse(data.answer);
          if (parsed && typeof parsed.answer_markdown === 'string') {
            setStructured(parsed as OmQaResponse);
            setAnswer(parsed.answer_markdown);
            setAssumptionsOpen(false);
          } else {
            setAnswer(data.answer || '');
          }
        } catch {
          setAnswer(data.answer || '');
        }
      } else {
        setAnswer('');
      }
    } catch (e: any) {
      if (e?.name === 'AbortError') return; // closed while loading
      setError(e?.message || 'Failed to get answer');
    } finally {
      setLoading(false);
    }
  };

  const assumptionsId = React.useId();

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg mt-1">
            <MessageSquare className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 mb-1">Talk to the OM</h3>
          </div>
        </div>
      </div>

      {/* Chat Content Area */}
      <div className="flex-grow overflow-y-auto p-4">
        {/* Welcome Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-start space-x-2">
            <div className="p-1.5 bg-blue-100 rounded-full">
              <MessageSquare className="h-3 w-3 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-blue-800 font-medium">Welcome to the OM Assistant!</p>
              <p className="text-xs text-blue-600 mt-1">
                Ask me anything about the Offering Memorandum. I can help you find specific information, 
                explain terms, or analyze the deal structure.
              </p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        {answer && (
          <div className="space-y-4">
            {/* User Question */}
            <div className="flex justify-end">
              <div className="bg-blue-600 text-white rounded-lg px-3 py-2 max-w-[80%]">
                <p className="text-sm">{question}</p>
              </div>
            </div>
            
            {/* AI Answer */}
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 rounded-lg px-3 py-2 max-w-[80%]">
                <div className="prose prose-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {answer}
                  </ReactMarkdown>
                </div>

                {/* Assumptions card at the bottom, collapsed by default */}
                {structured?.assumptions?.length ? (
                  <Card className="mt-4 border-gray-200">
                    <CardHeader className="p-3 pb-0">
                      <button
                        type="button"
                        onClick={() => setAssumptionsOpen(o => !o)}
                        className="w-full flex items-center justify-between text-left"
                        aria-expanded={assumptionsOpen}
                        aria-controls={assumptionsId}
                      >
                        <span className="font-medium text-gray-900">
                          Assumptions ({structured.assumptions.length})
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 text-gray-500 transition-transform ${
                            assumptionsOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    </CardHeader>
                    <CardContent
                      id={assumptionsId}
                      className={`px-3 pb-3 ${assumptionsOpen ? 'block' : 'hidden'}`}
                    >
                      <div className="space-y-3">
                        {structured.assumptions.map((a, idx) => (
                          <Card key={idx} className="border-gray-100 bg-gray-50/50">
                            <CardContent className="p-3">
                              <div className="flex items-start gap-3">
                                <div className="flex-1">
                                  <p className="text-sm text-gray-800 leading-relaxed">{a.text}</p>
                                  {a.citation && (
                                    <p className="text-xs text-gray-500 mt-2">
                                      <span className="font-medium">Section:</span> {a.citation}
                                    </p>
                                  )}
                                </div>
                                <span className="shrink-0 text-xs px-2.5 py-1 rounded-full bg-gray-200 text-gray-700 capitalize font-medium">
                                  {a.source}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* Input Field at Bottom */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={askQuestion} className="space-y-3">
          <div className="relative">
            <textarea
              ref={textareaRef}
              placeholder="Ask a question about the OM..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full min-h-[44px] p-3 pr-12 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 resize-none text-sm leading-relaxed"
              rows={1}
              style={{ fontFamily: 'inherit' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey) {
                  e.preventDefault();
                  if (question.trim() && !loading) {
                    askQuestion();
                  }
                } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  const target = e.target as HTMLTextAreaElement;
                  const start = target.selectionStart;
                  const end = target.selectionEnd;
                  const newValue = question.substring(0, start) + '\n' + question.substring(end);
                  setQuestion(newValue);
                  setTimeout(() => {
                    target.selectionStart = target.selectionEnd = start + 1;
                  }, 0);
                }
              }}
              disabled={loading}
            />
            <Button
              type="submit"
              size="sm"
              disabled={!question.trim() || loading}
              className="absolute right-2 top-2 h-8 w-8 p-0"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}; 