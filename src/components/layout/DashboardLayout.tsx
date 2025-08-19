// src/components/layout/DashboardLayout.tsx
'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, PlusCircle, Home, User, FileText } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';


import { LoadingOverlay } from '../ui/LoadingOverlay';
import { cn } from '../../utils/cn';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  sidebarMinimal?: boolean;
  sidebarLinks?: Array<{
    label: string;
    icon: ReactNode;
    href: string;
  }>;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  sidebarMinimal = false,
  sidebarLinks
}) => {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();

  
  const handleLogout = async () => {
    try {
      await logout();
      console.log('You have been successfully signed out');
      router.push('/');
    } catch (error) {
      console.error('Failed to sign out. Please try again.');
    }
  };

  return (
          <div className="flex h-screen bg-gray-50">
        <LoadingOverlay isLoading={false} />
        
        {/* Sidebar */}
      <div className={cn("bg-white shadow-md", sidebarMinimal ? "w-16" : "w-64")}>
        <div className="p-4 border-b border-gray-200">
          {sidebarMinimal ? (
            <div className="flex justify-center">
              <img 
                src="/CapMatchLogo.png"
                alt="CapMatch"
                className="h-8 w-auto"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-blue-800">CapMatch</h1>
              <p className="text-sm text-gray-500 mt-1">Deal Room™</p>
            </>
          )}
        </div>
        
        <nav className="mt-6 px-4">
          <div className="space-y-1">
            {sidebarLinks ? (
              // Custom sidebar links
              sidebarLinks.map((link, index) => (
                <Link 
                  key={index} 
                  href={link.href} 
                  className={cn(
                    "flex items-center py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-700",
                    sidebarMinimal ? "justify-center px-2" : "px-4"
                  )}
                >
                  <span className={sidebarMinimal ? "" : "mr-3"}>{link.icon}</span>
                  {!sidebarMinimal && <span>{link.label}</span>}
                </Link>
              ))
            ) : (
              // Default sidebar links
              <>
                <Link href="/dashboard" className={cn(
                  "flex items-center py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-700",
                  sidebarMinimal ? "justify-center px-2" : "px-4"
                )}>
                  <Home className={cn("h-5 w-5", sidebarMinimal ? "" : "mr-3")} />
                  {!sidebarMinimal && "Dashboard"}
                </Link>
                <Link href="/project/create" className={cn(
                  "flex items-center py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-700",
                  sidebarMinimal ? "justify-center px-2" : "px-4"
                )}>
                  <PlusCircle className={cn("h-5 w-5", sidebarMinimal ? "" : "mr-3")} />
                  {!sidebarMinimal && "New Project"}
                </Link>
                <Link href="/profile" className={cn(
                  "flex items-center py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-700",
                  sidebarMinimal ? "justify-center px-2" : "px-4"
                )}>
                  <User className={cn("h-5 w-5", sidebarMinimal ? "" : "mr-3")} />
                  {!sidebarMinimal && "My Profile"}
                </Link>
              </>
            )}
          </div>
        </nav>
        
        <div className={cn("absolute bottom-0 w-full p-4 border-t border-gray-200", sidebarMinimal ? "w-16" : "w-64")}>
          {!sidebarMinimal && isAuthenticated && user && (
            <div className="flex items-center mb-4">
              <div className="bg-blue-600 h-8 w-8 rounded-full flex items-center justify-center text-white font-semibold">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3 truncate">
                <p className="text-sm font-medium text-gray-700 truncate">{user.email}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center w-full rounded-md hover:bg-red-50 hover:text-red-700",
              sidebarMinimal 
                ? "justify-center p-2" 
                : "px-4 py-2 text-sm font-medium text-gray-700"
            )}
          >
            <LogOut className={cn("h-5 w-5", sidebarMinimal ? "" : "mr-3")} />
            {!sidebarMinimal && "Sign Out"}
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