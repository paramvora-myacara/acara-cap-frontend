// src/app/project/create/page.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
// Use MinimalSidebarLayout instead of DashboardLayout
import MinimalSidebarLayout from '../../../components/layout/MinimalSidebarLayout';
import { EnhancedProjectForm } from '../../../components/forms/EnhancedProjectForm';
import { RoleBasedRoute } from '../../../components/auth/RoleBasedRoute';
import { GlobalToast } from '../../../components/ui/GlobalToast';
import { useUI } from '../../../hooks/useUI';
import { useProjects } from '../../../hooks/useProjects';
import { useBorrowerProfile } from '../../../hooks/useBorrowerProfile';
import { ProjectProfile } from '../../../types/enhanced-types';
<<<<<<< HEAD
import { Loader2 } from 'lucide-react'; // For loading state
import { Button } from '@/components/ui/Button';
=======
import { Card, CardContent } from '../../../components/ui/card';
>>>>>>> 12a0c30c3463db3600051d26b5cd6aaf2e2f7ee3

export default function CreateProjectPage() {
  const router = useRouter();
  const { showNotification } = useUI();
<<<<<<< HEAD
  const { createProject, isLoading: projectsLoading } = useProjects(); // Use createProject directly? Or EnhancedProjectForm handles it?
  const { borrowerProfile, isLoading: profileLoading } = useBorrowerProfile();
  const hasShownWelcome = useRef(false);
  const [isCreating, setIsCreating] = useState(false); // State for creation process

  // Redirect if profile doesn't exist after loading? Or handled by RoleBasedRoute/Auth?
  // Let's assume profile needs to exist to manually create a project.

  // Handle form submission/completion from EnhancedProjectForm
  const handleFormComplete = async (projectData: ProjectProfile) => {
    // This page might not directly create the project anymore if EnhancedProjectForm handles auto-save/update
    // If it *is* meant to trigger final creation:
    // setIsCreating(true);
    try {
        // Typically, EnhancedProjectForm would handle its own saving via auto-save
        // This onComplete might just be for navigation after the wizard finishes
        showNotification({ type: 'success', message: 'Project data processed.' });
         // Navigate to the new workspace page for the created/updated project
        router.push(`/project/workspace/${projectData.id}`);

    } catch (error) {
        console.error("Error during final project step:", error);
        showNotification({ type: 'error', message: 'Failed to finalize project.' });
        // setIsCreating(false);
    }
  };

   // If profile is loading, show loading state
   if (profileLoading || projectsLoading) {
        return (
             <MinimalSidebarLayout title="New Project">
                 <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="ml-3 text-gray-600">Loading...</span>
                </div>
             </MinimalSidebarLayout>
        );
    }

     // If no profile exists after loading, prompt user (though redirect might be better)
    if (!borrowerProfile) {
         return (
             <MinimalSidebarLayout title="New Project">
                 <div className="text-center p-8 bg-white rounded shadow">
                     <h2 className="text-xl font-semibold mb-4">Borrower Profile Required</h2>
                     <p className="mb-4 text-gray-600">You need to create your Borrower Profile before creating a project.</p>
                     <Button onClick={() => router.push('/profile')}>Go to Profile</Button>
                 </div>
             </MinimalSidebarLayout>
         );
     }


   // TEMPORARY: EnhancedProjectForm needs an `existingProject` prop.
   // For a *new* project page, we don't have one yet. How should this work?
   // Option 1: Create a temporary blank project object.
   // Option 2: Refactor EnhancedProjectForm to accept null/undefined `existingProject`.
   // Option 3: Remove this page and rely solely on auto-creation + workspace editing.
   // Let's go with Option 3 for now, assuming this page becomes obsolete.
   // We'll comment out the rendering of EnhancedProjectForm.
=======
  const { autoSaveProject, projects, createInitialProject } = useProjects();
  const { borrowerProfile } = useBorrowerProfile();
  const hasShownWelcome = useRef(false);
  
  // Check for LenderLine data
  useEffect(() => {
    const lastFormDataStr = localStorage.getItem('lastFormData');
    const cameFromLenderLine = localStorage.getItem('cameFromLenderLine');
    
    if (lastFormDataStr && cameFromLenderLine) {
      // Clear the flag as we're now handling it
      localStorage.removeItem('cameFromLenderLine');
      
      if (!hasShownWelcome.current) {
        hasShownWelcome.current = true;
        
        // Show welcome message with lender match info
        setTimeout(() => {
          try {
            const lastFormData = JSON.parse(lastFormDataStr);
            const assetTypes = lastFormData.asset_types?.length > 0 
              ? lastFormData.asset_types[0] 
              : '';
            
            showNotification({
              type: 'success',
              message: `We've created a project based on your ${assetTypes} property search.`,
            });
          } catch (error) {
            showNotification({
              type: 'info',
              message: 'Your project is ready. Complete the details to match with lenders.',
            });
          }
        }, 1000);
      }
    } else if (!hasShownWelcome.current) {
      hasShownWelcome.current = true;
      
      // Different message for new project not from LenderLine
      if (projects.length === 0) {
        // First project
        setTimeout(() => {
          showNotification({
            type: 'info',
            message: 'Welcome! Let\'s create your first project.',
          });
        }, 1000);
      } else {
        // Additional project
        setTimeout(() => {
          showNotification({
            type: 'info',
            message: 'Your project will be saved automatically as you work.',
          });
        }, 1000);
      }
    }
  }, [showNotification, projects.length]);
  
  // Create initial project if needed
  useEffect(() => {
    const initializeProject = async () => {
      // Check if this is a new user with no projects
      if (projects.length === 0 && borrowerProfile) {
        try {
          await createInitialProject();
        } catch (error) {
          console.error('Error creating initial project:', error);
        }
      }
    };
    
    initializeProject();
  }, [projects.length, borrowerProfile, createInitialProject]);
  
  // Auto-save before page unload
  useEffect(() => {
    const handleBeforeUnload = async () => {
      await autoSaveProject();
    };
    
    // Try to save when navigating away
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [autoSaveProject]);
  
  // Handle form saved event
  const handleFormSaved = (project: ProjectProfile) => {
    showNotification({
      type: 'success',
      message: 'Project saved successfully',
    });
    
    // Navigate to project detail page after successful save
    router.push(`/project/${project.id}`);
  };

  // Check if borrower profile exists
  const profileIncomplete = !borrowerProfile || borrowerProfile.completenessPercent < 50;
>>>>>>> 12a0c30c3463db3600051d26b5cd6aaf2e2f7ee3

  return (
    <RoleBasedRoute roles={['borrower']}>
      <MinimalSidebarLayout title="New Project"> {/* Use new layout */}
        <GlobalToast />
<<<<<<< HEAD

        <div className="mb-6 p-4 bg-yellow-100 border border-yellow-300 rounded text-yellow-800">
           <h2 className="text-lg font-semibold">Manual Project Creation</h2>
           <p className="text-sm mt-1">Note: Projects are now typically created automatically when you first log in or via the LenderLine™. This page is for potential future use or edge cases.</p>
           <p className="text-sm mt-1">Please use your dashboard or the homepage to start.</p>
           <Button onClick={() => router.push('/dashboard')} variant="outline" size="sm" className="mt-2">Go to Dashboard</Button>
        </div>

        {/*
=======
        
        {profileIncomplete && (
          <Card className="mb-6 bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <p className="text-amber-800">
                <strong>Complete your borrower profile</strong> to help us match you with the right lenders.
              </p>
            </CardContent>
          </Card>
        )}
        
>>>>>>> 12a0c30c3463db3600051d26b5cd6aaf2e2f7ee3
        <div className="mb-6">
          <h2 className="text-lg text-gray-600">
            Define your new project details below. It will auto-save.
          </h2>
        </div>
        {/* This will error because existingProject is required. Needs refactor or page removal. */}
        {/* <EnhancedProjectForm existingProject={???} onComplete={handleFormComplete} /> */}

      </MinimalSidebarLayout>
    </RoleBasedRoute>
  );
}