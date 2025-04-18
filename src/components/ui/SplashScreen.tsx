// src/components/ui/SplashScreen.tsx
'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface SplashScreenProps {
  onComplete?: () => void;
  onLogoAnimationStart?: (position: { x: number, y: number, width: number, height: number }) => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ 
  onComplete,
  onLogoAnimationStart 
}) => {
  const logoRef = useRef<HTMLImageElement>(null);
  const hasInitiatedRef = useRef(false);

  // Run the effect exactly once when component mounts
  useEffect(() => {
    // Return immediately if we've already started the sequence
    if (hasInitiatedRef.current) return;
    
    // Mark that we've started the sequence
    hasInitiatedRef.current = true;
    
    // Schedule the completion and animation after 2 seconds
    const timer = setTimeout(() => {
      if (logoRef.current && onLogoAnimationStart) {
        // Get the position of the logo element
        const rect = logoRef.current.getBoundingClientRect();
        onLogoAnimationStart({
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height
        });
      }
      
      // Call onComplete to move to the main screen
      if (onComplete) {
        onComplete();
      }
    }, 2000);
    
    // Clean up timer if component unmounts
    return () => clearTimeout(timer);
  }, []); // Empty dependency array ensures this runs exactly once

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white"
    >
      <div className="text-center px-4">
        <div className="w-64 md:w-96 mx-auto mb-6 md:mb-8">
          <img 
            ref={logoRef}
            src="/acara-logo.png" 
            alt="ACARA CAP" 
            className="w-full h-auto object-contain" 
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMjAiPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSJib2xkIiBmb250LXNpemU9IjE2Ij5BQ0FSQS1DQVA8L3RleHQ+PC9zdmc+';
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};