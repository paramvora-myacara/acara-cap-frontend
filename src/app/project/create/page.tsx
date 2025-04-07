// src/app/project/create/page.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { ProjectForm } from '../../../components/forms/ProjectForm';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';
import { GlobalToast } from '../../../components/ui/GlobalToast';
import { useUI } from '../../../hooks/useUI';
import { useProjects } from '../../../hooks/useProjects';
import { Project } from '../../../contexts/ProjectContext';

export default function CreateProjectPage() {
  const router = useRouter();
  const { showNotification } = useUI();
  const { autoSaveProject } = useProjects();
  const hasShownWelcome = useRef(false);
  
  // Show welcome message only once
  useEffect(() => {
    if (!hasShownWelcome.current) {
      hasShownWelcome.current = true;
      
      // Timeout to prevent showing too many notifications at once
      setTimeout(() => {
        showNotification({
          type: 'info',
          message: 'Your project will be saved automatically as you work.',
        });
      }, 500);
    }
  }, [showNotification]);
  
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
  const handleFormSaved = (project: Project) => {
    showNotification({
      type: 'success',
      message: 'Project saved successfully',
    });
    
    // Navigate to dashboard after successful save
    router.push('/dashboard');
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="New Project">
        <GlobalToast />
        <div className="mb-6">
          <h2 className="text-lg text-gray-600">
            Your project is created automatically and will auto-save as you work.
          </h2>
        </div>
        <ProjectForm onFormSaved={handleFormSaved} />
      </DashboardLayout>
    </ProtectedRoute>
  );
}