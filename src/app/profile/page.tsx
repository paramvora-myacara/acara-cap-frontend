// src/app/profile/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RoleBasedRoute } from '../../components/auth/RoleBasedRoute';
// *** CORRECTED IMPORT ***
import MinimalSidebarLayout from '../../components/layout/MinimalSidebarLayout';
import { BorrowerProfileForm } from '../../components/forms/BorrowerProfileForm';
import { GlobalToast } from '../../components/ui/GlobalToast';
import { useBorrowerProfile } from '../../hooks/useBorrowerProfile';
import { useUI } from '../../hooks/useUI';
import { BorrowerProfile } from '../../types/enhanced-types';
import { Loader2 } from 'lucide-react';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay'; // Import LoadingOverlay

export default function ProfilePage() {
  const router = useRouter();
  // Use context hook, providing a fallback empty object if context is not ready
  const { borrowerProfile, isLoading: profileLoading } = useBorrowerProfile() || { borrowerProfile: null, isLoading: true };
  const { showNotification, setLoading, isLoading: uiLoading } = useUI();

  // Update loading state based on profile loading
  useEffect(() => {
    setLoading(profileLoading || uiLoading); // Combine loading states
  }, [profileLoading, uiLoading, setLoading]);

  // Handle profile completion from the form's onComplete callback
  const handleProfileComplete = (profile: BorrowerProfile | null) => { // Allow null profile
    // Only show success if a profile was actually returned/saved
    if (profile) {
        showNotification({ type: 'success', message: 'Profile saved successfully' });
    } else {
         showNotification({ type: 'warning', message: 'Profile update process completed.' });
    }
    // Navigate back to the dashboard after saving attempt
    router.push('/dashboard');
  };

  return (
    <RoleBasedRoute roles={['borrower']}>
      {/* *** USE CORRECT LAYOUT *** */}
      <MinimalSidebarLayout title={borrowerProfile ? "Update Borrower Profile" : "Create Borrower Profile"}>
        <GlobalToast />
        <LoadingOverlay /> {/* Display loading overlay based on UI context */}

        {profileLoading ? ( // Check profile specific loading state
             <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600">Loading Profile...</span>
            </div>
        ) : (
             <div className="max-w-5xl mx-auto">
                <div className="mb-6 p-4 bg-white rounded shadow-sm border">
                    <p className="text-gray-600">
                    Your borrower profile is used across all your projects. Complete it thoroughly to help match you with appropriate lenders. Changes are auto-saved.
                    </p>
                </div>
                {/* Pass the completion handler */}
                <BorrowerProfileForm onComplete={handleProfileComplete} />
            </div>
        )}

      </MinimalSidebarLayout>
    </RoleBasedRoute>
  );
}