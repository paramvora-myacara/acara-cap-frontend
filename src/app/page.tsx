// src/app/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LenderGraph from '../components/graph/LenderGraph';
import FilterSection from '../components/filter-section';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useLenders } from '../hooks/useLenders';
import { useUI } from '../hooks/useUI';
import { GlobalToast } from '../components/ui/GlobalToast';
import { SubtleLoadingIndicator } from '../components/ui/SubtleLoadingIndicator';
import { Building, LogIn, User } from 'lucide-react';
import { LenderProfile } from '@/types/lender';

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { 
    filteredLenders, 
    filters, 
    setFilters, 
    isLoading, 
    selectLender,
    refreshLenders 
  } = useLenders();
  const { setLoading } = useUI();
  const [localIsLoading, setLocalIsLoading] = useState(false);

  // Load lenders with no loading indicators
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load data without any loading indicators
        await refreshLenders();
      } catch (error) {
        console.error("Error loading lenders:", error);
      }
    };
    
    loadData();
  }, [refreshLenders]);

  // Don't set global loading state at all
  useEffect(() => {
    setLoading(false); // Always keep loading off
  }, [setLoading]);

  // Handle filter changes with no loading states
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  // Determine if filters are applied
  const filtersApplied = 
    filters.asset_types.length > 0 ||
    filters.deal_types.length > 0 ||
    filters.capital_types.length > 0 ||
    filters.debt_ranges.length > 0 ||
    filters.locations.length > 0;

  return (
    <div className="h-screen flex flex-col">
      <GlobalToast />
      
      {/* Header with login button */}
      <header className="bg-white shadow-sm p-4 border-b border-gray-200">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Building className="h-6 w-6 text-blue-600 mr-2" />
            <h1 className="text-xl font-semibold text-blue-800">ACARA-Cap Lender Matching Platform</h1>
          </div>
          <div>
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">Hello, {user?.email}</div>
                <Button 
                  variant="primary" 
                  size="md" 
                  leftIcon={<User size={16} />}
                  onClick={() => router.push('/dashboard')}
                >
                  Dashboard
                </Button>
              </div>
            ) : (
              <Button 
                variant="primary" 
                size="md" 
                leftIcon={<LogIn size={16} />}
                onClick={() => router.push('/login')}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main content with filter sidebar and graph */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <div className="flex h-[85vh] w-full max-w-[1400px]">
          {/* Left sidebar with filters - 40% width */}
          <div className="w-2/5 pr-6 flex flex-col space-y-4 overflow-y-auto">
            <div className="p-4 bg-gray-50 rounded-lg">
              <FilterSection 
                formData={filters} 
                onChange={(newData) => handleFilterChange(newData)}
                filterType="asset_types" 
              />
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <FilterSection 
                formData={filters} 
                onChange={(newData) => handleFilterChange(newData)}
                filterType="deal_types" 
              />
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <FilterSection 
                formData={filters} 
                onChange={(newData) => handleFilterChange(newData)}
                filterType="capital_types" 
              />
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <FilterSection 
                formData={filters} 
                onChange={(newData) => handleFilterChange(newData)}
                filterType="locations" 
              />
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <FilterSection 
                formData={filters} 
                onChange={(newData) => handleFilterChange(newData)}
                filterType="debt_ranges" 
              />
            </div>
          </div>
          
          {/* Right side with graph visualization - 60% width */}
          <div className="w-3/5 relative">
            <LenderGraph
              lenders={filteredLenders}
              formData={filters}
              filtersApplied={filtersApplied}
              onLenderClick={(lender: LenderProfile | null) => {
                selectLender(lender);
                // Store form data for later use in project creation
                localStorage.setItem('lastFormData', JSON.stringify(filters));
              }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white shadow-sm p-3 border-t border-gray-200 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} ACARA-Cap Platform</p>
      </footer>
    </div>
  );
}