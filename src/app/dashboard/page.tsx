// src/app/dashboard/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/Button';
import { RoleBasedRoute } from '../../components/auth/RoleBasedRoute';
import { useProjects } from '../../hooks/useProjects';
import { useBorrowerProfile } from '../../hooks/useBorrowerProfile';
import { useAuth } from '../../hooks/useAuth';
import { useUI } from '../../hooks/useUI';
import { GlobalToast } from '../../components/ui/GlobalToast';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';
import { WelcomeOnboarding } from '../../components/onboarding/WelcomeOnboarding';
import { ProgressCard } from '../../components/dashboard/ProgressCard';
import { MessagePanel } from '../../components/dashboard/MessagePanel';
import { 
  PlusCircle, 
  FileText, 
  ChevronRight, 
  Calendar, 
  Building, 
  Users, 
  CheckCircle, 
  UserCheck, 
  FileCheck,
  Zap,
  AlertCircle
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { projects, isLoading, getCompletionStats, createProject } = useProjects();
  const { borrowerProfile } = useBorrowerProfile();
  const { user } = useAuth();
  const { showNotification, setLoading } = useUI();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasCreatedFirstProject, setHasCreatedFirstProject] = useState(false);

  // Set loading state based on project loading status
  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  // Check if this is a first-time user
  useEffect(() => {
    if (!isLoading) {
      const isFirstTimeUser = projects.length === 0 && !localStorage.getItem('onboarding_completed');
      setShowOnboarding(isFirstTimeUser);
      
      // Auto-create first project for new users
      if (isFirstTimeUser && !hasCreatedFirstProject && borrowerProfile) {
        handleCreateFirstProject();
      }
    }
  }, [isLoading, projects, borrowerProfile, hasCreatedFirstProject]);

  // Handle completion of onboarding
  const handleOnboardingComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  // Auto-create first project for new users
  const handleCreateFirstProject = async () => {
    try {
      setHasCreatedFirstProject(true);
      
      if (!borrowerProfile) {
        // We need to wait for the profile to be ready
        return;
      }

      const initialProject = await createProject({
        projectName: "My First Project",
        assetType: "Multifamily", // Default to common type
        projectPhase: "Acquisition",
        loanAmountRequested: 10000000, // $10M default
        targetLtvPercent: 70,
        projectStatus: "Info Gathering", // Start with info gathering
      });
      
      // Don't navigate away, but show notification
      showNotification({
        type: 'success',
        message: 'We\'ve created your first project to help you get started!',
      });
    } catch (error) {
      console.error('Error creating first project:', error);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get stats
  const stats = getCompletionStats();

  // Handle creating a new project
  const handleCreateProject = () => {
    router.push('/project/create');
  };

  return (
    <RoleBasedRoute roles={['borrower']}>
      <DashboardLayout title="My Dashboard">
        <LoadingOverlay />
        <GlobalToast />
        
        {showOnboarding && (
          <WelcomeOnboarding onComplete={handleOnboardingComplete} />
        )}
        
        {/* Main dashboard content */}
        <div className="space-y-8">
          {/* Profile and Project Completion Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Completion Card */}
            <ProgressCard
              title="Borrower Profile"
              description="Complete your profile to enhance lender matches"
              percentage={borrowerProfile?.completenessPercent || 0}
              status={borrowerProfile ? 'active' : 'needed'}
              actionText={borrowerProfile ? 'Update Profile' : 'Create Profile'}
              actionUrl="/profile"
              icon={<UserCheck className="h-6 w-6 text-blue-600" />}
            />
            
            {/* Project Status Cards */}
            {projects.length > 0 ? (
              <ProgressCard
                title={projects[0].projectName}
                description="Continue working on your project"
                percentage={projects[0].completenessPercent}
                status={projects[0].projectStatus}
                actionText="Continue"
                actionUrl={`/project/${projects[0].id}`}
                icon={<FileCheck className="h-6 w-6 text-blue-600" />}
              />
            ) : (
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Create a Project</h3>
                      <p className="text-sm text-gray-500 mt-1">Start by creating your first project</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    leftIcon={<PlusCircle size={16} />}
                    onClick={handleCreateProject}
                    className="w-full mt-4"
                  >
                    Create Project
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Message Panel for First Project */}
          {projects.length > 0 && (
            <MessagePanel projectId={projects[0].id} />
          )}
          
          {/* Project List (for users with multiple projects) */}
          {projects.length > 1 && (
            <div>
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.slice(1).map((project) => (
                  <Card key={project.id} className="shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 truncate">{project.projectName}</h3>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          project.projectStatus === 'Draft' ? 'bg-gray-100 text-gray-800' :
                          project.projectStatus === 'Info Gathering' ? 'bg-blue-100 text-blue-800' :
                          project.projectStatus === 'Advisor Review' ? 'bg-amber-100 text-amber-800' :
                          project.projectStatus === 'Matches Curated' ? 'bg-purple-100 text-purple-800' :
                          project.projectStatus === 'Introductions Sent' ? 'bg-indigo-100 text-indigo-800' :
                          project.projectStatus === 'Term Sheet Received' ? 'bg-teal-100 text-teal-800' :
                          project.projectStatus === 'Closed' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {project.projectStatus === 'Closed' ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <Zap className="h-3 w-3 mr-1" />
                          )}
                          {project.projectStatus}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-500 mb-4 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Last Updated: {formatDate(project.updatedAt)}
                      </p>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Completion</span>
                            <span className="font-medium text-blue-600">{project.completenessPercent}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-full rounded-full bg-blue-600" 
                              style={{ width: `${project.completenessPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline"
                        fullWidth
                        rightIcon={<ChevronRight size={16} />}
                        onClick={() => router.push(`/project/${project.id}`)}
                        className="mt-4"
                      >
                        View Project
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* Contextual Help */}
          {!showOnboarding && (
            <Card className="bg-blue-50 border-blue-100 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-3 rounded-lg mr-4">
                    <AlertCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Need Help?</h3>
                    <p className="text-gray-600 mb-4">
                      Your capital advisor is ready to assist you with your project. Complete your profile and project details, then check your message board for personalized guidance.
                    </p>
                    {projects.length > 0 && (
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/project/${projects[0].id}`)}
                      >
                        Go to Message Board
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </RoleBasedRoute>
  );
}