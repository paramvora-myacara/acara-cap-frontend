// components/layout/AuthLayout.tsx

'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { Building } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex flex-col">
      <header className="bg-white shadow-sm p-4">
        <div className="container mx-auto">
          <Link href="/" className="flex items-center">
            <Building className="h-6 w-6 text-blue-600 mr-2" />
            <h1 className="text-xl font-semibold text-blue-800">ACARA-Cap Lender Matching Platform</h1>
          </Link>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
      
      <footer className="bg-white shadow-sm p-4 mt-auto">
        <div className="container mx-auto text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} ACARA-Cap Platform</p>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;