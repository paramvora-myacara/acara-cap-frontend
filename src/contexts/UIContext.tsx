// src/contexts/UIContext.tsx
'use client';

import React, { createContext, useState, useCallback, useRef, ReactNode } from 'react';

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
  // Use a ref for the counter so updating it doesn't trigger re-renders
  const notificationCounterRef = useRef(0);

  // Remove a notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== id)
    );
  }, []);

  // Show a notification with a truly unique ID
  const showNotification = useCallback(
    (notification: Omit<Notification, 'id'>) => {
      // Create a truly unique ID using a ref counter so that no state updates occur here.
      const counter = notificationCounterRef.current;
      notificationCounterRef.current = counter + 1;
      const uniqueId = `notification_${Date.now()}_${counter}`;

      const newNotification = { ...notification, id: uniqueId };

      // Remove any duplicate notifications with the same message to prevent clutter
      setNotifications(prev => {
        const filteredNotifications = prev.filter(
          n => n.message !== notification.message
        );
        return [...filteredNotifications, newNotification];
      });

      // Auto-remove notification after duration (default: 5000ms)
      if (notification.duration !== -1) {
        const duration = notification.duration || 5000;
        setTimeout(() => {
          removeNotification(uniqueId);
        }, duration);
      }
    },
    [removeNotification]
  );

  // Show a modal
  const showModal = useCallback((modal: Omit<Modal, 'id'>) => {
    const id = `modal_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;
    setActiveModal({ ...modal, id });
  }, []);

  // Hide the active modal
  const hideModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  // Set loading state
  const setLoadingState = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  return (
    <UIContext.Provider
      value={{
        notifications,
        activeModal,
        isLoading,
        showNotification,
        removeNotification,
        showModal,
        hideModal,
        setLoading: setLoadingState,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};