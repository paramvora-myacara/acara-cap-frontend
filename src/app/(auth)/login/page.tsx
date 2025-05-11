// src/app/(auth)/login/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // Import useSearchParams
import { useAuth } from '../../../hooks/useAuth';
import { useUI } from '../../../hooks/useUI';
import AuthLayout from '../../../components/layout/AuthLayout';
<<<<<<< HEAD
import { Form, FormGroup } from '../../../components/ui/Form'; // Removed unused FormLabel, FormHelperText
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Sparkles, Mail } from 'lucide-react'; // Removed Lock icon as it's not used
=======
import { Form, FormGroup } from '../../../components/ui/Form';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Sparkles, Mail } from 'lucide-react';
>>>>>>> 12a0c30c3463db3600051d26b5cd6aaf2e2f7ee3
import { GlobalToast } from '../../../components/ui/GlobalToast';
import { LoadingOverlay } from '../../../components/ui/LoadingOverlay';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { login, isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { showNotification, setLoading } = useUI();
  const router = useRouter();
  const searchParams = useSearchParams(); // Hook to read query parameters

<<<<<<< HEAD
  const [loginSource, setLoginSource] = useState<'direct' | 'lenderline'>('direct');

  // Determine login source from query parameter on mount
=======
  useEffect(() => {
    // Check if user is coming from LenderLine
    const lastFormData = localStorage.getItem('lastFormData');
    if (lastFormData) {
      localStorage.setItem('cameFromLenderLine', 'true');
    }
  }, []);

  // Check for existing user session
>>>>>>> 12a0c30c3463db3600051d26b5cd6aaf2e2f7ee3
  useEffect(() => {
    const sourceParam = searchParams.get('from');
    if (sourceParam === 'lenderline') {
      setLoginSource('lenderline');
      console.log("Login source detected: lenderline"); // Log for debugging
    } else {
        setLoginSource('direct');
         console.log("Login source detected: direct"); // Log for debugging
    }
  }, [searchParams]);


  // Check for existing user session (no change needed here)
  useEffect(() => {
    if (isAuthenticated && user) { // Added check for user object
      // Redirect based on user role
<<<<<<< HEAD
      if (user.role === 'advisor') {
        router.push('/advisor/dashboard'); // Assuming this route exists or will exist
      } else if (user.role === 'admin') {
        router.push('/admin/dashboard'); // Assuming this route exists or will exist
      } else {
         // For borrowers, the redirection logic will now be handled post-login
         // based on AuthContext/Dashboard logic, so just push to dashboard initially.
        router.push('/dashboard');
=======
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
>>>>>>> 12a0c30c3463db3600051d26b5cd6aaf2e2f7ee3
      }
    }
  }, [isAuthenticated, router, user]);

<<<<<<< HEAD

  // Update loading state (no change needed here)
=======
  // Update loading state
>>>>>>> 12a0c30c3463db3600051d26b5cd6aaf2e2f7ee3
  useEffect(() => {
    setLoading(authLoading);
  }, [authLoading, setLoading]);

<<<<<<< HEAD

  // --- Updated handleLogin function ---
=======
>>>>>>> 12a0c30c3463db3600051d26b5cd6aaf2e2f7ee3
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

      // Detect role (as before)
      const isAdvisor = email.includes('advisor') || email.endsWith('@acaracap.com');
      const isAdmin = email.includes('admin@acaracap.com'); // Example admin rule
      const role: 'borrower' | 'advisor' | 'admin' = isAdmin ? 'admin' : isAdvisor ? 'advisor' : 'borrower';

      // Call login with the CORRECT arguments: email, source, role
      await login(email, loginSource, role);

      showNotification({
        type: 'success',
        message: 'Successfully signed in!',
      });
<<<<<<< HEAD

      // --- Redirection Logic ---
      // The AuthContext now handles seeding data.
      // The Dashboard page will handle the logic of where to send the user next
      // (either dashboard itself or project workspace).
      // So, always redirect non-borrowers to their specific dashboards,
      // and borrowers *always* go to /dashboard first.
      if (role === 'advisor') {
        router.push('/advisor/dashboard'); // Make sure this route exists
      } else if (role === 'admin') {
        router.push('/admin/dashboard'); // Make sure this route exists
      } else {
        // Borrowers always go to /dashboard, which will decide the next step
        router.push('/dashboard');
      }

=======
      
      // Redirection will be handled by the useEffect above
>>>>>>> 12a0c30c3463db3600051d26b5cd6aaf2e2f7ee3
    } catch (err) {
       console.error("Login Error:", err); // Log the actual error
      showNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'An error occurred during login. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* LoadingOverlay and GlobalToast moved inside AuthLayout if not already */}
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

              {/* Updated Test Account Info */}
              <div className="text-sm text-gray-500 mt-2 p-3 bg-gray-50 rounded border border-gray-200">
                <p className="font-medium mb-1">
                  <strong>Test account options:</strong>
                </p>
<<<<<<< HEAD
                <ul className="mt-1 space-y-1 list-disc list-inside">
                  <li>Borrower 1 (Full Profile): <code className="text-blue-600 text-xs bg-blue-50 px-1 rounded">borrower1@example.com</code></li>
                  <li>Borrower 2 (Partial Profile): <code className="text-blue-600 text-xs bg-blue-50 px-1 rounded">borrower2@example.com</code></li>
                  <li>New Borrower: <code className="text-blue-600 text-xs bg-blue-50 px-1 rounded">borrower3@example.com</code></li>
                  <li>Advisor: <code className="text-purple-600 text-xs bg-purple-50 px-1 rounded">advisor@acaracap.com</code></li>
                   {/* Add other roles if needed */}
=======
                <ul className="mt-1 space-y-1">
                  <li>Borrower (100% complete): <span className="text-blue-600">complete@example.com</span></li>
                  <li>Borrower (50% complete): <span className="text-blue-600">partial@example.com</span></li>
                  <li>New Borrower: <span className="text-blue-600">borrower@example.com</span></li>
                  <li>Advisor: <span className="text-blue-600">advisor@acaracap.com</span></li>
>>>>>>> 12a0c30c3463db3600051d26b5cd6aaf2e2f7ee3
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