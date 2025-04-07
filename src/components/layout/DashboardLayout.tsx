// src/components/layout/DashboardLayout.tsx
'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { LogOut, PlusCircle, BarChart, User, FileText, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useUI } from '../../hooks/useUI';
import { GlobalToast } from '../ui/GlobalToast';
import { LoadingOverlay } from '../ui/LoadingOverlay';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const { showNotification } = useUI();
  
  const handleLogout = async () => {
    try {
      await logout();
      showNotification({
        type: 'success',
        message: 'You have been successfully signed out',
      });
      router.push('/');
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Failed to sign out. Please try again.',
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <LoadingOverlay />
      <GlobalToast />
      
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-800">ACARA-Cap</h1>
          <p className="text-sm text-gray-500 mt-1">Lender Matching Platform</p>
        </div>
        
        <nav className="mt-6 px-4">
          <div className="space-y-1">
            <Link href="/dashboard" className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-700">
              <Home className="mr-3 h-5 w-5" />
              Dashboard
            </Link>
            <Link href="/project/create" className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-700">
              <PlusCircle className="mr-3 h-5 w-5" />
              New Project
            </Link>
            <Link href="/dashboard/profile" className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-700">
              <User className="mr-3 h-5 w-5" />
              My Profile
            </Link>
            <Link href="/" className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-700">
              <BarChart className="mr-3 h-5 w-5" />
              Find Lenders
            </Link>
          </div>
        </nav>
        
        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
          <div className="flex items-center mb-4">
            {isAuthenticated && user ? (
              <>
                <div className="bg-blue-600 h-8 w-8 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3 truncate">
                  <p className="text-sm font-medium text-gray-700 truncate">{user.email}</p>
                  <p className="text-xs text-gray-500">Borrower</p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-gray-200 h-8 w-8 rounded-full flex items-center justify-center text-gray-500 font-semibold">
                  ?
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">Not signed in</p>
                  <p className="text-xs text-gray-500">Borrower</p>
                </div>
              </>
            )}
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm">
          <div className="py-4 px-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
          </div>
        </header>
        
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;