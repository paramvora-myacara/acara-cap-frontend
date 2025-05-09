// src/app/(auth)/login/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { useUI } from '../../../hooks/useUI';
import AuthLayout from '../../../components/layout/AuthLayout';
import { Form, FormGroup } from '../../../components/ui/Form';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Sparkles, Mail } from 'lucide-react';
import { GlobalToast } from '../../../components/ui/GlobalToast';
import { LoadingOverlay } from '../../../components/ui/LoadingOverlay';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { login, isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { showNotification, setLoading } = useUI();
  const router = useRouter();

  useEffect(() => {
    // Check if user is coming from LenderLine
    const lastFormData = localStorage.getItem('lastFormData');
    if (lastFormData) {
      localStorage.setItem('cameFromLenderLine', 'true');
    }
  }, []);

  // Check for existing user session
  useEffect(() => {
    if (isAuthenticated) {
      // Redirect based on user role
      if (user?.role === 'advisor') {
        router.push('/advisor/dashboard');
      } else {
        // For borrowers, check if they have any projects
        const hasProjects = localStorage.getItem('acara_projects');
        const cameFromLenderLine = localStorage.getItem('cameFromLenderLine');
        
        if (cameFromLenderLine || !hasProjects) {
          // First-time user or coming from LenderLine - create a new project
          router.push('/project/create');
        } else {
          router.push('/dashboard');
        }
      }
    }
  }, [isAuthenticated, router, user]);

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
      
      // Detect if this should be an advisor login based on email
      const isAdvisor = email.includes('advisor') || email.endsWith('@acaracap.com');
      const role = isAdvisor ? 'advisor' : 'borrower';
      
      await login(email, role);
      
      showNotification({
        type: 'success',
        message: 'Successfully signed in!',
      });
      
      // Redirection will be handled by the useEffect above
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
              <h2 className="text-2xl font-bold">ACARA-Cap Deal Room™</h2>
            </div>
            <p className="mt-2 opacity-90">Sign in to access your projects and lender matches</p>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Sign In</h3>
              <p className="text-gray-600 text-sm mt-1">
                Enter your email to access the platform
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
              
              <div className="text-sm text-gray-500 mt-2">
                <p>
                  <strong>Demo account options:</strong>
                </p>
                <ul className="mt-1 space-y-1">
                  <li>Borrower (100% complete): <span className="text-blue-600">complete@example.com</span></li>
                  <li>Borrower (50% complete): <span className="text-blue-600">partial@example.com</span></li>
                  <li>New Borrower: <span className="text-blue-600">borrower@example.com</span></li>
                  <li>Advisor: <span className="text-blue-600">advisor@acaracap.com</span></li>
                </ul>
              </div>
              
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