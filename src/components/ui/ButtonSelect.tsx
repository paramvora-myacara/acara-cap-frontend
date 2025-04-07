// src/components/ui/ButtonSelect.tsx
import React from 'react';
import { cn } from '../../utils/cn';

export interface ButtonSelectOption {
  value: string;
  label: string;
}

export interface ButtonSelectProps {
  options: string[] | ButtonSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export const ButtonSelect: React.FC<ButtonSelectProps> = ({
  options,
  value,
  onChange,
  className,
  size = 'md',
  disabled = false,
}) => {
  // Convert string[] to ButtonSelectOption[] if needed
  const normalizedOptions = options.map(option => 
    typeof option === 'string' ? { value: option, label: option } : option
  );

  const toggleOption = (optionValue: string) => {
    if (disabled) return;
    
    if (value.includes(optionValue)) {
      onChange(value.filter(item => item !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const sizeClasses = {
    sm: 'text-xs py-1 px-2',
    md: 'text-sm py-1.5 px-3',
    lg: 'text-base py-2 px-4',
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {normalizedOptions.map((option) => {
        const isSelected = value.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => toggleOption(option.value)}
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
  );
};