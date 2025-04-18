// src/components/ui/SingleSelectChips.tsx
import React from 'react';
import { cn } from '../../utils/cn';

export interface SingleSelectChipOption {
  value: string;
  label: string;
}

export interface SingleSelectChipsProps {
  options: string[] | SingleSelectChipOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  required?: boolean;
  label?: string;
  layout?: 'row' | 'grid';
}

export const SingleSelectChips: React.FC<SingleSelectChipsProps> = ({
  options,
  value,
  onChange,
  className,
  size = 'md',
  disabled = false,
  required = false,
  label,
  layout = 'row',
}) => {
  // Convert string[] to SingleSelectChipOption[] if needed
  const normalizedOptions = options.map(option => 
    typeof option === 'string' ? { value: option, label: option } : option
  );

  const selectOption = (optionValue: string) => {
    if (disabled) return;
    onChange(optionValue);
  };

  const sizeClasses = {
    sm: 'text-xs py-1 px-2',
    md: 'text-sm py-1.5 px-3',
    lg: 'text-base py-2 px-4',
  };

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className={cn(
        "flex flex-wrap gap-2", 
        layout === 'grid' && "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
      )}>
        {normalizedOptions.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => selectOption(option.value)}
              disabled={disabled}
              className={cn(
                "rounded-md border transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                sizeClasses[size],
                isSelected 
                  ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700" 
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              aria-pressed={isSelected}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};