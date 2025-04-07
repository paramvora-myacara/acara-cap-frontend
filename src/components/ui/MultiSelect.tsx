// src/components/ui/MultiSelect.tsx
import React, { useState, useRef, useEffect, useId } from 'react';
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface MultiSelectProps {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  id?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value,
  onChange,
  label,
  error,
  helperText,
  placeholder = 'Select options...',
  className,
  size = 'md',
  disabled = false,
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const reactId = useId(); // Generate stable IDs
  const inputId = id || `multiselect-${reactId}`;

  const toggleOption = (option: string) => {
    if (disabled) return;
    
    if (value.includes(option)) {
      onChange(value.filter(item => item !== option));
    } else {
      onChange([...value, option]);
    }
  };

  const removeOption = (option: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (disabled) return;
    onChange(value.filter(item => item !== option));
  };

  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const selectedOptionBadges = value.map(option => (
    <span
      key={option}
      className="inline-flex items-center m-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
    >
      {option}
      <button
        type="button"
        className="ml-1 inline-flex items-center justify-center"
        onClick={(e) => removeOption(option, e)}
      >
        <X size={14} className="hover:text-blue-500" />
      </button>
    </span>
  ));

  return (
    <div className={cn("w-full", className)} ref={containerRef}>
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <div
          id={inputId}
          className={cn(
            "border rounded-md shadow-sm px-3 py-2 flex flex-wrap items-center min-h-[2.5rem] cursor-pointer",
            isOpen ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-300",
            error && "border-red-300 focus:border-red-500 focus:ring-red-500",
            sizeClasses[size],
            disabled && "bg-gray-100 cursor-not-allowed opacity-75"
          )}
          onClick={toggleDropdown}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={label ? inputId : undefined}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        >
          <div className="flex flex-wrap flex-1">
            {value.length > 0 ? (
              selectedOptionBadges
            ) : (
              <span className="text-gray-400 py-0.5">{placeholder}</span>
            )}
          </div>
          <div className="ml-auto pl-2">
            {isOpen ? (
              <ChevronUp size={20} className="text-gray-400" />
            ) : (
              <ChevronDown size={20} className="text-gray-400" />
            )}
          </div>
        </div>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto">
            <ul className="py-1" role="listbox">
              {options.map(option => (
                <li
                  key={option}
                  role="option"
                  aria-selected={value.includes(option)}
                  onClick={() => toggleOption(option)}
                  className={cn(
                    "px-3 py-2 flex items-center cursor-pointer hover:bg-gray-100",
                    value.includes(option) ? "bg-blue-50" : ""
                  )}
                >
                  <div className={cn(
                    "mr-2 flex-shrink-0 w-4 h-4 border rounded flex items-center justify-center",
                    value.includes(option) ? "bg-blue-500 border-blue-500" : "border-gray-300"
                  )}>
                    {value.includes(option) && <Check size={12} className="text-white" />}
                  </div>
                  <span>{option}</span>
                </li>
              ))}
              {options.length === 0 && (
                <li className="px-3 py-2 text-gray-500">No options available</li>
              )}
            </ul>
          </div>
        )}
      </div>
      
      {error ? (
        <p className="mt-1 text-sm text-red-600" id={`${inputId}-error`}>
          {error}
        </p>
      ) : helperText ? (
        <p className="mt-1 text-sm text-gray-500" id={`${inputId}-helper`}>
          {helperText}
        </p>
      ) : null}
    </div>
  );
};