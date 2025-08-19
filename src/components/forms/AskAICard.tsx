// src/components/forms/AskAICard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAskAI } from '../../hooks/useAskAI';
import { Card, CardContent, CardHeader } from '../ui/card';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { 
  MessageSquare, 
  Bot, 
  User, 
  Loader2,
  AlertCircle
} from 'lucide-react';

interface AskAICardProps {
  projectId: string;
  formData: any; // Accept any object type for flexibility
  droppedFieldId?: string | null;
  onFieldProcessed?: () => void;
}

export const AskAICard: React.FC<AskAICardProps> = ({ projectId, formData, droppedFieldId, onFieldProcessed }) => {
  const {
    messages,
    fieldContext,
    isLoading,
    isBuildingContext,
    contextError,
    handleFieldDrop,
    sendMessage,
    hasActiveContext,
    hasMessages
  } = useAskAI({ projectId, formData });

  // Handle field drop from DragDropProvider
  useEffect(() => {
    if (droppedFieldId) {
      handleFieldDrop(droppedFieldId);
      onFieldProcessed?.();
    }
  }, [droppedFieldId, onFieldProcessed, handleFieldDrop]);

  // Automatically send a comprehensive question when field context is built
  useEffect(() => {
    if (fieldContext && messages.length === 0 && !isLoading && !isBuildingContext) {
      // Send a comprehensive question that will trigger the AI to answer the preset questions
      const comprehensiveQuestion = `Please provide comprehensive guidance and answers for the "${fieldContext.label}" field, including best practices, validation rules, and common considerations.`;
      sendMessage(comprehensiveQuestion);
    }
  }, [fieldContext, messages.length, isLoading, isBuildingContext, sendMessage]);

  return (
    <Card 
      className="transition-all duration-200"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">AI Field Assistant</h3>
          </div>

        </div>
        
        {!hasActiveContext && (
          <p className="text-sm text-gray-600">
            Drag and drop a form field here to get AI assistance
          </p>
        )}
        
        {hasActiveContext && fieldContext && (
          <div className="flex items-center space-x-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
            <Bot className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-700">
              Assisting with: <strong>{fieldContext.label}</strong>
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {!hasActiveContext ? (
          // Drop zone
          <div className={`min-h-[200px] flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-all duration-200`}>
            <MessageSquare className={`h-12 w-12 mb-3 transition-colors`} />
            <p className={`font-medium text-center`}>
              Drop a form field here
            </p>
            <p className="text-blue-500 text-sm text-center mt-1">
              Get instant AI guidance for any field
            </p>
            <div className="mt-2 text-xs text-blue-500 text-center">
              Look for the drag handle (⋮⋮) on form fields
            </div>
          </div>
        ) : (
          // AI Assistant interface
          <div className="space-y-4">

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
                      
                      {message.type === 'user' ? (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      ) : (
                        <div className="prose prose-sm max-w-none">
                          {message.isStreaming ? (
                            // Streaming indicator
                            <div className="flex items-center space-x-2">
                              <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse delay-0"></span>
                              <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse delay-150"></span>
                              <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse delay-300"></span>
                              <span className="text-sm text-gray-600">AI is thinking...</span>
                            </div>
                          ) : (
                            // Rendered markdown content
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {message.content}
                            </ReactMarkdown>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Drop a new field to start a fresh conversation
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 