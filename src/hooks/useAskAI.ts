// src/hooks/useAskAI.ts
import { useState, useCallback, useEffect } from 'react';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { Message, FieldContext, PresetQuestion, AIContextRequest, AIContextResponse } from '../types/ask-ai-types';
import { AIContextBuilder } from '../services/aiContextBuilder';
import { z } from 'zod';

// Schema for AI response with markdown support
const ProjectQASchema = z.object({
  answer_markdown: z.string().describe('A comprehensive, helpful answer to the user\'s question about the form field, formatted in markdown'),
  suggestions: z.array(z.string()).describe('Actionable suggestions for completing the field or related actions'),
  relatedFields: z.array(z.string()).describe('Related form fields that might need attention or are connected to this field'),
  confidence: z.number().min(0).max(1).describe('Confidence level in the answer (0-1)'),
  sources: z.array(z.string()).describe('Sources of information or industry standards referenced')
});

interface UseAskAIOptions {
  projectId: string;
  formData: any; // Accept any object type for flexibility
}

export const useAskAI = ({ projectId, formData }: UseAskAIOptions) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [fieldContext, setFieldContext] = useState<FieldContext | null>(null);
  const [presetQuestions, setPresetQuestions] = useState<PresetQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBuildingContext, setIsBuildingContext] = useState(false);
  const [contextError, setContextError] = useState<string | null>(null);
  
  // Context management
  const [contextCache, setContextCache] = useState<Map<string, FieldContext>>(new Map());
  const [droppedField, setDroppedField] = useState<string | null>(null);
  const [isContextCleared, setIsContextCleared] = useState(false);
  
  // Streaming AI response
  const { object, submit, isLoading: isStreaming, error: streamError } = useObject({
    api: '/api/project-qa',
    schema: ProjectQASchema,
  });

  // Storage keys for this project
  const getStorageKeys = useCallback((projectId: string) => ({
    chatHistory: `project-ai-chat-${projectId}`,
    fieldContext: `project-ai-context-${projectId}`,
    lastActive: `project-ai-last-active-${projectId}`
  }), []);

  // Load project context from session storage
  const loadProjectContext = useCallback((projectId: string) => {
    if (!projectId || isContextCleared) return;
    
    try {
      const keys = getStorageKeys(projectId);
      const savedChat = sessionStorage.getItem(keys.chatHistory);
      const savedContext = sessionStorage.getItem(keys.fieldContext);
      
      if (savedChat) {
        const parsedChat = JSON.parse(savedChat);
        setMessages(parsedChat.map((msg: Record<string, unknown>) => ({
          ...msg,
          timestamp: new Date(msg.timestamp as string)
        })));
      }
      
      if (savedContext) {
        const parsedContext = JSON.parse(savedContext);
        setFieldContext(parsedContext);
        setDroppedField(parsedContext.id);
      }
      
      // Update last active timestamp
      sessionStorage.setItem(keys.lastActive, new Date().toISOString());
    } catch (error) {
      console.error('Error loading project context:', error);
    }
  }, [getStorageKeys, isContextCleared]);

  // Save project context to session storage
  const saveProjectContext = useCallback((projectId: string) => {
    if (!projectId) return;
    
    try {
      const keys = getStorageKeys(projectId);
      
      if (messages.length > 0) {
        sessionStorage.setItem(keys.chatHistory, JSON.stringify(messages));
      }
      
      if (fieldContext) {
        sessionStorage.setItem(keys.fieldContext, JSON.stringify(fieldContext));
      }
      
      sessionStorage.setItem(keys.lastActive, new Date().toISOString());
    } catch (error) {
      console.error('Error saving project context:', error);
    }
  }, [getStorageKeys, messages, fieldContext]);

  // Clear project context
  const clearProjectContext = useCallback((projectId: string) => {
    if (!projectId) return;
    
    const keys = getStorageKeys(projectId);
    sessionStorage.removeItem(keys.chatHistory);
    sessionStorage.removeItem(keys.fieldContext);
    sessionStorage.removeItem(keys.lastActive);
    
    setContextCache(new Map());
    setMessages([]);
    setFieldContext(null);
    setDroppedField(null);
    setPresetQuestions([]);
    setIsContextCleared(true); // Set flag to prevent loading old context
  }, [getStorageKeys]);

  // Handle field drop
  const handleFieldDrop = useCallback(async (fieldId: string) => {
    try {
      // Validate field exists
      if (!fieldId) {
        throw new Error('Field ID is required');
      }

      // Reset the context cleared flag for new field drops
      setIsContextCleared(false);

      // 1. Immediate visual feedback (optimistic)
      setDroppedField(fieldId);
      setContextError(null);
      
      // 2. Start context building in background
      setIsBuildingContext(true);
      
      try {
        // Check cache first
        if (contextCache.has(fieldId)) {
          const cachedContext = contextCache.get(fieldId)!;
          setFieldContext(cachedContext);
          
          // Generate preset questions (but don't show them to user)
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
        
        // Generate preset questions (but don't show them to user)
        const questions = AIContextBuilder.generatePresetQuestions(context);
        setPresetQuestions(questions);
        
        // Save to session storage
        saveProjectContext(projectId);
        
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
  }, [formData, projectId, contextCache, saveProjectContext]);

  // Send message to AI
  const sendMessage = useCallback(async (content: string) => {
    if (!fieldContext || !content.trim()) return;
    
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
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, I encountered an error while processing your question. Please try again.',
        timestamp: new Date(),
        fieldContext
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  }, [fieldContext, formData, messages, submit, presetQuestions]);

  // Handle streaming response
  useEffect(() => {
    if (object) {
      setMessages(prev => {
        const newMessages = prev.filter(m => !m.isStreaming);
        const lastMessage = newMessages[newMessages.length - 1];
        
        if (lastMessage?.type === 'ai' && !lastMessage.isStreaming) {
          // Update last assistant message
          lastMessage.content = object.answer_markdown || '';
          lastMessage.isStreaming = false;
          return [...newMessages];
        } else {
          // Add new assistant message
          return [...newMessages, { 
            id: Date.now().toString(), 
            type: 'ai', 
            content: object.answer_markdown || '', 
            timestamp: new Date(), 
            fieldContext,
            isStreaming: false
          }];
        }
      });
      // Note: Do not call saveProjectContext here. A separate effect persists on state changes.
    }
  }, [object, fieldContext, projectId]);

  // Handle streaming errors
  useEffect(() => {
    if (streamError) {
      setMessages(prev => {
        const newMessages = prev.filter(m => !m.isStreaming);
        return [...newMessages, {
          id: Date.now().toString(),
          type: 'ai',
          content: 'Sorry, I encountered an error while processing your question. Please try again.',
          timestamp: new Date(),
          fieldContext: fieldContext!,
          isStreaming: false
        }];
      });
    }
  }, [streamError, fieldContext]);

  // Ask preset question
  const askPresetQuestion = useCallback((question: PresetQuestion) => {
    sendMessage(question.text);
  }, [sendMessage]);

  // Clear chat
  const clearChat = useCallback(() => {
    setMessages([]);
    setFieldContext(null);
    setPresetQuestions([]);
    setDroppedField(null);
    setContextError(null);
    // Clear context cache to prevent old field contexts from persisting
    setContextCache(new Map());
    // Set flag to prevent loading old context
    setIsContextCleared(true);
    // Clear from session storage completely
    clearProjectContext(projectId);
  }, [projectId, clearProjectContext]);

  // Load context when project changes
  useEffect(() => {
    loadProjectContext(projectId);
  }, [projectId, loadProjectContext]);

  // Save context when messages or field context changes
  useEffect(() => {
    saveProjectContext(projectId);
  }, [projectId, saveProjectContext, messages, fieldContext]);

  return {
    // State
    messages,
    fieldContext,
    isLoading: isLoading || isStreaming,
    isBuildingContext,
    contextError,
    droppedField,
    isContextCleared,
    
    // Actions
    handleFieldDrop,
    sendMessage,
    askPresetQuestion,
    clearChat,
    clearProjectContext,
    
    // Utilities
    hasActiveContext: !!fieldContext,
    hasMessages: messages.length > 0
  };
}; 