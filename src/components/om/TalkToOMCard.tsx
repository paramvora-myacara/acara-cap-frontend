'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { MessageSquare, Send, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const TalkToOMCard: React.FC = () => {
  const [question, setQuestion] = React.useState('');
  const [answer, setAnswer] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [focused, setFocused] = React.useState(false);
  const [closing, setClosing] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const abortRef = React.useRef<AbortController | null>(null);

  // Auto-resize textarea when question changes
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [question]);

  // Esc to close + body scroll lock while focused
  React.useEffect(() => {
    if (!focused) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = prevOverflow;
    };
  }, [focused]);

  const askQuestion = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!question.trim() || loading) return;

    // Open focus state immediately on submit
    setClosing(false);
    setFocused(true);
    setLoading(true);
    setError(null);
    setAnswer(null);

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
      setAnswer(data.answer || '');
    } catch (e: any) {
      if (e?.name === 'AbortError') return; // closed while loading
      setError(e?.message || 'Failed to get answer');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    abortRef.current?.abort(); // cancel if loading
    setClosing(true);
    setFocused(false);
    setAnswer(null);
    setError(null);
    setQuestion(''); // clear last question (single-shot)
  };

  const handleBackdropClick = () => {
    if (focused) {
      handleClose();
    }
  };

  return (
    <>
      {/* Backdrop overlay (always rendered, opacity controlled by focused state) */}
      <div
        className={`fixed inset-0 z-[50] ${
          focused
            ? 'bg-black/20 backdrop-blur-sm pointer-events-auto transition-all duration-[4000ms] ease-out' 
            : 'bg-transparent backdrop-blur-none pointer-events-none'
        }`}
        onClick={handleBackdropClick}
        aria-hidden={!focused}
      />

      <div
        className={`bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-6 ${
          focused
            ? 'relative z-[60] shadow-xl transition-all duration-[4000ms] ease-out'
            : 'transition-all duration-200 ease-in'
        }`}
      >
        <div className="flex items-start space-x-3 mb-4">
          <div className="p-2 bg-blue-50 rounded-lg mt-1">
            <MessageSquare className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Talk to the OM</h3>
              </div>
              {focused && (
                <button
                  aria-label="Close"
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 ml-3"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <form onSubmit={askQuestion} className="space-y-3">
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  placeholder="Ask a question about the OM... (Enter to send, Cmd+Enter for new line)"
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

              {error && <p className="text-sm text-red-600">{error}</p>}
            </form>

            {/* Smooth vertical expansion for the answer with slide transition */}
            <div
              className={`overflow-hidden transition-all duration-500 ease-out ${
                answer ? 'max-h-[60vh] mt-4 transform translate-y-0' : 'max-h-0 transform -translate-y-2'
              }`}
            >
              {answer && (
                <div className="prose prose-sm text-gray-800">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {answer}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}; 