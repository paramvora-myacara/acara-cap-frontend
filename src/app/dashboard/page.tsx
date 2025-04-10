// src/app/dashboard/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/Button';
import { RoleBasedRoute } from '../../components/auth/RoleBasedRoute';
import { useProjects } from '../../hooks/useProjects';
import { useBorrowerProfile } from '../../hooks/useBorrowerProfile';
import { useAuth } from '../../hooks/useAuth';
import { useUI } from '../../hooks/useUI';
import { GlobalToast } from '../../components/ui/GlobalToast';
import { 
  PlusCircle, 
  FileText, 
  ArrowUpRight, 
  Calendar, 
  Building, 
  Users, 
  CheckCircle, 
  UserCheck, 
  FileCheck,
  Zap
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { projects, isLoading, getCompletionStats } = useProjects();
  const { borrowerProfile, principals } = useBorrowerProfile();
  const { user } = useAuth();
  const { showNotification } = useUI();

  // Get completion statistics
  const stats = getCompletionStats();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Handle resource card button click
  const handleResourceClick = (resourceId: string, action: string | null) => {
    if (action) {
      router.push(action);
    } else {
      // Show notification for upcoming features
      showNotification({
        type: 'info',
        message: 'This feature is coming soon in a future update!',
        duration: 3000
      });
    }
  };

  return (
    <RoleBasedRoute roles={['borrower']}>
      <DashboardLayout title="Dashboard">
        <GlobalToast />
        
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Welcome back, {user?.name || user?.email?.split('@')[0] || 'User'}
          </h2>
          <p className="text-gray-600">
            Track your projects and connect with lenders that match your needs.
          </p>
        </div>
        
        {/* Profile Completion Card (shown only if profile is incomplete) */}
        {(!borrowerProfile || borrowerProfile.completenessPercent < 100) && (
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Complete Your Borrower Profile</h3>
                  <p className="text-gray-600 mb-4">
                    Your borrower profile is {borrowerProfile ? borrowerProfile.completenessPercent : 0}% complete. 
                    A complete profile helps us match you with the most suitable lenders.
                  </p>
                  <div className="w-full h-2 bg-gray-200 rounded-full mb-2">
                    <div 
                      className="h-full rounded-full bg-blue-600" 
                      style={{ width: `${borrowerProfile ? borrowerProfile.completenessPercent : 0}%` }}
                    />
                  </div>
                </div>
                <div className="ml-4">
                  <Button 
                    variant="primary"
                    onClick={() => router.push('/profile')}
                  >
                    {borrowerProfile ? 'Update Profile' : 'Create Profile'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm border-blue-100">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Projects</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.totalProjects}</h3>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 shadow-sm border-emerald-100">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-emerald-600">Completed Projects</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.completedProjects}</h3>
                </div>
                <div className="bg-emerald-100 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-violet-50 to-purple-50 shadow-sm border-violet-100">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-violet-600">Borrower Completion</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.averageBorrowerProgress}%</h3>
                </div>
                <div className="bg-violet-100 p-3 rounded-lg">
                  <UserCheck className="h-6 w-6 text-violet-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 shadow-sm border-amber-100">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-amber-600">Project Completion</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.averageProjectProgress}%</h3>
                </div>
                <div className="bg-amber-100 p-3 rounded-lg">
                  <FileCheck className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Welcome Card (shown only when no projects exist) */}
        {projects.length === 0 && (
          <Card className="mb-8 bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-xl">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Welcome to ACARA-Cap!</h2>
              <p className="text-blue-100 mb-6">
                Get matched with the perfect lenders for your commercial real estate projects.
                Start by creating your first project.
              </p>
              <Button 
                variant="secondary"
                leftIcon={<PlusCircle size={16} />}
                onClick={() => router.push('/project/create')}
              >
                Create Your First Project
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* Projects Section */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Your Projects</h2>
          {projects.length > 0 && (
            <Button 
              variant="primary"
              leftIcon={<PlusCircle size={16} />}
              onClick={() => router.push('/project/create')}
            >
              New Project
            </Button>
          )}
        </div>
        
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 truncate">{project.projectName}</h3>
                    {project.borrowerProgress === 100 && project.projectProgress === 100 ? (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Complete
                      </span>
                    ) : (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center">
                        <Zap className="h-3 w-3 mr-1" />
                        {project.projectStatus}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-4 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Created on {formatDate(project.createdAt)}
                    {project.updatedAt !== project.createdAt && (
                      <span className="ml-3 text-gray-400">
                        • Updated {formatDate(project.updatedAt)}
                      </span>
                    )}
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Borrower Resume</span>
                        <span className="font-medium text-blue-600">{project.borrowerProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div 
                          className="h-full rounded-full bg-blue-600" 
                          style={{ width: `${project.borrowerProgress}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Project Resume</span>
                        <span className="font-medium text-blue-600">{project.projectProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-full rounded-full bg-blue-600" 
                          style={{ width: `${project.projectProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="bg-gray-50 px-6 py-4 border-t">
                  <Button 
                    variant="outline"
                    fullWidth
                    rightIcon={<ArrowUpRight size={16} />}
                    onClick={() => router.push(`/project/${project.id}`)}
                  >
                    View Project
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No projects yet</h3>
            <p className="text-gray-500 mb-6">Create your first project to get started with finding lenders.</p>
            <Button 
              variant="primary"
              leftIcon={<PlusCircle size={16} />}
              onClick={() => router.push('/project/create')}
            >
              Create Project
            </Button>
          </div>
        )}
        
        {/* Additional resources section */}
        {projects.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-3">
                    <Building className="h-6 w-6 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-800 ml-2">Find Lenders</h3>
                  </div>
                  <p className="text-gray-600 mb-4">Search and match with lenders based on your project criteria.</p>
                  <Button 
                    variant="outline"
                    rightIcon={<ArrowUpRight size={16} />}
                    onClick={() => handleResourceClick('resource-lender-matching', '/')}
                  >
                    Go to Lender Matching
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-3">
                    <FileText className="h-6 w-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-800 ml-2">Project Templates</h3>
                  </div>
                  <p className="text-gray-600 mb-4">Jumpstart your project creation with pre-filled templates.</p>
                  <Button 
                    variant="outline"
                    rightIcon={<ArrowUpRight size={16} />}
                    onClick={() => handleResourceClick('resource-templates', null)}
                  >
                    Browse Templates
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-3">
                    <Users className="h-6 w-6 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-800 ml-2">Need Help?</h3>
                  </div>
                  <p className="text-gray-600 mb-4">Connect with a capital markets advisor for personalized guidance.</p>
                  <Button 
                    variant="outline"
                    rightIcon={<ArrowUpRight size={16} />}
                    onClick={() => handleResourceClick('resource-advisors', null)}
                  >
                    Talk to an Advisor
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </DashboardLayout>
    </RoleBasedRoute>
  );
}