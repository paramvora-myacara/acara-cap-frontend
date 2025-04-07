// src/components/auth/ProtectedRoute.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useUI } from '../../hooks/useUI';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { setLoading, showNotification } = useUI();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      showNotification({
        type: 'error',
        message: 'Please sign in to access this page',
      });
      router.push('/login');
    }
    
    setLoading(isLoading);
  }, [isAuthenticated, isLoading, router, setLoading, showNotification]);

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