// src/components/ui/Footer.tsx
import React from 'react';
import Link from 'next/link';
import { Mail, Linkedin, Twitter, Facebook } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Logo and social links */}
          <div className="flex items-center mb-4 md:mb-0">
            <span className="text-sm text-gray-400 ml-4 hidden md:inline">
              Connecting borrowers with the perfect lenders
            </span>
          </div>

          {/* Navigation links and social icons */}
          <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-6">
            <div className="flex space-x-4">
              <Link href="/terms" className="text-sm text-gray-400 hover:text-white">
                Terms
              </Link>
              <Link href="/privacy" className="text-sm text-gray-400 hover:text-white">
                Privacy
              </Link>
              <Link href="/contact" className="text-sm text-gray-400 hover:text-white">
                Contact
              </Link>
            </div>
            
            <div className="flex space-x-4">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Linkedin size={18} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Twitter size={18} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Facebook size={18} />
              </a>
            </div>
          </div>
        </div>
        
        {/* Copyright line */}
        <div className="text-xs text-center md:text-right text-gray-500 mt-4">
          © {currentYear} ACARA-Cap. All rights reserved.
        </div>
      </div>
    </footer>
  );
};