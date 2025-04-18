// src/components/dashboard/MessagePanel.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/Button';
import { MessageSquare, Send, ChevronRight } from 'lucide-react';
import { useProjects } from '../../hooks/useProjects';
import { ProjectMessage } from '../../types/enhanced-types';
import { getAdvisorById, generateAdvisorMessage } from '../../../lib/enhancedMockApiService';
import { cn } from '../../utils/cn';

interface MessagePanelProps {
  projectId: string;
  fullHeight?: boolean;
}

export const MessagePanel: React.FC<MessagePanelProps> = ({ 
  projectId,
  fullHeight = false
}) => {
  const router = useRouter();
  const { getProject, projectMessages, addProjectMessage } = useProjects();
  const [newMessage, setNewMessage] = useState('');
  const [advisorName, setAdvisorName] = useState('Your Capital Advisor');
  const [advisorAvatar, setAdvisorAvatar] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get the project
  const project = getProject(projectId);

  // Get advisor information
  useEffect(() => {
    const loadAdvisorInfo = async () => {
      if (project?.assignedAdvisorUserId) {
        try {
          const advisor = await getAdvisorById(project.assignedAdvisorUserId);
          if (advisor) {
            setAdvisorName(advisor.name);
            setAdvisorAvatar(advisor.avatar);
          }
        } catch (error) {
          console.error('Error fetching advisor info:', error);
        }
      }
    };
    
    loadAdvisorInfo();
  }, [project]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [projectMessages]);

  // Generate welcome message if no messages exist
  useEffect(() => {
    const generateWelcomeMessage = async () => {
      if (project && projectMessages.filter(msg => msg.projectId === projectId).length === 0 && project.assignedAdvisorUserId) {
        try {
          // Generate a welcome message for new projects
          const welcomeMessage = await generateAdvisorMessage(
            project.assignedAdvisorUserId,
            project.id,
            {
              assetType: project.assetType,
              dealType: project.projectPhase,
              loanAmount: project.loanAmountRequested,
              stage: project.projectStatus
            }
          );
          
          // Add the welcome message to the project
          await addProjectMessage(welcomeMessage, true);
        } catch (error) {
          console.error('Error generating welcome message:', error);
        }
      }
    };
    
    generateWelcomeMessage();
  }, [project, projectMessages, addProjectMessage, projectId]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!project || !newMessage.trim()) return;
    
    try {
      await addProjectMessage(newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Filter to this project's messages
  const filteredMessages = projectMessages.filter(msg => msg.projectId === projectId);

  return (
    <Card className={cn("shadow-sm", fullHeight && "h-full flex flex-col")}>
      <CardHeader className="pb-3 border-b flex justify-between items-center bg-gray-50">
        <div className="flex items-center">
          <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-800">Message Your Advisor</h2>
        </div>
        {!fullHeight && (
          <Button 
            variant="outline"
            size="sm"
            rightIcon={<ChevronRight size={16} />}
            onClick={() => router.push(`/project/${projectId}`)}
          >
            View Project
          </Button>
        )}
      </CardHeader>
      
      <CardContent className={cn("p-4", fullHeight && "flex-grow flex flex-col")}>
        <div className={cn(
          "space-y-4 overflow-y-auto mb-4 p-2", 
          fullHeight ? "flex-grow" : "max-h-64"
        )}>
          {filteredMessages.length > 0 ? (
            filteredMessages.map((message: ProjectMessage) => (
              <div 
                key={message.id} 
                className={`flex ${message.senderType === 'Borrower' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={cn(
                    "max-w-3/4 rounded-lg px-4 py-2",
                    message.senderType === 'Borrower' 
                      ? "bg-white border border-gray-200 text-gray-900" 
                      : "bg-blue-100 text-blue-900"
                  )}
                >
                  <div className="flex items-center mb-1">
                    <span className="text-xs font-medium">
                      {message.senderType === 'Borrower' ? 'You' : advisorName}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      {new Date(message.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-line">{message.message}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No messages yet</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="flex space-x-2 mt-auto">
          <textarea
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message here..."
            rows={2}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            leftIcon={<Send size={16} />}
          >
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};