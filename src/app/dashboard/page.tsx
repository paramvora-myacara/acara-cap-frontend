// src/app/dashboard/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Button } from '../../components/ui/Button';
import { RoleBasedRoute } from '../../components/auth/RoleBasedRoute';
import { useProjects } from '../../hooks/useProjects';
import { useBorrowerProfile } from '../../hooks/useBorrowerProfile';
import { useAuth } from '../../hooks/useAuth';
import { useUI } from '../../hooks/useUI';
import { GlobalToast } from '../../components/ui/GlobalToast';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';
import { BorrowerProfileForm } from '../../components/forms/BorrowerProfileForm';
import { ProjectCard } from '../../components/project/ProjectCard';
import { PlusCircle, Building } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { projects, isLoading: projectsLoading, projectMessages, createProject } = useProjects();
  const { borrowerProfile, isLoading: profileLoading } = useBorrowerProfile();
  const { user } = useAuth();
  const { showNotification, setLoading } = useUI();
  const [showProfileForm, setShowProfileForm] = useState(false);

  // Set loading state based on project loading status
  useEffect(() => {
    setLoading(projectsLoading || profileLoading);
  }, [projectsLoading, profileLoading, setLoading]);

  // Check if user has come from LenderLine
  useEffect(() => {
    const cameFromLenderLine = localStorage.getItem('cameFromLenderLine');
    if (cameFromLenderLine) {
      localStorage.removeItem('cameFromLenderLine');
      router.push('/project/create');
    }
  }, [router]);

  // Check if this is a new user with no projects
  useEffect(() => {
    if (!projectsLoading && projects.length === 0) {
      router.push('/project/create');
    }
  }, [projectsLoading, projects, router]);

  // Check for unread messages for each project
  const getUnreadMessageCount = (projectId: string) => {
    return projectMessages.filter(msg => 
      msg.projectId === projectId && 
      !msg.isRead && 
      msg.senderType === 'Advisor'
    ).length;
  };

  // Handle creating a new project
  const handleCreateProject = () => {
    // First, store a flag to indicate we're creating a project from Dashboard
    localStorage.setItem('creatingFromDashboard', 'true');
    // Then redirect to the lender matching interface
    router.push('/');
  };

  return (
    <RoleBasedRoute roles={['borrower']}>
      <DashboardLayout title="Deal Room™ Dashboard">
        <LoadingOverlay />
        <GlobalToast />
        
        {/* Borrower Profile Section */}
        <div className="mb-8">
          <Card className="shadow-sm">
            <CardHeader className="border-b bg-gray-50 flex justify-between items-center pb-3">
              <div className="flex items-center">
                <Building className="h-5 w-5 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Borrower Profile</h2>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowProfileForm(!showProfileForm)}
              >
                {showProfileForm ? 'Hide' : 'Edit'} Profile
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              {showProfileForm ? (
                <BorrowerProfileForm />
              ) : (
                <div>
                  <div className="flex justify-between mb-4">
                    <div className="text-gray-700">
                      <p className="font-medium">{borrowerProfile?.fullLegalName || 'Complete your profile'}</p>
                      <p className="text-sm text-gray-500">{borrowerProfile?.primaryEntityName}</p>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <div className="w-full h-2 bg-gray-200 rounded-full mr-2 w-24">
                          <div 
                            className={`h-full rounded-full ${
                              (borrowerProfile?.completenessPercent || 0) === 100 ? 'bg-green-600' : 'bg-blue-600'
                            }`}
                            style={{ width: `${borrowerProfile?.completenessPercent || 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {borrowerProfile?.completenessPercent || 0}% Complete
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Projects Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Your Projects</h2>
            <Button 
              variant="primary"
              leftIcon={<PlusCircle size={16} />}
              onClick={handleCreateProject}
            >
              New Project
            </Button>
          </div>
          
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(project => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  hasUnreadMessages={getUnreadMessageCount(project.id) > 0}
                />
              ))}
            </div>
          ) : (
            <Card className="shadow-sm">
              <CardContent className="p-8 text-center">
                <p className="text-gray-500 mb-4">You don't have any projects yet.</p>
                <Button 
                  variant="primary"
                  leftIcon={<PlusCircle size={16} />}
                  onClick={handleCreateProject}
                >
                  Create Your First Project
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </RoleBasedRoute>
  );
}