// src/app/page.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { SplashScreen } from '../components/ui/SplashScreen';
import { EnhancedHeader } from '../components/ui/EnhancedHeader';
import { Footer } from '../components/ui/Footer';
import FilterSection from '../components/filter-section';
import LenderGraph from '../components/graph/LenderGraph';
import { useAuth } from '../hooks/useAuth';
import { useLenders } from '../hooks/useLenders';
import { useUI } from '../hooks/useUI';
import { GlobalToast } from '../components/ui/GlobalToast';
import { LenderProfile } from '@/types/lender';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Building, CheckCircle, DollarSign } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { 
    filteredLenders, 
    filters, 
    setFilters, 
    selectLender,
    refreshLenders 
  } = useLenders();
  const { setLoading } = useUI();
  
  const [scrolled, setScrolled] = useState(false);
  const [splashComplete, setSplashComplete] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  
  // Ref for stats section with explicit type annotation
  const statsRef = useRef<HTMLElement | null>(null);
  
  // Handle scroll events and check for stats visibility
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      
      // Check if stats section is visible
      if (statsRef.current && typeof statsRef.current.getBoundingClientRect === 'function') {
        const rect = statsRef.current.getBoundingClientRect();
        // If the top of the element is in view or just below
        if (rect.top < window.innerHeight - 100) {
          setStatsVisible(true);
        }
      }
    };
    
    // Initial check
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Add slight delay after splash screen before showing content
  useEffect(() => {
    if (splashComplete) {
      const timer = setTimeout(() => {
        setContentVisible(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [splashComplete]);

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

  // Determine if all filter categories have selections
  const allFiltersSelected = 
    filters.asset_types.length > 0 &&
    filters.deal_types.length > 0 &&
    filters.capital_types.length > 0 &&
    filters.debt_ranges.length > 0 &&
    filters.locations.length > 0;

  // Calculate top lenders (red dots)
  const topLenders = filteredLenders.filter(lender => 
    lender.match_score > 0.7
  );

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
              {/* Heading that fades in */}
              <motion.h1
                className="text-4xl font-bold text-center mb-10 text-gray-800"
                initial={{ opacity: 0, y: -20 }}
                animate={contentVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
              >
                Lender Matching
              </motion.h1>
              
              <div className="flex flex-col lg:flex-row">
                {/* Left sidebar with filters - 40% width on large screens */}
                <motion.div 
                  className="w-full lg:w-2/5 pr-0 lg:pr-6 mb-8 lg:mb-0"
                  initial={{ opacity: 0, x: -50 }}
                  animate={contentVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <div className="space-y-4">
                    {/* Subtle guide for users to select all filters */}
                    <div className="bg-blue-50 p-3 rounded-lg mb-4 text-sm text-blue-800">
                      Select options in all categories to view and contact matching lenders
                    </div>
                    
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
                </motion.div>
                
                {/* Right side with graph visualization - 60% width on large screens */}
                <motion.div 
                  className="w-full lg:w-3/5 h-[60vh] lg:h-[70vh] relative"
                  initial={{ opacity: 0, x: 50 }}
                  animate={contentVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <LenderGraph
                    lenders={filteredLenders}
                    formData={filters}
                    filtersApplied={true}
                    onLenderClick={(lender: LenderProfile | null) => {
                      selectLender(lender);
                      localStorage.setItem('lastFormData', JSON.stringify(filters));
                    }}
                    allFiltersSelected={allFiltersSelected}
                  />
                </motion.div>
              </div>
              
              {/* Contact top lenders button - only shows when all filters are selected */}
              <motion.div 
                className="mt-4 flex justify-center mb-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: allFiltersSelected ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {allFiltersSelected && topLenders.length > 0 && (
                  <Button
                    variant="primary"
                    rightIcon={<ArrowRight size={16} />}
                    onClick={() => {
                      localStorage.setItem('lastFormData', JSON.stringify(filters));
                      router.push('/login');
                    }}
                    className="shadow-md"
                  >
                    Contact your top {topLenders.length} lenders
                  </Button>
                )}
              </motion.div>
            </div>
            
            {/* Hero Stats Section with Basic CSS Transitions */}
            <section 
              ref={statsRef}
              className="py-16 bg-gradient-to-b from-gray-50 to-blue-50"
            >
              <div className="container mx-auto px-4">
                {/* Title with CSS transition */}
                <h2 
                  className={`text-4xl font-bold text-center mb-12 text-gray-800 italic transition-all duration-1000 ${
                    statsVisible ? 'opacity-100 transform-none' : 'opacity-0 translate-y-8'
                  }`}
                >
                  Our Impact
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* First Stat with CSS transition */}
                  <div 
                    className={`bg-white shadow-lg rounded-lg p-6 text-center hover:shadow-xl transition-all duration-1000 ${
                      statsVisible ? 'opacity-100 transform-none' : 'opacity-0 translate-y-8'
                    }`}
                    style={{ transitionDelay: '100ms' }}
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-blue-100">
                      <Building className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="text-4xl font-bold mb-2 text-blue-600">500+</div>
                    <div className="text-gray-700 font-medium">Lenders</div>
                  </div>
                  
                  {/* Second Stat with CSS transition */}
                  <div 
                    className={`bg-white shadow-lg rounded-lg p-6 text-center hover:shadow-xl transition-all duration-1000 ${
                      statsVisible ? 'opacity-100 transform-none' : 'opacity-0 translate-y-8'
                    }`}
                    style={{ transitionDelay: '200ms' }}
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-green-100">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="text-4xl font-bold mb-2 text-green-600">1,250+</div>
                    <div className="text-gray-700 font-medium">Deals Closed</div>
                  </div>
                  
                  {/* Third Stat with CSS transition */}
                  <div 
                    className={`bg-white shadow-lg rounded-lg p-6 text-center hover:shadow-xl transition-all duration-1000 ${
                      statsVisible ? 'opacity-100 transform-none' : 'opacity-0 translate-y-8'
                    }`}
                    style={{ transitionDelay: '300ms' }}
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-amber-100">
                      <DollarSign className="h-8 w-8 text-amber-600" />
                    </div>
                    <div className="text-4xl font-bold mb-2 text-amber-600">$5B+</div>
                    <div className="text-gray-700 font-medium">In Revenue</div>
                  </div>
                </div>
              </div>
            </section>
          </main>

          {/* Footer */}
          <Footer />
        </>
      )}
    </div>
  );
}
