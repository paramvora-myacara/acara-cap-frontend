// src/components/ui/SubtleLoadingIndicator.tsx
'use client';

import React from 'react';
import { useUI } from '../../hooks/useUI';
import { cn } from '../../utils/cn';

interface SubtleLoadingIndicatorProps {
  className?: string;
}

export const SubtleLoadingIndicator: React.FC<SubtleLoadingIndicatorProps> = ({ 
  className 
}) => {
  const { isLoading } = useUI();

  if (!isLoading) return null;

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 h-1 bg-blue-600 z-50",
      "animate-pulse",
      className
    )}>
      <div className="absolute top-0 left-0 bottom-0 right-0 bg-blue-500 animate-progress" />
    </div>
  );
};

// Add this to your globals.css file
/*
@keyframes progress {
  0% {
    width: 0%;
    left: 0;
  }
  50% {
    width: 30%;
    left: 30%;
  }
  100% {
    width: 0%;
    left: 100%;
  }
}

.animate-progress {
  animation: progress 1.5s ease-in-out infinite;
}
*/