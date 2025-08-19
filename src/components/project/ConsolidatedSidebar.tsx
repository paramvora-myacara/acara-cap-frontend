'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAskAI } from '../../hooks/useAskAI';
import { useProjects } from '../../hooks/useProjects';
import { useAuth } from '../../hooks/useAuth';
import { ProjectMessage } from '../../types/enhanced-types';
import { getAdvisorById, generateAdvisorMessage } from '../../../lib/enhancedMockApiService';
import { cn } from '@/utils/cn';

import { 
  MessageSquare, 
  Bot, 
  Loader2,
  AlertCircle,
  Brain,
  MessageCircle,
  Send
} from 'lucide-react';

interface ConsolidatedSidebarProps {
  projectId: string;
  formData: any;
  droppedFieldId?: string | null;
  onFieldProcessed?: () => void;
}

type TabType = 'ai-assistant' | 'advisor';

export const ConsolidatedSidebar: React.FC<ConsolidatedSidebarProps> = ({ 
  projectId, 
  formData, 
  droppedFieldId, 
  onFieldProcessed 
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('advisor');
  
  // AI Assistant state and hooks
  const {
    messages: aiMessages,
    fieldContext,
    isLoading: aiLoading,
    isBuildingContext,
    contextError,
    handleFieldDrop,
    sendMessage,
    hasActiveContext,
    hasMessages
  } = useAskAI({ projectId, formData });

  // Message Panel state and hooks
  const { getProject, projectMessages, addProjectMessage, activeProject } = useProjects();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [advisorName, setAdvisorName] = useState('Your Capital Advisor');
  const [isLoadingAdvisor, setIsLoadingAdvisor] = useState(false);
  const [localMessages, setLocalMessages] = useState<ProjectMessage[]>([]);
  const [welcomeMessageGenerated, setWelcomeMessageGenerated] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`capmatch_welcomeGenerated_${projectId}`) === 'true';
    }
    return false;
  });

  // Handle field drop from AskAIProvider
  useEffect(() => {
    if (droppedFieldId) {
      handleFieldDrop(droppedFieldId);
      onFieldProcessed?.();
      // Switch to AI assistant tab when field is dropped
      setActiveTab('ai-assistant');
    }
  }, [droppedFieldId, onFieldProcessed, handleFieldDrop]);

  // Automatically send a comprehensive question when field context is built
  useEffect(() => {
    if (fieldContext && aiMessages.length === 0 && !aiLoading && !isBuildingContext) {
      const comprehensiveQuestion = `Please provide comprehensive guidance and answers for the "${fieldContext.label}" field, including best practices, validation rules, and common considerations.`;
      sendMessage(comprehensiveQuestion);
    }
  }, [fieldContext, aiMessages.length, aiLoading, isBuildingContext, sendMessage]);

  // Message panel effects
  useEffect(() => {
    if (activeProject?.id === projectId) {
      setLocalMessages(projectMessages);
    }
  }, [projectMessages, activeProject, projectId]);

  // Get advisor information
  useEffect(() => {
    const loadData = async () => {
      const project = getProject(projectId);
      if (project?.assignedAdvisorUserId) {
        setIsLoadingAdvisor(true);
        try {
          const advisor = await getAdvisorById(project.assignedAdvisorUserId);
          if (advisor) {
            setAdvisorName(advisor.name);
          }
        } catch (error) {
          console.error('Failed to load advisor:', error);
        } finally {
          setIsLoadingAdvisor(false);
        }
      }
    };
    loadData();
  }, [projectId, getProject]);

  // Generate welcome message if needed
  useEffect(() => {
    const generateWelcomeMessage = async () => {
      if (!welcomeMessageGenerated && localMessages.length === 0 && activeTab === 'advisor') {
        try {
          const project = getProject(projectId);
          if (project && project.assignedAdvisorUserId) {
            const welcomeMessage = await generateAdvisorMessage(
              project.assignedAdvisorUserId,
              projectId,
              {
                assetType: project.assetType,
                dealType: project.loanType,
                loanAmount: project.loanAmountRequested,
                stage: project.projectPhase
              }
            );
            if (welcomeMessage) {
              await addProjectMessage(welcomeMessage, 'Advisor', project.assignedAdvisorUserId);
              setWelcomeMessageGenerated(true);
              if (typeof window !== 'undefined') {
                localStorage.setItem(`capmatch_welcomeGenerated_${projectId}`, 'true');
              }
            }
          }
        } catch (error) {
          console.error('Failed to generate welcome message:', error);
        }
      }
    };

    generateWelcomeMessage();
  }, [welcomeMessageGenerated, localMessages.length, activeTab, projectId, getProject, addProjectMessage]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const project = getProject(projectId);
    if (project && project.assignedAdvisorUserId) {
      try {
        const advisorMessage = await generateAdvisorMessage(
          project.assignedAdvisorUserId,
          projectId,
          {
            assetType: project.assetType,
            dealType: project.loanType,
            loanAmount: project.loanAmountRequested,
            stage: project.projectPhase
          }
        );
        if (advisorMessage) {
          await addProjectMessage(advisorMessage, 'Borrower', user?.email);
        }
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }

    setNewMessage('');
  };

  const scrollToBottom = (containerRef: React.RefObject<HTMLDivElement | null>) => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const messageContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom(messageContainerRef);
  }, [localMessages]);

  return (
    <Card className="h-full flex flex-col">
      {/* Header with Tab Navigation */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Project Assistant</h3>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('advisor')}
            className={cn(
              "flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              activeTab === 'advisor'
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            )}
          >
            <MessageCircle className="h-4 w-4" />
            <span>Advisor</span>
          </button>
          
          <button
            onClick={() => setActiveTab('ai-assistant')}
            className={cn(
              "flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              activeTab === 'ai-assistant'
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            )}
          >
            <Brain className="h-4 w-4" />
            <span>AI Assistant</span>
          </button>
        </div>
      </CardHeader>

      {/* Tab Content */}
      <CardContent className="flex-1 pt-0 overflow-hidden px-0">
        {activeTab === 'advisor' ? (
          // Advisor Tab
          <div className="h-full flex flex-col">
            {/* Advisor Header */}
            <div className="flex items-center space-x-2 p-2 bg-green-50 border border-green-200 rounded-md mb-3 mx-3">
              <MessageCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700">
                {isLoadingAdvisor ? 'Loading advisor...' : advisorName}
              </span>
            </div>

            {/* Messages Card */}
            <div className="flex-1 mx-3 mb-3 min-h-0">
              <Card className="h-full">
                <CardContent className="p-3 h-full">
                  <div className="h-full overflow-y-auto space-y-3">
                    {localMessages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex space-x-2",
                          message.senderType === 'Borrower' ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                            message.senderType === 'Borrower'
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-800"
                          )}
                        >
                          <div className="font-medium text-xs mb-1">
                            {message.senderType === 'Borrower' ? 'You' : advisorName}
                          </div>
                          <div>{message.message}</div>
                          <div className="text-xs opacity-70 mt-1">
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Message Input */}
            <div className="mx-3">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          // AI Assistant Tab
          <div 
            className="h-full flex flex-col"
          >
            {!hasActiveContext ? (
              // Drop zone
              <div className="h-full flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-all duration-200 mx-3 border-gray-300 bg-gray-50">
                <MessageSquare className="h-12 w-12 text-gray-400 mb-3" />
                <p className="text-sm text-gray-600 text-center">
                  Click "Ask AI" buttons on form fields<br />
                  to get AI assistance
                </p>
              </div>
            ) : (
              // AI Chat Interface
              <div className="h-full flex flex-col">
                {/* Status Banners */}
                {fieldContext && (
                  <div className="flex items-center space-x-2 p-2 bg-blue-50 border border-blue-200 rounded-md mb-3 mx-3">
                    <Bot className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-700">
                      Assisting with: <strong>{fieldContext.label}</strong>
                    </span>
                  </div>
                )}

                {contextError && (
                  <div className="flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded-md mb-3 mx-3">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-700">
                      Error: {contextError}
                    </span>
                  </div>
                )}

                {isBuildingContext && (
                  <div className="flex items-center space-x-2 p-2 bg-blue-50 border border-blue-200 rounded-md mb-3 mx-3">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-sm text-blue-700">
                      Building context for field...
                    </span>
                  </div>
                )}

                {/* Chat History Card */}
                <div className="flex-1 mx-3 mb-3 min-h-0">
                  <Card className="h-full">
                    <CardContent className="p-3 h-full">
                      <div className="h-full overflow-y-auto space-y-3">
                        {aiMessages.map((message) => (
                          <div
                            key={message.id}
                            className={cn(
                              "flex space-x-2",
                              message.type === 'user' ? "justify-end" : "justify-start"
                            )}
                          >
                            <div
                              className={cn(
                                "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                                message.type === 'user'
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-100 text-gray-800"
                              )}
                            >
                              {message.type === 'ai' && message.isStreaming ? (
                                <div className="flex items-center space-x-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <span>Thinking...</span>
                                </div>
                              ) : (
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {message.content}
                                </ReactMarkdown>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Instructions */}
                <div className="text-center mx-3">
                  <p className="text-sm text-gray-500">
                    Drop another field here for guidance
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 