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
import { Loader2 } from 'lucide-react'; // For loading state
import { Button } from '@/components/ui/Button';

export default function CreateProjectPage() {
  const router = useRouter();
  const { showNotification } = useUI();
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

  return (
    <RoleBasedRoute roles={['borrower']}>
      <MinimalSidebarLayout title="New Project"> {/* Use new layout */}
        <GlobalToast />

        <div className="mb-6 p-4 bg-yellow-100 border border-yellow-300 rounded text-yellow-800">
           <h2 className="text-lg font-semibold">Manual Project Creation</h2>
           <p className="text-sm mt-1">Note: Projects are now typically created automatically when you first log in or via the LenderLine™. This page is for potential future use or edge cases.</p>
           <p className="text-sm mt-1">Please use your dashboard or the homepage to start.</p>
           <Button onClick={() => router.push('/dashboard')} variant="outline" size="sm" className="mt-2">Go to Dashboard</Button>
        </div>

        {/*
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