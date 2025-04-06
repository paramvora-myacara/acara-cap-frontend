// components/ui/MultiSelect.tsx
import React from 'react';
import { cn } from '../../lib/utils';

interface MultiSelectProps {
  options: string[];
  value: string[];
  onChange: (newValue: string[]) => void;
  label?: string;
  className?: string;
  size?: 'default' | 'sm'; // Add size prop
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value,
  onChange,
  label,
  className,
  size = 'default', // Default size to 'default'
}) => {
  const toggleOption = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((item) => item !== option));
    } else {
      onChange([...value, option]);
    }
  };

  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={cn(
              "rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700",
              "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
              value.includes(option) ? "bg-blue-500 text-white border-primary-500 font-semibold shadow-sm" : "bg-white",
              size === 'sm' && "px-2 py-1 text-xs" // Smaller padding and text for 'sm' size
            )}
            onClick={() => toggleOption(option)}
          >
            {option}
            </button>
        ))}
      </div>
    </div>
  );
};

export default MultiSelect;