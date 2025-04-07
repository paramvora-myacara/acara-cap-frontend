// src/app/project/edit/[id]/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '../../../../components/layout/DashboardLayout';
import { ProjectForm } from '../../../../components/forms/ProjectForm';
import { ProtectedRoute } from '../../../../components/auth/ProtectedRoute';
import { useProjects } from '../../../../hooks/useProjects';
import { useUI } from '../../../../hooks/useUI';
import { GlobalToast } from '../../../../components/ui/GlobalToast';
import { LoadingOverlay } from '../../../../components/ui/LoadingOverlay';
import { Project } from '../../../../contexts/ProjectContext';

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const { getProject, isLoading } = useProjects();
  const { showNotification, setLoading } = useUI();
  
  // Get project ID from params
  const projectId = params?.id as string;
  
  // Get project data
  const project = getProject(projectId);
  
  // Update loading state
  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);
  
  // Redirect if project not found
  useEffect(() => {
    if (!isLoading && !project) {
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
        <LoadingOverlay />
        <GlobalToast />
        {project && (
          <ProjectForm 
            existingProject={project} 
            onFormSaved={handleFormSaved} 
          />
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}