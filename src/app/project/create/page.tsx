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
  
  // Check if borrower profile exists
  useEffect(() => {
    if (!borrowerProfile) {
      showNotification({
        type: 'info',
        message: 'Please complete your borrower profile before creating a project',
      });
      router.push('/profile');
    }
  }, [borrowerProfile, router, showNotification]);
  
  // Show welcome message only once
  useEffect(() => {
    if (!hasShownWelcome.current && borrowerProfile) {
      hasShownWelcome.current = true;
      
      // Timeout to prevent showing too many notifications at once
      setTimeout(() => {
        showNotification({
          type: 'info',
          message: 'Your project will be saved automatically as you work.',
        });
      }, 500);
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
        
        {borrowerProfile && (
          <>
            <div className="mb-6">
              <h2 className="text-lg text-gray-600">
                Your project is created automatically and will auto-save as you work.
              </h2>
            </div>
            
            <EnhancedProjectForm onComplete={handleFormSaved} />
          </>
        )}
      </DashboardLayout>
    </RoleBasedRoute>
  );
}