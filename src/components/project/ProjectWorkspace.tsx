// src/components/project/ProjectWorkspace.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProjects } from '../../hooks/useProjects';
import { useBorrowerProfile } from '../../hooks/useBorrowerProfile';
import { useUI } from '../../hooks/useUI';
import { ProfileSummaryCard } from './ProfileSummaryCard';
import { EnhancedProjectForm } from '../forms/EnhancedProjectForm';
import { MessagePanel } from '../dashboard/MessagePanel';
import { Loader2, FileSpreadsheet } from 'lucide-react'; // Added FileSpreadsheet
import { ProjectProfile } from '@/types/enhanced-types';
import { Button } from '../ui/Button'; // Import Button

interface ProjectWorkspaceProps {
    projectId: string;
}

export const ProjectWorkspace: React.FC<ProjectWorkspaceProps> = ({ projectId }) => {
    const router = useRouter();
    const {
        activeProject, setActiveProject, isLoading: projectsLoading, getProject, updateProject
    } = useProjects();
    const { borrowerProfile, isLoading: profileLoading } = useBorrowerProfile();
    const { setLoading, showNotification } = useUI();

    // useEffect for loading and setting active project (no changes needed)
     useEffect(() => { if (projectId && (!activeProject || activeProject.id !== projectId)) { const projectData = getProject(projectId); if (projectData) { setActiveProject(projectData); } else if (!projectsLoading) { console.error(`Project ${projectId} not found.`); showNotification({ type: 'error', message: 'Project not found.' }); router.push('/dashboard'); } } setLoading(projectsLoading || profileLoading); }, [projectId, activeProject, setActiveProject, getProject, projectsLoading, profileLoading, router, showNotification, setLoading]);


     // Handle project update completion (no changes needed)
     const handleProjectUpdateComplete = (updatedProject: ProjectProfile) => { showNotification({ type: 'success', message: `Project "${updatedProject.projectName}" updated.` }); };

    // Loading state render (no changes needed)
    if (projectsLoading || profileLoading || !activeProject || activeProject.id !== projectId) { return ( <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /><span className="ml-3 text-gray-600">Loading...</span></div> ); }

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
                        size="sm"
                        onClick={() => router.push(`/project/om/${projectId}`)}
                        className="border-green-300 text-green-700 hover:bg-green-100 hover:border-green-400"
                    >
                        <FileSpreadsheet className="mr-1.5 h-4 w-4" />
                        View OM
                    </Button>
                </div>
            )}


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Project Form */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                     <div className="mb-4 border-b pb-3">
                        <div className="flex justify-between items-center mb-1">
                            <h2 className="text-lg font-semibold text-gray-800">Project Resume</h2>
                            <span className={`text-sm font-semibold ${projectCompleteness === 100 ? 'text-green-600' : 'text-blue-600'}`}>{projectCompleteness}% Complete</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2"><div className={`h-2 rounded-full transition-all duration-500 ${projectProgressColor}`} style={{ width: `${projectCompleteness}%` }} /></div>
                    </div>
                    <EnhancedProjectForm existingProject={activeProject} onComplete={handleProjectUpdateComplete} />
                </div>

                {/* Right Column: Message Panel */}
                <div className="h-full">
                    <MessagePanel projectId={activeProject.id} />
                </div>
            </div>
        </div>
    );
};