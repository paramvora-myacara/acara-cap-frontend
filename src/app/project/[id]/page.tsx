// src/app/project/[id]/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { Button } from '../../../components/ui/Button';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';
import { useProjects } from '../../../hooks/useProjects';
import { useUI } from '../../../hooks/useUI';
import { GlobalToast } from '../../../components/ui/GlobalToast';
import { LoadingOverlay } from '../../../components/ui/LoadingOverlay';
import { ChevronLeft, MessageSquare, FileText, User, Edit } from 'lucide-react';

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { getProject, isLoading, setActiveProject } = useProjects();
  const { showNotification, setLoading } = useUI();

  // Update loading state
  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  // Load project
  useEffect(() => {
    const projectId = params?.id as string;
    
    if (!projectId) {
      router.push('/dashboard');
      return;
    }
    
    const project = getProject(projectId);
    if (project) {
      setActiveProject(project);
    } else {
      showNotification({
        type: 'error',
        message: 'Project not found',
      });
      router.push('/dashboard');
    }
  }, [params, router, getProject, setActiveProject, showNotification]);

  // Get active project
  const { activeProject } = useProjects();

  if (!activeProject) {
    return (
      <ProtectedRoute>
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
      </ProtectedRoute>
    );
  }

  // Get personalized message based on project data
  const getAdvisorMessage = () => {
    // Extract asset type, deal type, and capital type from project
    let assetType = '';
    let dealType = '';
    let capitalType = '';
    
    activeProject.projectSections.forEach(section => {
      section.fields.forEach((field: any) => {
        if (field.id === 'assetType') assetType = field.value;
        if (field.id === 'dealType') dealType = field.value;
        if (field.id === 'capitalType') capitalType = field.value;
      });
    });

    // Create personalized message based on selected options
    if (assetType && dealType && capitalType) {
      return `Hello! I'm Sarah, your dedicated Capital Markets Advisor at ACARA-Cap. 
      I see you're looking for ${capitalType} financing for a ${assetType} ${dealType} project. 
      That's great! Based on your project details, I've already identified several well-matched lenders. 
      To get the best matches and terms, please complete your Borrower and Project Resumes. 
      I'm here to help every step of the way, so feel free to ask any questions.`;
    } else if (assetType && dealType) {
      return `Hello! I'm Sarah, your dedicated Capital Markets Advisor at ACARA-Cap. 
      I see you're working on a ${assetType} ${dealType} project. I'm excited to help you 
      find the perfect financing solution. Please complete your Borrower and Project Resumes 
      so we can match you with the ideal capital providers. Let me know if you have any questions!`;
    } else {
      return `Hello! I'm Sarah, your dedicated Capital Markets Advisor at ACARA-Cap. 
      I'm here to help you find the ideal financing for your commercial real estate project. 
      Please complete your Borrower and Project Resumes so we can match you with suitable lenders. 
      Don't hesitate to reach out if you have any questions or need assistance.`;
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title={activeProject.name}>
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
          {/* Borrower Resume Card */}
          <Card className="shadow-md lg:col-span-1">
            <CardHeader className="pb-3 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Borrower Resume
                </h2>
                <div className="text-sm text-gray-500 mt-1">{activeProject.borrowerProgress}% Complete</div>
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
              <div className="w-full h-2 bg-gray-200 rounded-full mb-4">
                <div 
                  className="h-full rounded-full bg-blue-600" 
                  style={{ width: `${activeProject.borrowerProgress}%` }}
                />
              </div>
              
              {activeProject.borrowerSections.map((section) => (
                <div key={section.id} className="mb-4">
                  <h3 className="font-medium text-gray-800 mb-2">{section.title}</h3>
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full border-collapse">
                      <tbody>
                        {section.fields.map((field: any) => (
                          <tr key={field.id} className="border-b last:border-b-0">
                            <td className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 w-1/3">
                              {field.label}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-800">
                              {field.value || <span className="text-gray-400">Not provided</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          
          {/* Project Resume Card */}
          <Card className="shadow-md lg:col-span-1">
            <CardHeader className="pb-3 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Project Resume
                </h2>
                <div className="text-sm text-gray-500 mt-1">{activeProject.projectProgress}% Complete</div>
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
              <div className="w-full h-2 bg-gray-200 rounded-full mb-4">
                <div 
                  className="h-full rounded-full bg-blue-600" 
                  style={{ width: `${activeProject.projectProgress}%` }}
                />
              </div>
              
              {activeProject.projectSections.map((section) => (
                <div key={section.id} className="mb-4">
                  <h3 className="font-medium text-gray-800 mb-2">{section.title}</h3>
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full border-collapse">
                      <tbody>
                        {section.fields.map((field: any) => (
                          <tr key={field.id} className="border-b last:border-b-0">
                            <td className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 w-1/3">
                              {field.label}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-800">
                              {field.value || <span className="text-gray-400">Not provided</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          
          {/* Message Board Card */}
          <Card className="shadow-md lg:col-span-1">
            <CardHeader className="pb-3 border-b">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                Project Message Board
              </h2>
            </CardHeader>
            
            <CardContent className="p-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                <div className="flex items-start mb-3">
                  <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold mr-3">
                    SA
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Sarah Adams</h4>
                    <p className="text-xs text-gray-500">Capital Markets Advisor • Just now</p>
                  </div>
                </div>
                <div className="text-gray-700 text-sm pl-14">
                  <p className="whitespace-pre-line">{getAdvisorMessage()}</p>
                </div>
              </div>
              
              <div className="mt-6">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Reply to Sarah
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type your message here..."
                ></textarea>
                <Button className="mt-3" variant="primary" leftIcon={<MessageSquare size={16} />}>
                  Send Message
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}