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
import { Card, CardContent } from '../../../components/ui/card';

export default function CreateProjectPage() {
  const router = useRouter();
  const { showNotification } = useUI();
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

  return (
    <RoleBasedRoute roles={['borrower']}>
      <DashboardLayout title="New Project">
        <GlobalToast />
        
        {profileIncomplete && (
          <Card className="mb-6 bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <p className="text-amber-800">
                <strong>Complete your borrower profile</strong> to help us match you with the right lenders.
              </p>
            </CardContent>
          </Card>
        )}
        
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