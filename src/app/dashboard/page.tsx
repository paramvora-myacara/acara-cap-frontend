// src/app/dashboard/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RoleBasedRoute } from '../../components/auth/RoleBasedRoute';
import { useProjects } from '../../hooks/useProjects';
import { useBorrowerProfile } from '../../hooks/useBorrowerProfile';
import { useAuth } from '../../hooks/useAuth'; // Import useAuth for logout
import { useUI } from '../../hooks/useUI';
import { GlobalToast } from '../../components/ui/GlobalToast';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';
import { ProfileSummaryCard } from '../../components/project/ProfileSummaryCard'; // Import Profile Summary
import { ProjectCard } from '../../components/dashboard/ProjectCard'; // Import Project Card
import { Button } from '../../components/ui/Button'; // Import Button
import { PlusCircle, Loader2, Home, Link, FileText, LogOut } from 'lucide-react'; // Added Link, LogOut

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, loginSource, logout } = useAuth(); // Get logout
  const { projects, isLoading: projectsLoading, activeProject, setActiveProject } = useProjects();
  const { borrowerProfile, isLoading: profileLoading } = useBorrowerProfile();
  const { setLoading, isLoading: uiLoading, showNotification } = useUI(); // Get showNotification
  const [isRedirecting, setIsRedirecting] = useState(true); // Start as true until checks complete
  const [hasCheckedForNewUser, setHasCheckedForNewUser] = useState(false);
  const [hasAttemptedRedirect, setHasAttemptedRedirect] = useState(false);

  // Combined loading state check
  const combinedLoading = authLoading || projectsLoading || profileLoading;

  // Control Flow Logic & Loading
  useEffect(() => {
    // Don't run redirect logic until all initial loading is potentially complete
    if (combinedLoading) {
      setLoading(true); // Keep UI loading indicator active
      setIsRedirecting(true); // Assume redirect might happen until loaded
      return;
    }

    // Once core contexts are loaded
    setLoading(false);
    console.log(`Dashboard: Contexts loaded. User: ${user?.role}, Projects: ${projects.length}, Profile: ${!!borrowerProfile}`);

    // Check if this is a new borrower who needs to be redirected to their project
    if (user?.role === 'borrower' && !hasCheckedForNewUser) {
      setHasCheckedForNewUser(true);
      console.log(`Dashboard: Checking new borrower status. Projects count: ${projects.length}`);
      
      // If no projects exist yet, wait for auto-creation and then redirect
      if (projects.length === 0) {
        console.log('Dashboard: New borrower detected, waiting for project creation...');
        waitForProjectCreation();
        return;
      } else if (projects.length === 1) {
        // If they already have exactly one project, redirect to it
        const targetProject = projects[0];
        console.log(`Dashboard: Existing borrower with single project, redirecting to: ${targetProject.id}`);
        setIsRedirecting(true);
        setHasAttemptedRedirect(true);
        router.replace(`/project/workspace/${targetProject.id}`);
        return;
      } else {
        console.log(`Dashboard: Borrower has ${projects.length} projects, staying on dashboard for selection`);
      }
      // If they have multiple projects, stay on dashboard to let them choose
    }

    // Handle lenderline redirects
    const needsLenderlineRedirect = user?.role === 'borrower' && loginSource === 'lenderline';
    if (needsLenderlineRedirect) {
      let targetProjectId: string | null = null;

      if (loginSource === 'lenderline') {
        const sortedProjects = [...projects].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (sortedProjects.length > 0) targetProjectId = sortedProjects[0].id;
        console.log(`Dashboard: Redirecting from LenderLine to newest project: ${targetProjectId}`);
      }

      if (targetProjectId) {
        console.log(`Dashboard: Performing redirect to /project/workspace/${targetProjectId}`);
        setIsRedirecting(true);
        router.replace(`/project/workspace/${targetProjectId}`);
      } else {
        console.warn("Dashboard: Cannot determine target project ID for redirect. Staying on dashboard.");
        setIsRedirecting(false);
      }
    } else {
      setIsRedirecting(false);
      console.log("Dashboard: Rendering dashboard content.");
    }

  }, [user, combinedLoading, projects, loginSource, router, setLoading, hasCheckedForNewUser, borrowerProfile]);

  // Additional effect to watch for project creation
  useEffect(() => {
    if (user?.role === 'borrower' && hasCheckedForNewUser && projects.length === 1 && !hasAttemptedRedirect) {
      console.log('Dashboard: Project detected after initial check, redirecting now...');
      const targetProject = projects[0];
      setIsRedirecting(true);
      setHasAttemptedRedirect(true);
      router.replace(`/project/workspace/${targetProject.id}`);
    }
  }, [projects, user, hasCheckedForNewUser, hasAttemptedRedirect, router]);

  // Wait for project creation and redirect to project workspace
  const waitForProjectCreation = async () => {
    try {
      console.log('Dashboard: Starting to wait for project creation...');
      let attempts = 0;
      const maxAttempts = 40; // 20 seconds max wait
      
      while (attempts < maxAttempts) {
        // Check if we have a project
        if (projects.length > 0) {
          const targetProject = projects[0]; // Get the first/only project
          console.log(`Dashboard: Project created! Redirecting to project workspace: ${targetProject.id}`);
          setIsRedirecting(true);
          router.replace(`/project/workspace/${targetProject.id}`);
          return;
        }
        
        console.log(`Dashboard: Waiting for project creation... attempt ${attempts + 1}/${maxAttempts}`);
        // Wait a bit and try again
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
      }
      
      // If we still don't have a project after waiting, show a message and let user manually navigate
      console.warn('Dashboard: Project creation timeout, showing manual navigation option');
      setIsRedirecting(false);
      showNotification({
        type: 'warning',
        message: 'Project creation is taking longer than expected. You can manually navigate to your project once it appears.',
      });
      
    } catch (error) {
      console.error('Dashboard: Error waiting for project creation:', error);
      setIsRedirecting(false);
    }
  };

  // Manual navigation to project (fallback)
  const navigateToProject = () => {
    if (projects.length > 0) {
      const targetProject = projects[0];
      router.push(`/project/workspace/${targetProject.id}`);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await logout();
      showNotification({ type: 'success', message: 'Signed out successfully.' });
      router.push('/login'); // Redirect to login after logout
    } catch (error) {
      showNotification({ type: 'error', message: 'Logout failed. Please try again.' });
    }
  };

  // --- Render Logic ---
  if (combinedLoading || isRedirecting) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <LoadingOverlay />
         <div className="flex flex-col items-center text-gray-600">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <span>Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <RoleBasedRoute roles={['borrower']}>
       <div className="min-h-screen bg-gray-50">
           <LoadingOverlay />
           <GlobalToast />
            {/* Header with Sign Out button */}
           <header className="bg-white shadow-sm sticky top-0 z-10">
               <div className="container mx-auto py-3 px-4 md:px-6 flex justify-between items-center">
                  <Link href="/" className="flex items-center space-x-2">
                       {/* Use full logo or icon based on preference */}
                       <img
                         src="/CapMatchLogo.png"
                         alt="CapMatch Logo"
                         className="h-8"
                         onError={(e)=>(e.target as HTMLImageElement).style.display='none'}
                       />
                       {/* <span className="text-lg font-bold text-blue-800">CapMatch Dashboard</span> */}
                   </Link>
                   {/* *** UPDATED BUTTON *** */}
                    <Button variant="outline" size="sm" onClick={handleLogout} className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400">
                         <LogOut className="mr-1.5 h-4 w-4" />
                         Sign Out
                    </Button>
               </div>
           </header>

           {/* Page Content */}
           <main className="container mx-auto p-4 md:p-6 space-y-6">
               <ProfileSummaryCard profile={borrowerProfile} isLoading={profileLoading} />
               
               {/* Manual Navigation Button for New Users */}
               {projects.length === 1 && (
                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                   <div className="flex items-center justify-between">
                     <div>
                       <h3 className="text-sm font-medium text-blue-800">Welcome to CapMatch!</h3>
                       <p className="text-sm text-blue-600 mt-1">Your project has been created. Click below to get started.</p>
                     </div>
                     <Button 
                       variant="primary" 
                       size="sm"
                       onClick={navigateToProject}
                       className="bg-blue-600 hover:bg-blue-700"
                     >
                       Go to Project
                     </Button>
                   </div>
                 </div>
               )}
               
               <div className="flex justify-between items-center mt-8 mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800">My Projects</h2>
                    <Button variant="primary" leftIcon={<Home size={16} />} onClick={() => router.push('/')}> Find New Lenders (LenderLine™) </Button>
               </div>
               {projects.length > 0 ? (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {projects.map((project) => ( <ProjectCard key={project.id} project={project} /> ))}
                   </div>
               ) : (
                   <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                       <FileText className="mx-auto h-12 w-12 text-gray-400" />
                       <h3 className="mt-2 text-lg font-medium text-gray-900">No Projects Found</h3>
                       <p className="mt-1 text-sm text-gray-500">Start by finding lenders on the homepage.</p>
                       <div className="mt-6">
                           <Button variant="primary" leftIcon={<Home size={16} />} onClick={() => router.push('/')}> Go to LenderLine™ </Button>
                       </div>
                   </div>
               )}
           </main>
            <footer className="text-center py-4 mt-8 text-xs text-gray-500 border-t">
              © {new Date().getFullYear()} CapMatch Platform
            </footer>
       </div>
    </RoleBasedRoute>
  );
}