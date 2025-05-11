// src/components/om/Section.tsx
import React from 'react';
import { cn } from '@/utils/cn';

interface SectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  level?: 1 | 2; // For nested sections (h2 vs h3)
}

export const Section: React.FC<SectionProps> = ({ title, icon, children, className, level = 1 }) => {
  const TitleTag = level === 1 ? 'h2' : 'h3';
  const titleSize = level === 1 ? 'text-xl md:text-2xl' : 'text-lg md:text-xl';
  const bottomMargin = level === 1 ? 'mb-4 md:mb-6' : 'mb-3 md:mb-4';

  return (
    <section className={cn("om-section", className)}>
      <TitleTag className={cn(
          "font-semibold text-gray-700 border-b pb-2 flex items-center",
          titleSize,
          bottomMargin
       )}>
        {icon && React.cloneElement(icon as React.ReactElement, { className: "mr-2 h-5 w-5 text-blue-600 flex-shrink-0" })}
        {title}
      </TitleTag>
      <div>{children}</div>
    </section>
  );
};