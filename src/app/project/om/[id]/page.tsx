// src/app/project/om/[id]/page.tsx
'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { RoleBasedRoute } from '@/components/auth/RoleBasedRoute'; // Optional: Protect OM page?
import { OfferingMemorandum } from '@/components/om/OfferingMemorandum';
import { useProjects } from '@/hooks/useProjects';
import { useBorrowerProfile } from '@/hooks/useBorrowerProfile';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Basic layout for OM page (no sidebar needed)
const OMLayout: React.FC<{ children: React.ReactNode, title?: string, projectId?: string }> = ({ children, title = "Offering Memorandum", projectId }) => {
    const router = useRouter();
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white p-4 md:p-8 print:p-0 print:bg-white">
            <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-6 md:p-10 print:shadow-none print:p-0">
                 {/* Header for screen view */}
                <div className="flex justify-between items-center mb-6 print:hidden">
                    <div>
                        {projectId && (
                            <Button variant="outline" size="sm" onClick={() => router.push(`/project/workspace/${projectId}`)} className="mr-4">
                                <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Project
                            </Button>
                        )}
                         <h1 className="text-2xl md:text-3xl font-bold text-gray-800 inline-block align-middle">{title}</h1>
                    </div>
                     <Button onClick={() => window.print()} variant="default" size="sm">
                        Print / Save PDF
                    </Button>
                </div>
                 {/* OM Content */}
                {children}
            </div>
        </div>
    );
};


export default function OfferingMemorandumPage() {
    const params = useParams();
    const projectId = params?.id as string;

    const { getProject, isLoading: projectLoading } = useProjects();
    const { borrowerProfile, isLoading: profileLoading } = useBorrowerProfile(); // Assumes profile is loaded for the logged-in user

    const project = projectId ? getProject(projectId) : null;

    // Determine Title
    const title = project ? `OM: ${project.projectName}` : "Offering Memorandum";

    // Loading State
    if (projectLoading || profileLoading) {
        return (
            <OMLayout title="Loading..." projectId={projectId}>
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            </OMLayout>
        );
    }

    // Not Found State
    if (!project) {
         return (
            <OMLayout title="Error" projectId={projectId}>
                <div className="text-center py-10">
                    <h2 className="text-xl text-red-600 font-semibold">Project Not Found</h2>
                    <p className="text-gray-600 mt-2">The requested project memorandum could not be loaded.</p>
                </div>
            </OMLayout>
        );
    }
     if (!borrowerProfile) {
         return (
            <OMLayout title="Error" projectId={projectId}>
                <div className="text-center py-10">
                    <h2 className="text-xl text-red-600 font-semibold">Borrower Profile Not Found</h2>
                    <p className="text-gray-600 mt-2">Associated borrower profile could not be loaded.</p>
                </div>
            </OMLayout>
        );
    }

    // Render OM (Consider RoleBasedRoute if needed)
    // <RoleBasedRoute roles={['borrower', 'advisor']}> // Example protection
    return (
        <OMLayout title={title} projectId={projectId}>
            <OfferingMemorandum project={project} profile={borrowerProfile} />
        </OMLayout>
    );
    // </RoleBasedRoute>
}