'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SplashScreen } from '../components/ui/SplashScreen';
import { EnhancedHeader } from '../components/ui/EnhancedHeader';
import { GraphIntro } from '../components/ui/GraphIntro';
import { HeroStats } from '../components/ui/HeroStats';
import { Footer } from '../components/ui/Footer';
import FilterSection from '../components/filter-section';
import LenderGraph from '../components/graph/LenderGraph';
import { useAuth } from '../hooks/useAuth';
import { useLenders } from '../hooks/useLenders';
import { useUI } from '../hooks/useUI';
import { GlobalToast } from '../components/ui/GlobalToast';
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
  
  const [scrolled, setScrolled] = useState(false);
  const [splashComplete, setSplashComplete] = useState(false);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load lenders with no loading indicators
  useEffect(() => {
    const loadData = async () => {
      try {
        await refreshLenders();
      } catch (error) {
        console.error("Error loading lenders:", error);
      }
    };
    
    loadData();
  }, [refreshLenders]);

  // Don't set global loading state
  useEffect(() => {
    setLoading(false);
  }, [setLoading]);

  // Handle filter changes
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
    <div className="min-h-screen flex flex-col">
      {!splashComplete && (
        <SplashScreen onComplete={() => setSplashComplete(true)} />
      )}
      
      {splashComplete && (
        <>
          <EnhancedHeader scrolled={scrolled} />
          <GlobalToast />
          
          <main className="pt-16 flex-grow">
            <div className="container mx-auto px-4 pt-12 md:pt-20">
              <GraphIntro />
              
              <div className="flex flex-col lg:flex-row">
                {/* Left sidebar with filters - 40% width on large screens */}
                <div className="w-full lg:w-2/5 pr-0 lg:pr-6 mb-8 lg:mb-0">
                  <div className="space-y-4">
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
                </div>
                
                {/* Right side with graph visualization - 60% width on large screens */}
                <div className="w-full lg:w-3/5 h-[60vh] lg:h-[70vh] relative">
                  <LenderGraph
                    lenders={filteredLenders}
                    formData={filters}
                    filtersApplied={filtersApplied}
                    onLenderClick={(lender: LenderProfile | null) => {
                      selectLender(lender);
                      localStorage.setItem('lastFormData', JSON.stringify(filters));
                    }}
                  />
                </div>
              </div>
            </div>
            
            {/* Hero stats section */}
            <HeroStats />
          </main>

          {/* Footer */}
          <Footer />
        </>
      )}
    </div>
  );
}