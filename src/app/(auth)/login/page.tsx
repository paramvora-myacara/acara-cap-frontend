// src/app/(auth)/login/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthLayout from '../../../../components/layout/AuthLayout';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import Typography from '../../../../components/common/Typography';
import { Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Check if user is coming from lender selection
  useEffect(() => {
    const formData = localStorage.getItem('lastFormData');
    if (formData) {
      // We'll use this data later when creating a project
      console.log('Form data available from previous selection');
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Store user email in localStorage
      localStorage.setItem('userEmail', email);
      
      // Check if user has existing projects
      const projectsStr = localStorage.getItem('userProjects');
      const hasExistingProjects = projectsStr ? JSON.parse(projectsStr).length > 0 : false;
      
      // If user has projects, redirect to dashboard, otherwise to new project
      if (hasExistingProjects) {
        router.push('/dashboard');
      } else {
        router.push('/project/create');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden transform transition-all hover:scale-[1.01] duration-300">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6" />
              <h2 className="text-2xl font-bold">Welcome to ACARA-Cap</h2>
            </div>
            <p className="mt-2 opacity-90">Connect with the perfect lender for your project</p>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Sign In</h3>
              <p className="text-gray-600 text-sm mt-1">
                Enter your email to access your lender matches and project dashboard
              </p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                  required
                />
                {error && (
                  <p className="mt-1 text-sm text-red-600">{error}</p>
                )}
              </div>
              
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Continue'}
              </Button>
              
              <p className="text-center text-xs text-gray-500 mt-4">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}