// src/components/auth/RoleBasedRoute.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useUI } from '../../hooks/useUI';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  roles: ('borrower' | 'advisor' | 'admin')[];
  redirectTo?: string;
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ 
  children, 
  roles, 
  redirectTo = '/login'
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { setLoading, showNotification } = useUI();
  const router = useRouter();
  const [redirected, setRedirected] = useState(false);

  // Update the UI loading state once when the component mounts.
  // This effect will run only once.
  useEffect(() => {
    setLoading(isLoading);
    // We intentionally leave out isLoading from the dependency array
    // so that we don't trigger repeated updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        if (!redirected) {
          setRedirected(true);
          showNotification({
            type: 'error',
            message: 'Please sign in to access this page',
          });
          router.push(redirectTo);
        }
      } else if (!roles.includes(user?.role || 'borrower')) {
        if (!redirected) {
          setRedirected(true);
          showNotification({
            type: 'error',
            message: 'You do not have permission to access this page',
          });
          // Redirect based on role
          if (user?.role === 'advisor') {
            router.push('/advisor/dashboard');
          } else if (user?.role === 'admin') {
            router.push('/admin/dashboard');
          } else {
            router.push('/dashboard');
          }
        }
      }
    }
  }, [
    isAuthenticated,
    isLoading,
    router,
    showNotification,
    redirected,
    redirectTo,
    roles,
    user,
  ]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !roles.includes(user?.role || 'borrower')) {
    return null;
  }

  return <>{children}</>;
};
