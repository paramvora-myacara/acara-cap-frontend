// src/app/(auth)/login/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';

import AuthLayout from '../../../components/layout/AuthLayout';
import { Form, FormGroup } from '../../../components/ui/Form';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Sparkles, Mail } from 'lucide-react';

import { LoadingOverlay } from '../../../components/ui/LoadingOverlay';

// Separate component for login form to handle search params
const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { login, isAuthenticated, isLoading: authLoading, user } = useAuth();

  const router = useRouter();
  const searchParams = useSearchParams();

  const [loginSource, setLoginSource] = useState<'direct' | 'lenderline'>('direct');

  // Determine login source from query parameter on mount
  useEffect(() => {
    const sourceParam = searchParams.get('from');
    if (sourceParam === 'lenderline') {
      setLoginSource('lenderline');
      console.log("Login source detected: lenderline");
    } else {
      setLoginSource('direct');
      console.log("Login source detected: direct");
    }
  }, [searchParams]);

  // Check for existing user session
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'advisor') {
        router.push('/advisor/dashboard');
      } else if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, router, user]);



  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    try {
      const isAdvisor = email.includes('advisor') || email.endsWith('@capmatch.com');
      const isAdmin = email.includes('admin@capmatch.com');
      const role: 'borrower' | 'advisor' | 'admin' = isAdmin ? 'admin' : isAdvisor ? 'advisor' : 'borrower';

      await login(email, loginSource, role);

      console.log('Successfully signed in!');

      if (role === 'advisor') {
        router.push('/advisor/dashboard');
      } else if (role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }

        } catch (err) {
      console.error("Login Error:", err);
      console.error(err instanceof Error ? err.message : 'An error occurred during login. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-xl shadow-xl overflow-hidden transform transition-all hover:scale-[1.01] duration-300">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6" />
            <h2 className="text-2xl font-bold">CapMatch Deal Room™</h2>
          </div>
          <p className="mt-2 opacity-90">Sign in to access your projects and lender matches</p>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Sign In / Sign Up</h3>
            <p className="text-gray-600 text-sm mt-1">
              Enter your email to continue
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

            {/* Quick Login Buttons */}
            <div className="space-y-3">
              <div className="flex space-x-3 justify-center">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 max-w-[calc(50%-6px)] h-12"
                  onClick={async () => {
                    try {
                      const role: 'borrower' = 'borrower';
                      await login('borrower1@example.com', loginSource, role);
                      
                      console.log('Successfully signed in!');
                      
                      router.push('/dashboard');
                    } catch (err) {
                      console.error("Login Error:", err);
                      console.error(err instanceof Error ? err.message : 'An error occurred during login. Please try again.');
                    }
                  }}
                  disabled={authLoading}
                >
                  {authLoading ? 'Signing in...' : 'borrower1@example.com'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 max-w-[calc(50%-6px)] h-12"
                  onClick={async () => {
                    try {
                      const role: 'borrower' = 'borrower';
                      await login('borrower2@example.com', loginSource, role);
                      
                      console.log('Successfully signed in!');
                      
                      router.push('/dashboard');
                    } catch (err) {
                      console.error("Login Error:", err);
                      console.error(err instanceof Error ? err.message : 'An error occurred during login. Please try again.');
                    }
                  }}
                  disabled={authLoading}
                >
                  {authLoading ? 'Signing in...' : 'borrower2@example.com'}
                </Button>
              </div>
              
              <div className="flex space-x-3 text-sm justify-center">
                <div className="flex-1 max-w-[calc(50%-6px)] text-center text-gray-600">
                  Full profile with Live OM
                </div>
                <div className="flex-1 max-w-[calc(50%-6px)] text-center text-gray-600">
                  Partial profile
                </div>
              </div>
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
  );
};

// Main page component with Suspense boundary
export default function LoginPage() {
  return (
    <AuthLayout>
              <LoadingOverlay isLoading={false} />
        <Suspense fallback={<div className="w-full max-w-md">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}