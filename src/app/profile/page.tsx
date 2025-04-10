// src/app/profile/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RoleBasedRoute } from '../../components/auth/RoleBasedRoute';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { BorrowerProfileForm } from '../../components/forms/BorrowerProfileForm';
import { GlobalToast } from '../../components/ui/GlobalToast';
import { useBorrowerProfile } from '../../hooks/useBorrowerProfile';
import { useUI } from '../../hooks/useUI';
import { BorrowerProfile } from '../../types/enhanced-types';

export default function ProfilePage() {
  const router = useRouter();
  const { borrowerProfile, isLoading } = useBorrowerProfile();
  const { showNotification, setLoading } = useUI();
  
  // Update loading state
  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);
  
  // Handle profile completion
  const handleProfileComplete = (profile: BorrowerProfile) => {
    showNotification({
      type: 'success',
      message: 'Profile saved successfully',
    });
    
    router.push('/dashboard');
  };
  
  return (
    <RoleBasedRoute roles={['borrower']}>
      <DashboardLayout title={borrowerProfile ? "Update Borrower Profile" : "Create Borrower Profile"}>
        <GlobalToast />
        
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <p className="text-gray-600">
              Your borrower profile is used across all your projects. Complete it thoroughly to help match you with appropriate lenders.
            </p>
          </div>
          
          <BorrowerProfileForm onComplete={handleProfileComplete} />
        </div>
      </DashboardLayout>
    </RoleBasedRoute>
  );
}