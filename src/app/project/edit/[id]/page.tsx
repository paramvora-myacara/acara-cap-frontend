// src/app/project/edit/[id]/page.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '../../../../components/layout/DashboardLayout';
import { EnhancedProjectForm } from '../../../../components/forms/EnhancedProjectForm';
import { ProtectedRoute } from '../../../../components/auth/ProtectedRoute';
import { useProjects } from '../../../../hooks/useProjects';
import { useUI } from '../../../../hooks/useUI';
import { GlobalToast } from '../../../../components/ui/GlobalToast';
import { ProjectProfile as Project } from '../../../../types/enhanced-types';

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const { getProject, isLoading, autoSaveProject } = useProjects();
  const { showNotification } = useUI();
  const hasCheckedForProject = useRef(false);
  
  // Get project ID from params
  const projectId = params?.id as string;
  
  // Get project data
  const project = getProject(projectId);
  
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
  
  // Redirect if project not found (but only check once)
  useEffect(() => {
    if (!isLoading && !project && !hasCheckedForProject.current) {
      hasCheckedForProject.current = true;
      
      showNotification({
        type: 'error',
        message: 'Project not found',
      });
      
      router.push('/dashboard');
    }
  }, [project, isLoading, router, showNotification]);
  
  // Handle form saved
  const handleFormSaved = (savedProject: Project) => {
    showNotification({
      type: 'success',
      message: 'Project updated successfully',
    });
    router.push(`/project/${savedProject.id}`);
  };
  
  return (
    <ProtectedRoute>
      <DashboardLayout title={project ? `Edit: ${project.name}` : 'Edit Project'}>
        <GlobalToast />
        <div className="mb-6">
          <h2 className="text-lg text-gray-600">
            Your changes will be auto-saved as you work.
          </h2>
        </div>
        {project && (
          <EnhancedProjectForm 
            existingProject={project}  
          />
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}