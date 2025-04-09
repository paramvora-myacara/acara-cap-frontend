'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'in' | 'visible' | 'out'>('in');

  useEffect(() => {
    // Fade in
    const fadeInTimer = setTimeout(() => {
      setStage('visible');
    }, 500);

    // Stay visible
    const visibleTimer = setTimeout(() => {
      setStage('out');
    }, 3500);

    // Complete
    const completeTimer = setTimeout(() => {
      onComplete?.();
    }, 4000);

    return () => {
      clearTimeout(fadeInTimer);
      clearTimeout(visibleTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: stage === 'in' ? 0 : 
                   stage === 'visible' ? 1 : 
                   0 
        }}
        exit={{ opacity: 0 }}
        transition={{ 
          duration: 0.5,
          ease: "easeInOut"
        }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-white"
      >
        <div className="text-center px-4">
          <div className="w-64 md:w-96 mx-auto mb-6 md:mb-8">
            <img 
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
          <h1 className="text-lg md:text-2xl text-gray-800 font-normal max-w-2xl mx-auto leading-relaxed tracking-wide">
            AI-Powered. Borrower-Controlled. 
            Commercial Lending, Simplified.
          </h1>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};