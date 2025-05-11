// src/components/om/PlaceholderBlock.tsx
import React from 'react';
import { cn } from '@/utils/cn';

interface PlaceholderBlockProps {
  text: string;
  height?: string; // e.g., 'h-40'
  className?: string;
  icon?: React.ReactElement<{ className?: string }>;
}

export const PlaceholderBlock: React.FC<PlaceholderBlockProps> = ({
    text,
    height = 'h-24',
    className,
    icon
}) => {
  return (
    <div
      className={cn(
        "om-placeholder border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-400 text-sm italic text-center p-4",
        height,
        className
      )}
    >
      <div className='flex flex-col items-center'>
         {icon && React.cloneElement(icon, { className: "h-8 w-8 mb-2 text-gray-300" })}
        {text}
      </div>
    </div>
  );
};