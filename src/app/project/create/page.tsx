// src/app/project/create/page.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { EnhancedProjectForm } from '../../../components/forms/EnhancedProjectForm';
import { RoleBasedRoute } from '../../../components/auth/RoleBasedRoute';
import { GlobalToast } from '../../../components/ui/GlobalToast';
import { useUI } from '../../../hooks/useUI';
import { useProjects } from '../../../hooks/useProjects';
import { useBorrowerProfile } from '../../../hooks/useBorrowerProfile';
import { ProjectProfile } from '../../../types/enhanced-types';

export default function CreateProjectPage() {
  const router = useRouter();
  const { showNotification } = useUI();
  const { autoSaveProject } = useProjects();
  const { borrowerProfile } = useBorrowerProfile();
  const hasShownWelcome = useRef(false);
  
  // Show welcome message only once - but don't redirect if no profile
  useEffect(() => {
    if (!hasShownWelcome.current) {
      hasShownWelcome.current = true;
      
      if (!borrowerProfile) {
        // Just show a notification instead of redirecting
        setTimeout(() => {
          showNotification({
            type: 'info',
            message: 'Please complete your borrower profile when you can to improve lender matches',
          });
        }, 500);
      } else {
        // Show auto-save notification
        setTimeout(() => {
          showNotification({
            type: 'info',
            message: 'Your project will be saved automatically as you work.',
          });
        }, 500);
      }
    }
  }, [showNotification, borrowerProfile]);
  
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

  return (
    <RoleBasedRoute roles={['borrower']}>
      <DashboardLayout title="New Project">
        <GlobalToast />
        
        <div className="mb-6">
          <h2 className="text-lg text-gray-600">
            Your project is created automatically and will auto-save as you work.
          </h2>
        </div>
        
        <EnhancedProjectForm onComplete={handleFormSaved} />
      </DashboardLayout>
    </RoleBasedRoute>
  );
}