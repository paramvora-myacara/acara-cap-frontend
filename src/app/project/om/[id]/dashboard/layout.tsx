'use client';

import React from 'react';
import { OMDashboardProvider } from '@/contexts/OMDashboardContext';
import { DashboardShell } from '@/components/om/DashboardShell';
import { useOMDashboard } from '@/contexts/OMDashboardContext';
import { useParams } from 'next/navigation';
import { useProjects } from '@/hooks/useProjects';

// Wrapper component to use the context within the layout
function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
    const { scenario, setScenario } = useOMDashboard();
    const params = useParams();
    const projectId = params?.id as string;
    const { getProject } = useProjects();
    const project = projectId ? getProject(projectId) : null;
    
    if (!project) {
        return <div>Project not found</div>;
    }
    
    return (
        <DashboardShell
            projectId={projectId}
            projectName={project.projectName}
            currentScenario={scenario}
            onScenarioChange={setScenario}
        >
            {children}
        </DashboardShell>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <OMDashboardProvider>
            <DashboardLayoutContent>
                {children}
            </DashboardLayoutContent>
        </OMDashboardProvider>
    );
} 