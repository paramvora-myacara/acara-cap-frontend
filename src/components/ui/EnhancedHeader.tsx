// src/components/ui/EnhancedHeader.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, Menu, X } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/utils/cn';

interface EnhancedHeaderProps {
  scrolled: boolean;
}

export const EnhancedHeader: React.FC<EnhancedHeaderProps> = ({ scrolled }) => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mobileMenuOpen]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        scrolled
          ? "bg-white shadow-md py-2"
          : "bg-transparent py-4"
      )}
    >
      <div className="container mx-auto flex justify-between items-center px-4">
        <Link href="/" className="flex items-center">
          <img 
            src="/acara-logo.png" 
            alt="ACARA-CAP" 
            className={cn(
              "transition-all duration-300 object-contain",
              scrolled ? "h-10" : "h-12"
            )}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.style.fontSize = scrolled ? '1.5rem' : '1.75rem';
              target.style.fontWeight = 'bold';
              target.style.color = '#3B82F6';
              target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMjAiPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSJib2xkIiBmb250LXNpemU9IjE2Ij5BQ0FSQS1DQVA8L3RleHQ+PC9zdmc+';
            }}
          />
        </Link>

        {/* Desktop Navigation - Removed Contact Us */}
        <div className="hidden md:flex items-center space-x-6">
          <nav className="flex items-center space-x-6">
            <Link href="#lenderline-section" className={cn(
              "text-sm font-medium transition-colors",
              scrolled ? "text-gray-700 hover:text-blue-600" : "text-gray-800 hover:text-blue-700"
            )}>
              <span className="font-semibold">LenderLine</span>
              <sup className="text-xs">™</sup>
            </Link>
            <Link href="/process" className={cn(
              "text-sm font-medium transition-colors",
              scrolled ? "text-gray-700 hover:text-blue-600" : "text-gray-800 hover:text-blue-700"
            )}>
              Process
            </Link>
          </nav>
          
          <Button 
            variant="primary" 
            size="sm" 
            leftIcon={<LogIn size={16} />}
            onClick={() => router.push('/login')}
            className={cn(
              scrolled ? "bg-blue-600" : "bg-blue-700",
              "font-medium"
            )}
          >
            <span>Access <span className="font-bold">Deal Room</span><sup className="text-xs">™</sup></span>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-gray-700 focus:outline-none" 
          onClick={(e) => {
            e.stopPropagation();
            setMobileMenuOpen(!mobileMenuOpen);
          }}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu - Removed Contact Us */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <div className="container mx-auto py-4 px-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="#lenderline-section" 
                className="text-gray-700 hover:text-blue-600 py-2 text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="font-semibold">LenderLine</span>
                <sup className="text-xs">™</sup>
              </Link>
              <Link 
                href="/process" 
                className="text-gray-700 hover:text-blue-600 py-2 text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Process
              </Link>
              <Button 
                variant="primary" 
                size="sm" 
                leftIcon={<LogIn size={16} />}
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push('/login');
                }}
                className="mt-2"
              >
                <span>Access <span className="font-bold">Deal Room</span><sup className="text-xs">™</sup></span>
              </Button>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};