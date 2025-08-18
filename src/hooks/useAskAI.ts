// src/hooks/useAskAI.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import { Message, FieldContext, ProjectContext, PresetQuestion, AIContextRequest, AIContextResponse } from '../types/ask-ai-types';
import { AIContextBuilder } from '../services/aiContextBuilder';

interface UseAskAIOptions {
  projectId: string;
  formData: any;
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
  const [showDropSuccess, setShowDropSuccess] = useState(false);
  
  // Chat functionality
  const [question, setQuestion] = useState('');
  
  // Storage keys for this project
  const getStorageKeys = useCallback((projectId: string) => ({
    chatHistory: `project-ai-chat-${projectId}`,
    fieldContext: `project-ai-context-${projectId}`,
    lastActive: `project-ai-last-active-${projectId}`
  }), []);

  // Load project context from session storage
  const loadProjectContext = useCallback((projectId: string) => {
    if (!projectId) return;
    
    try {
      const keys = getStorageKeys(projectId);
      const savedChat = sessionStorage.getItem(keys.chatHistory);
      const savedContext = sessionStorage.getItem(keys.fieldContext);
      
      if (savedChat) {
        const parsedChat = JSON.parse(savedChat);
        setMessages(parsedChat.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
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
  }, [getStorageKeys]);

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
  }, [getStorageKeys]);

  // Handle field drop
  const handleFieldDrop = useCallback(async (fieldId: string) => {
    try {
      // Validate field exists
      if (!fieldId) {
        throw new Error('Field ID is required');
      }

      // 1. Immediate visual feedback (optimistic)
      setDroppedField(fieldId);
      setShowDropSuccess(true);
      setContextError(null);
      
      // 2. Start context building in background
      setIsBuildingContext(true);
      
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
        
        // Save to session storage
        saveProjectContext(projectId);
        
      } catch (error) {
        console.error('Error building field context:', error);
        setContextError(error instanceof Error ? error.message : 'Failed to build field context');
      } finally {
        setIsBuildingContext(false);
      }
      
      // Hide success message after delay
      setTimeout(() => setShowDropSuccess(false), 2000);
      
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
    setQuestion('');
    setIsLoading(true);
    
    try {
      // Build project context
      const projectContext = AIContextBuilder.buildProjectContext(formData);
      
      // Prepare AI request
      const aiRequest: AIContextRequest = {
        fieldContext,
        projectContext,
        question: content.trim(),
        chatHistory: messages
      };
      
      // Call AI API
      const response = await fetch('/api/project-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiRequest)
      });
      
      if (!response.ok) {
        throw new Error(`AI service error: ${response.status}`);
      }
      
      // Parse streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');
      
      let aiResponse = '';
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        aiResponse += chunk;
      }
      
      // Parse the complete response
      const parsedResponse: AIContextResponse = JSON.parse(aiResponse);
      
      // Add AI message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: parsedResponse.answer,
        timestamp: new Date(),
        fieldContext
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Save to session storage
      saveProjectContext(projectId);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, I encountered an error while processing your question. Please try again.',
        timestamp: new Date(),
        fieldContext
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [fieldContext, formData, messages, projectId, saveProjectContext]);

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
    setShowDropSuccess(false);
    setContextError(null);
    setQuestion('');
    saveProjectContext(projectId);
  }, [projectId, saveProjectContext]);

  // Reset everything to initial state
  const resetAll = useCallback(() => {
    setMessages([]);
    setFieldContext(null);
    setPresetQuestions([]);
    setDroppedField(null);
    setShowDropSuccess(false);
    setContextError(null);
    setQuestion('');
    // Clear from session storage
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
    presetQuestions,
    isLoading,
    isBuildingContext,
    contextError,
    droppedField,
    showDropSuccess,
    question,
    
    // Actions
    handleFieldDrop,
    sendMessage,
    askPresetQuestion,
    clearChat,
    resetAll,
    setQuestion,
    clearProjectContext,
    
    // Utilities
    hasActiveContext: !!fieldContext,
    hasMessages: messages.length > 0
  };
}; 