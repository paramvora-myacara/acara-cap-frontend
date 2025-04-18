// src/app/page.tsx - Main component fix
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [logoAnimating, setLogoAnimating] = useState(false);
  const [logoStartPosition, setLogoStartPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  // Animation sequence for heading
  const [textAnimation, setTextAnimation] = useState({
    part1Visible: false,
    part2Visible: false,
    part3Visible: false
  });
  
  // Ref for stats section with explicit type annotation
  const statsRef = useRef<HTMLElement | null>(null);
  const headerLogoRef = useRef<HTMLImageElement | null>(null);
  
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

  // Handle logo animation start
  const handleLogoAnimationStart = (position: { x: number, y: number, width: number, height: number }) => {
    setLogoStartPosition(position);
    setLogoAnimating(true);
  };

  // Add slight delay after splash screen before showing content
  useEffect(() => {
    if (splashComplete) {
      console.log("Splash complete, showing content");
      const timer = setTimeout(() => {
        setContentVisible(true);
        
        // Start text animation sequence
        setTimeout(() => setTextAnimation(prev => ({ ...prev, part1Visible: true })), 300);
        setTimeout(() => setTextAnimation(prev => ({ ...prev, part2Visible: true })), 800);
        setTimeout(() => setTextAnimation(prev => ({ ...prev, part3Visible: true })), 1300);
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

  // Number animation for stats
  const [animatedStats, setAnimatedStats] = useState({
    lenders: 0,
    deals: 0,
    revenue: 0
  });

  useEffect(() => {
    if (statsVisible) {
      const duration = 2000; // 2 seconds
      const interval = 20; // update every 20ms
      
      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / (duration / interval);
        
        setAnimatedStats({
          lenders: Math.floor(progress * 513),
          deals: Math.floor(progress * 1273),
          revenue: parseFloat((progress * 5.7).toFixed(1))
        });
        
        if (step >= duration / interval) {
          clearInterval(timer);
          setAnimatedStats({
            lenders: 513,
            deals: 1273,
            revenue: 5.7
          });
        }
      }, interval);
      
      return () => clearInterval(timer);
    }
  }, [statsVisible]);

  return (
    <div className="min-h-screen flex flex-col">
      {!splashComplete && (
        <SplashScreen 
          onComplete={() => {
            console.log("Splash screen animation complete");
            setSplashComplete(true);
          }} 
          onLogoAnimationStart={handleLogoAnimationStart}
        />
      )}
      
      {splashComplete && (
        <>
          <EnhancedHeader 
            scrolled={scrolled} 
            logoRef={headerLogoRef}
          />
          <GlobalToast />
          
          {/* Animating logo that transitions from splash to header */}
          {logoAnimating && headerLogoRef.current && (
            <AnimatePresence>
              <motion.img
                src="/acara-logo.png"
                alt="ACARA CAP"
                className="fixed z-50 object-contain"
                initial={{
                  x: logoStartPosition.x,
                  y: logoStartPosition.y,
                  width: logoStartPosition.width,
                  height: logoStartPosition.height,
                  opacity: 1
                }}
                animate={{
                  x: headerLogoRef.current.getBoundingClientRect().x,
                  y: headerLogoRef.current.getBoundingClientRect().y,
                  width: headerLogoRef.current.getBoundingClientRect().width,
                  height: headerLogoRef.current.getBoundingClientRect().height,
                  opacity: 0
                }}
                transition={{
                  duration: 0.8,
                  ease: "easeInOut"
                }}
                onAnimationComplete={() => setLogoAnimating(false)}
                style={{ pointerEvents: 'none' }}
              />
            </AnimatePresence>
          )}
          
          <main className="pt-16 flex-grow">
            {/* Hero Section - 90% height, centered content */}
            <section className="py-32 bg-gradient-to-b from-white to-gray-50" style={{minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div className="container mx-auto px-4 max-w-3xl text-center">
                {/* Animated text elements - Modified for AI-Powered and Borrower-Controlled to be on same line */}
                <motion.div className="mb-8">
                  <div className="overflow-hidden">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ 
                        opacity: textAnimation.part1Visible ? 1 : 0, 
                        y: textAnimation.part1Visible ? 0 : 20 
                      }}
                      transition={{ duration: 0.6 }}
                      className="text-5xl md:text-6xl font-bold leading-tight"
                    >
                      <span className="text-blue-600">AI</span>-Powered. <span className="text-blue-600">Borrower</span>-Controlled.
                    </motion.div>
                  </div>
                  
                  <div className="overflow-hidden mt-2">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ 
                        opacity: textAnimation.part2Visible ? 1 : 0, 
                        y: textAnimation.part2Visible ? 0 : 20 
                      }}
                      transition={{ duration: 0.6 }}
                      className="text-5xl md:text-6xl font-bold leading-tight"
                    >
                      <span className="text-blue-800 font-display">Commercial Lending,</span>
                    </motion.div>
                  </div>
                  
                  <div className="overflow-hidden">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ 
                        opacity: textAnimation.part3Visible ? 1 : 0, 
                        y: textAnimation.part3Visible ? 0 : 20 
                      }}
                      transition={{ duration: 0.6 }}
                      className="text-5xl md:text-6xl font-bold leading-tight italic"
                    >
                      <span className="text-blue-800 font-display">Simplified.</span>
                    </motion.div>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: textAnimation.part3Visible ? 1 : 0 
                  }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                    Our platform connects you with the perfect lenders for your commercial real estate projects through our proprietary <span className="font-semibold">LenderLine™</span> technology, via giving access to the exclusive <span className="font-semibold">ACARA Cap Deal Room™</span>.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
                    <Button 
                      variant="primary" 
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 shadow-lg"
                      onClick={() => {
                        const filterSection = document.getElementById('lenderline-section');
                        filterSection?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      Use LenderLine™
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => router.push('/login')}
                      className="rounded-full shadow-md"
                    >
                      Access Deal Room™
                    </Button>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* LenderLine Section */}
            <section id="lenderline-section" className="py-16 bg-white">
              <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                  <div className="flex items-center justify-center mb-4">
                    <img 
                      src="/acara-logo.png" 
                      alt="ACARA-CAP" 
                      className="h-8 mr-2" // Made the logo smaller
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.style.display = 'none';
                      }}
                    />
                    <h2 className="text-4xl font-bold text-gray-900">
                      <span className="text-blue-700 font-semibold text-5xl">LenderLine</span>
                      <sup className="text-xs">™</sup>
                    </h2>
                  </div>
                </div>
                
                <div className="flex flex-col lg:flex-row">
                  {/* Left sidebar with filters - 50% width on large screens */}
                  <motion.div 
                    className="w-full lg:w-1/2 pr-0 lg:pr-6 mb-8 lg:mb-0"
                    initial={{ opacity: 0, x: -50 }}
                    animate={contentVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
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
                      
                      {/* Contact top lenders button - moved higher up */}
                      {allFiltersSelected && topLenders.length > 0 && (
                        <div className="mt-6 text-center">
                          <Button
                            variant="primary"
                            rightIcon={<ArrowRight size={16} />}
                            onClick={() => {
                              localStorage.setItem('lastFormData', JSON.stringify(filters));
                              router.push('/login');
                            }}
                            className="shadow-xl bg-red-600 hover:bg-red-700 text-white rounded-full px-8 py-3 text-lg font-medium"
                          >
                            Contact your top {topLenders.length} lenders
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                  
                  {/* Right side with graph visualization - 50% width on large screens */}
                  <motion.div 
                    className="w-full lg:w-1/2 h-[60vh] lg:h-[70vh] relative"
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
              </div>
            </section>
            
            {/* Stats Section */}
            <section 
              ref={statsRef}
              className="py-16 bg-gradient-to-b from-gray-50 to-blue-50"
            >
              <div className="container mx-auto px-4">
                <h2 
                  className={`text-4xl font-bold text-center mb-16 text-gray-800 italic transition-all duration-1000 ${
                    statsVisible ? 'opacity-100 transform-none' : 'opacity-0 translate-y-8'
                  }`}
                >
                  Our Impact
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={statsVisible ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-center"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-blue-100">
                      <Building className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="text-5xl font-bold mb-2 text-blue-600">{animatedStats.lenders}</div>
                    <div className="text-gray-700 font-medium">Lenders</div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={statsVisible ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-center"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-green-100">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="text-5xl font-bold mb-2 text-green-600">{animatedStats.deals}</div>
                    <div className="text-gray-700 font-medium">Deals Closed</div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={statsVisible ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="text-center"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-amber-100">
                      <DollarSign className="h-8 w-8 text-amber-600" />
                    </div>
                    <div className="text-5xl font-bold mb-2 text-amber-600">${animatedStats.revenue}B</div>
                    <div className="text-gray-700 font-medium">In Revenue</div>
                  </motion.div>
                </div>
              </div>
            </section>

            {/* Client Logo Section - unchanged */}
            <section className="py-16 bg-white">
              <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
                  Trusted By Leading Companies
                </h2>

                <div className="flex flex-wrap justify-center items-center gap-8 opacity-80">
                  {[1, 2, 3, 4, 5, 6].map((index) => (
                    <div key={index} className="w-32 h-16 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-gray-500 font-semibold">Client {index}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-12 text-center">
                <Button 
                    variant="outline"
                    onClick={() => router.push('/contact')}
                    className="rounded-full"
                  >
                    Become a Partner
                  </Button>
                </div>
              </div>
            </section>
          </main>

          <Footer />
        </>
      )}
    </div>
  );
}