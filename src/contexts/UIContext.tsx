// src/contexts/UIContext.tsx
'use client';

import React, { createContext, useState, useCallback, ReactNode } from 'react';

// Define notification type
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  duration?: number;
}

// Define modal type
export interface Modal {
  id: string;
  component: React.ReactNode;
  props?: Record<string, any>;
}

// Define context interface
interface UIContextProps {
  notifications: Notification[];
  activeModal: Modal | null;
  isLoading: boolean;
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  showModal: (modal: Omit<Modal, 'id'>) => void;
  hideModal: () => void;
  setLoading: (loading: boolean) => void;
}

// Create context with default values
export const UIContext = createContext<UIContextProps>({
  notifications: [],
  activeModal: null,
  isLoading: false,
  showNotification: () => {},
  removeNotification: () => {},
  showModal: () => {},
  hideModal: () => {},
  setLoading: () => {},
});

interface UIProviderProps {
  children: ReactNode;
}

export const UIProvider: React.FC<UIProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeModal, setActiveModal] = useState<Modal | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Show a notification
  const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-remove notification after duration (default: 5000ms)
    if (notification.duration !== -1) {
      const duration = notification.duration || 5000;
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  }, []);

  // Remove a notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Show a modal
  const showModal = useCallback((modal: Omit<Modal, 'id'>) => {
    const id = Date.now().toString();
    setActiveModal({ ...modal, id });
  }, []);

  // Hide the active modal
  const hideModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  // Set loading state
  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  return (
    <UIContext.Provider value={{
      notifications,
      activeModal,
      isLoading,
      showNotification,
      removeNotification,
      showModal,
      hideModal,
      setLoading,
    }}>
      {children}
    </UIContext.Provider>
  );
};