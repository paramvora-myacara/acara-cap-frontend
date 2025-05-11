// src/components/om/KeyValueDisplay.tsx
import React from 'react';
import { cn } from '@/utils/cn';

interface KeyValueDisplayProps {
  label: string;
  value: string | number | null | undefined;
  className?: string;
  isLarge?: boolean; // For prominent values like loan amount
  fullWidth?: boolean; // Span full width in grid
}

export const KeyValueDisplay: React.FC<KeyValueDisplayProps> = ({
  label,
  value,
  className,
  isLarge = false,
  fullWidth = false
}) => {
  const val = value ?? 'N/A'; // Handle null/undefined

  return (
    <div className={cn(
        "py-1",
        fullWidth ? "md:col-span-2" : "", // Span 2 columns if fullWidth
        className
    )}>
      <p className={cn(
          "text-xs font-medium text-gray-500 uppercase tracking-wider",
          isLarge ? "mb-0.5" : "mb-0.5"
       )}>
          {label}
       </p>
      <p className={cn(
          "text-gray-800",
          isLarge ? "text-lg md:text-xl font-semibold" : "text-sm md:text-base"
      )}>
          {val}
       </p>
    </div>
  );
};