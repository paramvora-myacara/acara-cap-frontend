// src/components/auth/ProtectedRoute.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';


interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  const router = useRouter();
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    // Only set loading state once when component mounts

    
    // Only redirect and show notification once
    if (!isLoading && !isAuthenticated && !redirected) {
      setRedirected(true); // Mark that we've already tried to redirect
      
      // Show notification only once
              console.error('Please sign in to access this page');
      
      // Redirect to login page
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router, redirected]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};