// src/components/ui/GlobalToast.tsx
'use client';

import React from 'react';
import { ToastContainer } from './Toast';
import { useUI } from '../../hooks/useUI';

export const GlobalToast: React.FC = () => {
  const { notifications, removeNotification } = useUI();
  
  return (
    <ToastContainer 
      toasts={notifications.map(notification => ({
        ...notification,
        onClose: removeNotification
      }))} 
    />
  );
};