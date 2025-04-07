// src/app/(auth)/login/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { useUI } from '../../../hooks/useUI';
import AuthLayout from '../../../components/layout/AuthLayout';
import { Form, FormGroup, FormLabel, FormHelperText } from '../../../components/ui/Form';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Sparkles, Mail } from 'lucide-react';
import { GlobalToast } from '../../../components/ui/GlobalToast';
import { LoadingOverlay } from '../../../components/ui/LoadingOverlay';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const { showNotification, setLoading } = useUI();
  const router = useRouter();

  // Check for existing user session
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Check if user is coming from lender selection
  useEffect(() => {
    const formData = localStorage.getItem('lastFormData');
    if (formData) {
      // We'll use this data later when creating a project
      console.log('Form data available from previous selection');
    }
  }, []);

  // Update loading state
  useEffect(() => {
    setLoading(authLoading);
  }, [authLoading, setLoading]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      await login(email);
      
      showNotification({
        type: 'success',
        message: 'Successfully signed in!',
      });
      
      // Redirect to dashboard or project creation based on existing projects
      const projectsStr = localStorage.getItem('acara_userProjects');
      const hasExistingProjects = projectsStr ? JSON.parse(projectsStr).length > 0 : false;
      
      if (hasExistingProjects) {
        router.push('/dashboard');
      } else {
        router.push('/project/create');
      }
    } catch (err) {
      showNotification({
        type: 'error',
        message: 'An error occurred. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <LoadingOverlay />
      <GlobalToast />
      
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
            
            <Form onSubmit={handleLogin} className="space-y-4">
              <FormGroup>
                <Input
                  id="email"
                  type="email"
                  label="Email Address"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={validationError || undefined}
                  leftIcon={<Mail className="h-5 w-5 text-gray-400" />}
                  required
                />
              </FormGroup>
              
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={authLoading}
              >
                Continue
              </Button>
              
              <p className="text-center text-xs text-gray-500 mt-4">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </Form>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}