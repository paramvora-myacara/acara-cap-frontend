'use client';

import React from 'react';

interface PlaceholderImageProps {
  name: string;
  size?: number;
  className?: string;
  color?: string;
}

export default function PlaceholderImage({ 
  name, 
  size = 80, 
  className = '', 
  color = '3B82F6' 
}: PlaceholderImageProps) {
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div 
      className={`rounded-full flex items-center justify-center text-white font-bold ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: `#${color}`,
        fontSize: `${Math.max(size * 0.4, 16)}px`
      }}
    >
      {initials}
    </div>
  );
} 