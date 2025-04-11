// src/app/project/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { Button } from '../../../components/ui/Button';
import { RoleBasedRoute } from '../../../components/auth/RoleBasedRoute';
import { useProjects } from '../../../hooks/useProjects';
import { useBorrowerProfile } from '../../../hooks/useBorrowerProfile';
import { useUI } from '../../../hooks/useUI';
import { GlobalToast } from '../../../components/ui/GlobalToast';
import { LoadingOverlay } from '../../../components/ui/LoadingOverlay';
import { ProjectStatusPathway } from '../../../components/project/ProjectStatusPathway';

import { 
  ChevronLeft, 
  MessageSquare, 
  FileText, 
  User, 
  Edit, 
  MapPin,
  Building,
  DollarSign,
  Clock,
  FileQuestion,
  Send
} from 'lucide-react';
import { ProjectMessage, DocumentCategory } from '../../../types/enhanced-types';
import { getAdvisorById } from '../../../../lib/enhancedMockApiService';

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { getProject, isLoading, activeProject, setActiveProject, projectMessages, documentRequirements, addProjectMessage } = useProjects();
  const { borrowerProfile } = useBorrowerProfile();
  const { showNotification, setLoading } = useUI();
  
  const [advisorName, setAdvisorName] = useState('Your Capital Advisor');
  const [advisorAvatar, setAdvisorAvatar] = useState('');
  const [newMessage, setNewMessage] = useState('');

  // Update loading state
  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  // Load project
  useEffect(() => {
    const loadProject = async () => {
      const projectId = params?.id as string;
      
      if (!projectId) {
        router.push('/dashboard');
        return;
      }
      
      const project = getProject(projectId);
      if (project) {
        setActiveProject(project);
        
        // Get advisor info if assigned
        if (project.assignedAdvisorUserId) {
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
      } else {
        showNotification({
          type: 'error',
          message: 'Project not found',
        });
        router.push('/dashboard');
      }
    };
    
    loadProject();
  }, [params, router, getProject, setActiveProject, showNotification]);
  
  // Format dollar amounts
  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return 'Not provided';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Format dates
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Get document status label and color
  const getDocumentStatusInfo = (status: string) => {
    switch (status) {
      case 'Approved':
        return { color: 'bg-green-100 text-green-800', icon: '✓' };
      case 'Rejected':
        return { color: 'bg-red-100 text-red-800', icon: '✗' };
      case 'Uploaded':
        return { color: 'bg-blue-100 text-blue-800', icon: '↑' };
      case 'In Review':
        return { color: 'bg-amber-100 text-amber-800', icon: '⟳' };
      case 'Required':
        return { color: 'bg-gray-100 text-gray-800', icon: '!' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: '?' };
    }
  };
  
  // Send a message
  const handleSendMessage = async () => {
    if (!activeProject) return;
    
    if (!newMessage.trim()) {
      showNotification({
        type: 'error',
        message: 'Please enter a message',
      });
      return;
    }
    
    try {
      await addProjectMessage(newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      showNotification({
        type: 'error',
        message: 'Failed to send message',
      });
    }
  };

  if (!activeProject) {
    return (
      <RoleBasedRoute roles={['borrower']}>
        <DashboardLayout title="Project Not Found">
          <LoadingOverlay />
          <GlobalToast />
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Project not found</h2>
            <p className="text-gray-600 mb-6">The project you're looking for doesn't exist or has been removed.</p>
            <Button 
              variant="outline"
              leftIcon={<ChevronLeft size={16} />}
              onClick={() => router.push('/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
        </DashboardLayout>
      </RoleBasedRoute>
    );
  }

  return (
    <RoleBasedRoute roles={['borrower']}>
      <DashboardLayout title={activeProject.projectName}>
        <LoadingOverlay />
        <GlobalToast />
        
        <div className="mb-6">
          <Button 
            variant="outline"
            leftIcon={<ChevronLeft size={16} />}
            onClick={() => router.push('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project Details Card */}
          <Card className="shadow-md lg:col-span-2">
            <CardHeader className="pb-3 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Project Details
                </h2>
                <div className="text-sm text-gray-500 mt-1">
                  Status: <span className="font-medium text-blue-600">{activeProject.projectStatus}</span>
                </div>
              </div>
              <Button 
                variant="outline"
                leftIcon={<Edit size={16} />}
                onClick={() => router.push(`/project/edit/${activeProject.id}`)}
              >
                Edit
              </Button>
            </CardHeader>
            
            <CardContent className="p-4">
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                    Property Location
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-800">
                      {activeProject.propertyAddressStreet}<br />
                      {activeProject.propertyAddressCity}, {activeProject.propertyAddressState} {activeProject.propertyAddressZip}
                      {activeProject.propertyAddressCounty && <span><br />{activeProject.propertyAddressCounty}</span>}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                    <Building className="h-4 w-4 mr-2 text-blue-600" />
                    Property & Project Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Asset Type</h4>
                      <p className="text-gray-800">{activeProject.assetType || 'Not specified'}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Project Phase</h4>
                      <p className="text-gray-800">{activeProject.projectPhase}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Project Description</h4>
                      <p className="text-gray-800">{activeProject.projectDescription || 'No description provided'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-blue-600" />
                    Financing Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Loan Amount</h4>
                      <p className="text-gray-800">{formatCurrency(activeProject.loanAmountRequested)}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Loan Type</h4>
                      <p className="text-gray-800">{activeProject.loanType || 'Not specified'}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Target LTV</h4>
                      <p className="text-gray-800">{activeProject.targetLtvPercent}%</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Target Close Date</h4>
                      <p className="text-gray-800">{formatDate(activeProject.targetCloseDate)}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Use of Proceeds</h4>
                      <p className="text-gray-800">{activeProject.useOfProceeds || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-blue-600" />
                    Project Timeline
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Created</h4>
                      <p className="text-gray-800">{formatDate(activeProject.createdAt)}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Last Updated</h4>
                      <p className="text-gray-800">{formatDate(activeProject.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document Requirements Card */}
          <Card className="shadow-md lg:col-span-1">
            <CardHeader className="pb-3 border-b bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <FileQuestion className="h-5 w-5 mr-2 text-blue-600" />
                Required Documents
              </h2>
            </CardHeader>
            <CardContent className="p-4">
              {documentRequirements.length > 0 ? (
                <div className="space-y-4">
                  {documentRequirements.map(doc => {
                    const statusInfo = getDocumentStatusInfo(doc.status);
                    return (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-800">{doc.requiredDocType}</p>
                            <p className="text-xs text-gray-500">{doc.notes}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.icon} {doc.status}
                        </span>
                      </div>
                    );
                  })}
                  
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() => router.push(`/project/documents/${activeProject.id}`)}
                    >
                      Manage Documents
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No document requirements yet</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Message Board Card */}
          <Card className="shadow-md lg:col-span-3">
            <CardHeader className="pb-3 border-b bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                Project Message Board
              </h2>
            </CardHeader>
            
            <CardContent className="p-4">
              <div className="flex flex-col space-y-6 max-h-96 overflow-y-auto mb-4 p-2">
                {projectMessages.length > 0 ? (
                  projectMessages.map((message, index) => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.senderType === 'Borrower' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-3/4 rounded-lg px-4 py-2 ${
                          message.senderType === 'Borrower' 
                            ? 'bg-blue-100 text-blue-900' 
                            : 'bg-gray-100 text-gray-900'
                        }`}
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
              </div>
              
              <div className="flex space-x-2">
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
        </div>
      </DashboardLayout>
    </RoleBasedRoute>
  );
}