// src/components/forms/AskAICard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAskAI } from '../../hooks/useAskAI';
import { PresetQuestion } from '../../types/ask-ai-types';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useDroppable } from '@dnd-kit/core';

import { 
  MessageSquare, 
  Bot, 
  User, 
  Send, 
  X, 
  HelpCircle, 
  CheckCircle,
  Loader2,
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface AskAICardProps {
  projectId: string;
  formData: any;
  droppedFieldId?: string | null;
  onFieldProcessed?: () => void;
}

export const AskAICard: React.FC<AskAICardProps> = ({ projectId, formData, droppedFieldId, onFieldProcessed }) => {
  const {
    messages,
    fieldContext,
    presetQuestions,
    isLoading,
    isBuildingContext,
    contextError,
    droppedField,
    showDropSuccess,
    question,
    handleFieldDrop,
    sendMessage,
    askPresetQuestion,
    clearChat,
    resetAll,
    setQuestion,
    hasActiveContext,
    hasMessages
  } = useAskAI({ projectId, formData });

  const [isExpanded, setIsExpanded] = useState(false);

  // Make the entire card a drop target
  const { setNodeRef, isOver } = useDroppable({
    id: 'ask-ai-drop-zone',
    data: {
      type: 'ai-assistant-zone',
    },
  });

  // Handle field drop from DragDropProvider
  useEffect(() => {
    if (droppedFieldId && !hasActiveContext) {
      handleFieldDrop(droppedFieldId);
      onFieldProcessed?.();
    }
  }, [droppedFieldId, hasActiveContext, onFieldProcessed, handleFieldDrop]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && !isLoading) {
      sendMessage(question);
    }
  };

  const handlePresetQuestionClick = (presetQuestion: PresetQuestion) => {
    askPresetQuestion(presetQuestion);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'field-specific': return <HelpCircle className="h-4 w-4" />;
      case 'validation': return <AlertCircle className="h-4 w-4" />;
      case 'best-practices': return <CheckCircle className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  return (
    <Card 
      ref={setNodeRef}
      className={`w-full max-w-md bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 transition-all duration-200 ${
        isOver ? 'ring-4 ring-blue-400 bg-blue-100 shadow-lg scale-105 animate-pulse' : ''
      }`}
    >
      <CardHeader className="pb-3 border-b border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Ask AI Assistant</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? '−' : '+'}
          </Button>
        </div>
        
        {!hasActiveContext && (
          <p className={`text-sm mt-2 transition-colors ${
            isOver ? 'text-blue-700 font-medium' : 'text-gray-600'
          }`}>
            {isOver ? 'Drop the field here for AI assistance!' : 'Drag any form field here to get AI assistance'}
          </p>
        )}
        
        {hasActiveContext && fieldContext && (
          <div className="mt-2 p-2 bg-blue-100 rounded-md">
            <p className="text-sm font-medium text-blue-800">
              Helping with: <span className="font-semibold">{fieldContext.label}</span>
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Section: {fieldContext.section}
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4">
        {!hasActiveContext ? (
          // Drop zone
          <div className={`min-h-[200px] flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-all duration-200 ${
            isOver 
              ? 'border-blue-500 bg-blue-100 scale-105 shadow-lg' 
              : 'border-blue-300 bg-blue-50/50 hover:border-blue-400 hover:bg-blue-100/50'
          }`}>
            <MessageSquare className={`h-12 w-12 mb-3 transition-colors ${
              isOver ? 'text-blue-600' : 'text-blue-400'
            }`} />
            <p className="text-blue-600 font-medium text-center">
              {isOver ? 'Drop here!' : 'Drop a form field here'}
            </p>
            <p className="text-blue-500 text-sm text-center mt-1">
              Get instant AI guidance for any field
            </p>
            <div className="mt-2 text-xs text-blue-500 text-center">
              Look for the drag handle (⋮⋮) on form fields
            </div>
          </div>
        ) : (
          // Chat interface
          <div className="space-y-4">
            {/* Success message */}
            {showDropSuccess && (
              <div className="flex items-center space-x-2 p-2 bg-green-100 border border-green-200 rounded-md">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">
                  Field dropped successfully! Building context...
                </span>
              </div>
            )}

            {/* Error message */}
            {contextError && (
              <div className="flex items-center space-x-2 p-2 bg-red-100 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-700">{contextError}</span>
              </div>
            )}

            {/* Loading context */}
            {isBuildingContext && (
              <div className="flex items-center space-x-2 p-2 bg-blue-100 border border-blue-200 rounded-md">
                <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                <span className="text-sm text-blue-700">Building field context...</span>
              </div>
            )}

            {/* Preset questions */}
            {presetQuestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Suggested questions:</p>
                <div className="space-y-2">
                  {presetQuestions.map((presetQuestion) => (
                    <button
                      key={presetQuestion.id}
                      onClick={() => handlePresetQuestionClick(presetQuestion)}
                      disabled={isLoading}
                      className={`w-full text-left p-2 rounded-md border text-xs transition-colors hover:bg-gray-50 disabled:opacity-50 ${getPriorityColor(presetQuestion.priority)}`}
                    >
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(presetQuestion.category)}
                        <span>{presetQuestion.text}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat messages */}
            {hasMessages && (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {message.type === 'user' ? (
                          <User className="h-3 w-3" />
                        ) : (
                          <Bot className="h-3 w-3" />
                        )}
                        <span className="text-xs opacity-75">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Input form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex space-x-2">
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask a question about this field..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={!question.trim() || isLoading}
                  size="sm"
                  className="px-3"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>

            {/* Actions */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                disabled={!hasMessages}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear Chat
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Reset everything to initial state
                  resetAll();
                  // Notify parent that field was processed
                  if (onFieldProcessed) {
                    onFieldProcessed();
                  }
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 