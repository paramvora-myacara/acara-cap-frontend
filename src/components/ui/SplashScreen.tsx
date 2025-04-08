// src/components/ui/SplashScreen.tsx
'use client';

import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isBlurred, setIsBlurred] = useState(false);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    // Start fading out after 2.5 seconds
    const timer = setTimeout(() => {
      setIsBlurred(true);
      setOpacity(0.8);
      setTimeout(() => {
        onComplete?.();
        // Add a small delay before hiding completely
        setTimeout(() => {
          setIsVisible(false);
        }, 300);
      }, 1000);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  // Handle scroll events to create a proportional blur effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = 300; // Full blur effect at 300px scroll
      const blurAmount = Math.min(scrollY / maxScroll, 1);
      const newOpacity = 1 - (blurAmount * 0.5);
      
      if (blurAmount > 0) {
        setIsBlurred(true);
        setOpacity(newOpacity);
      }
      
      if (scrollY > maxScroll) {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-all duration-1000 ease-in-out ${
        isBlurred ? 'backdrop-blur-md bg-opacity-80' : ''
      }`}
      style={{ 
        opacity,
        transition: 'opacity 1s ease-in-out'
      }}
    >
      <div className="text-center px-4">
        <div className="w-64 md:w-96 mx-auto mb-6 md:mb-8">
          <img 
            src="/acara-logo.png" 
            alt="ACARA CAP" 
            className="w-full h-auto" 
            onError={(e) => {
              // Fallback if logo isn't available
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMjAiPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSJib2xkIiBmb250LXNpemU9IjE2Ij5BQ0FSQS1DQVA8L3RleHQ+PC9zdmc+';
            }}
          />
        </div>
        <h1 className="text-xl md:text-3xl text-gray-800 font-light max-w-2xl mx-auto leading-relaxed">
          AI-Powered. Borrower-Controlled. Commercial Lending, Simplified.
        </h1>
      </div>
    </div>
  );
};