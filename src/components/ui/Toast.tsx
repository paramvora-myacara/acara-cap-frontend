// src/components/ui/Toast.tsx
import React, { useEffect, useState } from 'react';
import { XCircle, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ToastProps {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  onClose: (id: string) => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  message,
  onClose,
  duration = 5000,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const animateIn = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Auto-close after duration
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300); // Wait for animation before removing
    }, duration);

    return () => {
      clearTimeout(animateIn);
      clearTimeout(timer);
    };
  }, [id, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getToastClasses = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div
      className={cn(
        'fixed right-4 flex items-center p-4 mb-4 rounded-lg shadow-md border transition-all duration-300 transform',
        getToastClasses(),
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
      style={{ maxWidth: '24rem' }}
    >
      <div className="flex items-center">
        <div className="mr-3">{getIcon()}</div>
        <div className="text-sm font-medium">{message}</div>
      </div>
      <button
        type="button"
        className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 text-gray-500 hover:bg-gray-100"
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose(id), 300);
        }}
      >
        <span className="sr-only">Close</span>
        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
        </svg>
      </button>
    </div>
  );
};

export const ToastContainer: React.FC<{ toasts: ToastProps[] }> = ({ toasts }) => {
  // Make a copy of the notifications array with guaranteed unique IDs
  const processedToasts = React.useMemo(() => {
    // Create a map by ID to ensure uniqueness
    const uniqueToastsMap = new Map<string, ToastProps>();
    
    // Process each toast to ensure uniqueness
    toasts.forEach(toast => {
      // Add a suffix to the ID if needed to make it unique
      let uniqueId = toast.id;
      let counter = 0;
      
      // Keep incrementing the counter until we find a unique ID
      while (uniqueToastsMap.has(uniqueId)) {
        counter++;
        uniqueId = `${toast.id}_${counter}`;
      }
      
      // Store the toast with its unique ID
      uniqueToastsMap.set(uniqueId, {
        ...toast,
        id: uniqueId
      });
    });
    
    // Convert the map back to an array
    return Array.from(uniqueToastsMap.values());
  }, [toasts]);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
      {processedToasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
};