// src/hooks/useAskAI.ts
import { useState, useCallback, useEffect } from 'react';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { Message, FieldContext, PresetQuestion, AIContextRequest } from '../types/ask-ai-types';
import { AIContextBuilder } from '../services/aiContextBuilder';
import { z } from 'zod';

// Helper to create a standardized error message
const createErrorMessage = (fieldContext: FieldContext | null): Message => ({
  id: Date.now().toString(),
  type: 'ai',
  content: 'Sorry, I encountered an error while processing your question. Please try again.',
  timestamp: new Date(),
  fieldContext: fieldContext,
  isStreaming: false,
});

// Schema for AI response with markdown support
const ProjectQASchema = z.object({
  answer_markdown: z.string().describe('A comprehensive, helpful answer to the user\'s question about the form field, formatted in markdown')
});

interface UseAskAIOptions {
  projectId: string;
  formData: any; // Accept any object type for flexibility
}

export const useAskAI = ({ projectId, formData }: UseAskAIOptions) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [fieldContext, setFieldContext] = useState<FieldContext | null>(null);
  const [presetQuestions, setPresetQuestions] = useState<PresetQuestion[]>([]);
  const [isBuildingContext, setIsBuildingContext] = useState(false);
  const [contextError, setContextError] = useState<string | null>(null);
  
  // Context management
  const [contextCache, setContextCache] = useState<Map<string, FieldContext>>(new Map());
  const [droppedField, setDroppedField] = useState<string | null>(null);
  
  // Streaming AI response
  const { object, submit, isLoading: isStreaming, error: streamError } = useObject({
    api: '/api/project-qa',
    schema: ProjectQASchema,
  });

  // Handle field drop
  const handleFieldDrop = useCallback(async (fieldId: string) => {
    try {
      // Validate field exists
      if (!fieldId) {
        throw new Error('Field ID is required');
      }

      // Clear previous context and start fresh - do this synchronously to prevent race conditions
      setMessages([]);
      setFieldContext(null);
      setPresetQuestions([]);
      setContextError(null);
      setIsBuildingContext(true);

      // 1. Immediate visual feedback (optimistic)
      setDroppedField(fieldId);
      
      // 2. Context building will continue in background
      
      try {
        // Check cache first
        if (contextCache.has(fieldId)) {
          const cachedContext = contextCache.get(fieldId)!;
          setFieldContext(cachedContext);
          
          // Generate preset questions
          const questions = AIContextBuilder.generatePresetQuestions(cachedContext);
          setPresetQuestions(questions);
          
          setIsBuildingContext(false);
          return;
        }
        
        // Build context from scratch
        const context = await AIContextBuilder.buildFieldContext(fieldId, formData);
        setFieldContext(context);
        
        // Cache the context
        setContextCache(prev => new Map(prev).set(fieldId, context));
        
        // Generate preset questions
        const questions = AIContextBuilder.generatePresetQuestions(context);
        setPresetQuestions(questions);
        
      } catch (error) {
        console.error('Error building field context:', error);
        setContextError(error instanceof Error ? error.message : 'Failed to build field context');
      } finally {
        setIsBuildingContext(false);
      }
      
    } catch (error) {
      console.error('Error handling field drop:', error);
      setContextError(error instanceof Error ? error.message : 'Failed to process field drop');
    }
  }, [formData, contextCache]);

  // Send message to AI
  const sendMessage = useCallback(async (content: string) => {
    if (!fieldContext || !content.trim() || isBuildingContext) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
      fieldContext
    };
    
    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    
    // Add thinking message for streaming feedback
    const thinkingMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: '',
      timestamp: new Date(),
      fieldContext,
      isStreaming: true
    };
    setMessages(prev => [...prev, thinkingMessage]);
    
    try {
      // Build project context
      const projectContext = AIContextBuilder.buildProjectContext(formData);
      
      // Enhance the user's question with preset questions context
      let enhancedQuestion = content.trim();
      if (presetQuestions.length > 0) {
        const questionSuggestions = presetQuestions.map(q => q.text).join('\n- ');
        enhancedQuestion = `${content.trim()}\n\nNote: The user is working on the "${fieldContext.label}" field. Here are some relevant questions that might help provide context:\n- ${questionSuggestions}\n\nPlease provide a comprehensive answer that considers these aspects.`;
      }
      
      // Prepare AI request
      const aiRequest: AIContextRequest = {
        fieldContext,
        projectContext,
        question: enhancedQuestion,
        chatHistory: messages
      };
      
      // Submit to streaming API
      submit(aiRequest);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove thinking message and add error message
      setMessages(prev => prev.filter(msg => !msg.isStreaming));
      setMessages(prev => [...prev, createErrorMessage(fieldContext)]);
    }
  }, [fieldContext, formData, messages, submit, presetQuestions, isBuildingContext]);

  // Handle streaming response
  useEffect(() => {
    if (!object) return;

    setMessages(prev => {
      // Find the "thinking" message and replace it with the first chunk of the AI response,
      // or update the last AI message with subsequent chunks.
      const lastMessage = prev[prev.length - 1];

      if (lastMessage?.type === 'ai') {
        // Create a new array with the updated message to avoid mutation
        return prev.map((msg, index) =>
          index === prev.length - 1
            ? { ...msg, content: object.answer_markdown || '', isStreaming: false }
            : msg
        );
      }
      return prev;
    });
  }, [object, fieldContext]);

  // Handle streaming errors
  useEffect(() => {
    if (streamError) {
      setMessages(prev => {
        const newMessages = prev.filter(m => !m.isStreaming);
        return [...newMessages, createErrorMessage(fieldContext)];
      });
    }
  }, [streamError, fieldContext]);

  // When streaming finishes, ensure the last message's streaming flag is false
  useEffect(() => {
    if (!isStreaming) {
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage?.isStreaming) {
          return prev.map((msg, index) =>
            index === prev.length - 1 ? { ...msg, isStreaming: false } : msg
          );
        }
        return prev;
      });
    }
  }, [isStreaming]);

  // Ask preset question
  const askPresetQuestion = useCallback((question: PresetQuestion) => {
    sendMessage(question.text);
  }, [sendMessage]);

  return {
    // State
    messages,
    fieldContext,
    isLoading: isBuildingContext || isStreaming,
    isBuildingContext,
    contextError,
    droppedField,
    
    // Actions
    handleFieldDrop,
    sendMessage,
    askPresetQuestion,
    
    // Utilities
    hasActiveContext: !!fieldContext,
    hasMessages: messages.length > 0
  };
}; 