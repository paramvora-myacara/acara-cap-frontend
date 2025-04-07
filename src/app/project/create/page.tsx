// src/app/project/create/page.tsx
'use client';

import React from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { ProjectForm } from '../../../components/forms/ProjectForm';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';
import { GlobalToast } from '../../../components/ui/GlobalToast';
import { LoadingOverlay } from '../../../components/ui/LoadingOverlay';

export default function CreateProjectPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout title="Create New Project">
        <LoadingOverlay />
        <GlobalToast />
        <ProjectForm />
      </DashboardLayout>
    </ProtectedRoute>
  );
}