// src/components/project/ProjectWorkspace.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProjects } from '../../hooks/useProjects';
import { useBorrowerProfile } from '../../hooks/useBorrowerProfile';
import { useUI } from '../../hooks/useUI';
import { ProfileSummaryCard } from './ProfileSummaryCard';
import { EnhancedProjectForm } from '../forms/EnhancedProjectForm';
import { Loader2, FileSpreadsheet } from 'lucide-react'; // Added FileSpreadsheet
import { ProjectProfile } from '@/types/enhanced-types';
import { Button } from '../ui/Button'; // Import Button
import { useAuth } from '@/hooks/useAuth'; // Add this import
import { AskAIProvider } from '../ui/AskAIProvider';
import { ConsolidatedSidebar } from './ConsolidatedSidebar';

interface ProjectWorkspaceProps {
    projectId: string;
}

export const ProjectWorkspace: React.FC<ProjectWorkspaceProps> = ({ projectId }) => {
    const router = useRouter();
    const {
        activeProject, setActiveProject, isLoading: projectsLoading, getProject, updateProject, projects
    } = useProjects();
    const { borrowerProfile, isLoading: profileLoading } = useBorrowerProfile();
    const { user, isLoading: authLoading } = useAuth(); // Add auth loading state
    const { setLoading, showNotification } = useUI();
    
    // State for Ask AI field drop
    const [droppedFieldId, setDroppedFieldId] = useState<string | null>(null);

    // Calculate if we're still in initial loading phase
    const isInitialLoading = authLoading || projectsLoading || (user?.role === 'borrower' && profileLoading);

    // useEffect for loading and setting active project
    useEffect(() => {
        if (!projectId) return;
        
        // Don't proceed if still in initial loading phase
        if (isInitialLoading) {
            setLoading(true);
            return;
        }
        
        // Only check for project existence after initial loading is complete
        if (!activeProject || activeProject.id !== projectId) {
            const projectData = getProject(projectId);
            if (projectData) {
                setActiveProject(projectData);
            } else {
                // Only show error if we're confident the project doesn't exist
                // (not just because we haven't loaded projects yet)
                console.error(`Project ${projectId} not found.`);
                showNotification({ type: 'error', message: 'Project not found.' });
                router.push('/dashboard');
            }
        }
        
        setLoading(false);
    }, [
        projectId,
        activeProject,
        setActiveProject,
        getProject,
        isInitialLoading,
        router,
        showNotification,
        setLoading
    ]);

    // Loading state render - show loading during initial loading or if project doesn't match
    if (isInitialLoading || !activeProject || activeProject.id !== projectId) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600">Loading...</span>
            </div>
        );
    }


     // Handle project update completion (no changes needed)
     const handleProjectUpdateComplete = (updatedProject: ProjectProfile) => { showNotification({ type: 'success', message: `Project "${updatedProject.projectName}" updated.` }); };

    const projectCompleteness = activeProject?.completenessPercent || 0;
    const projectProgressColor = projectCompleteness === 100 ? 'bg-green-600' : 'bg-blue-600';
    const isProjectComplete = projectCompleteness === 100; // Check if project is complete

    return (
        <div className="space-y-6">
            <ProfileSummaryCard profile={borrowerProfile} isLoading={profileLoading} />

            {/* Section for OM Link - Only show if project is complete */}
            {isProjectComplete && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center justify-between shadow-sm">
                    <div>
                        <h3 className="text-base font-semibold text-green-800">Project Ready!</h3>
                        <p className="text-sm text-green-700">This project profile is complete. You can view the generated Offering Memorandum.</p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/project/om/${projectId}`)}
                        className="border-green-300 text-green-700 hover:bg-green-100 hover:border-green-400 px-6 py-3 text-base font-medium"
                    >
                        <FileSpreadsheet className="mr-2 h-5 w-5" />
                        View OM
                    </Button>
                </div>
            )}


            <AskAIProvider onFieldAskAI={(fieldId: string) => {
              setDroppedFieldId(fieldId);
            }}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Project Form */}
                  <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow-sm border border-gray-200 max-h-[calc(100vh-200px)] overflow-hidden flex flex-col">
                       <div className="mb-4 border-b pb-3 flex-shrink-0">
                          <div className="flex justify-between items-center mb-1">
                              <h2 className="text-lg font-semibold text-gray-800">Project Resume</h2>
                              <span className={`text-sm font-semibold ${projectCompleteness === 100 ? 'text-green-600' : 'text-blue-600'}`}>{projectCompleteness}% Complete</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2"><div className={`h-2 rounded-full transition-all duration-500 ${projectProgressColor}`} style={{ width: `${projectCompleteness}%` }} /></div>
                      </div>
                      <div className="flex-1 overflow-y-auto">
                        <EnhancedProjectForm 
                          existingProject={activeProject} 
                          onComplete={handleProjectUpdateComplete}
                          onAskAI={(fieldId) => setDroppedFieldId(fieldId)}
                        />
                      </div>
                  </div>

                  {/* Right Column: Consolidated Sidebar */}
                  <div className="h-[calc(100vh-200px)]">
                      <ConsolidatedSidebar 
                        projectId={activeProject.id} 
                        formData={activeProject} 
                        droppedFieldId={droppedFieldId}
                        onFieldProcessed={() => {
                          setDroppedFieldId(null);
                        }}
                      />
                  </div>
              </div>
            </AskAIProvider>
        </div>
    );
};