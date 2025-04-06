// src/app/page.tsx

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LenderGraph from '../../components/graph/LenderGraph';
import FilterSection from '../../components/filter-section';
import Typography from '../../components/common/Typography';
import { Button } from '../../components/ui/button';
import { getLenders } from '../../lib/mockApiService';
import { LenderProfile } from '../../types/lender';
import { calculateMatchScores } from '../../lib/utils';
import { User, LogIn, Building } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [lenders, setLenders] = useState<LenderProfile[]>([]);
  const [filteredLenders, setFilteredLenders] = useState<LenderProfile[]>([]);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [formData, setFormData] = useState<any>({
    asset_types: [],
    deal_types: [],
    capital_types: [],
    debt_ranges: [],
    locations: [],
  });
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const graphContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if user is logged in
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('userEmail');
      if (email) {
        setUserEmail(email);
      }
    }

    const fetchLenderData = async () => {
      try {
        const lenderData = await getLenders();
        setLenders(lenderData);
        applyFilters(lenderData, formData);
      } catch (error) {
        console.error("Error fetching lenders:", error);
      }
    };

    fetchLenderData();
  }, [formData]);

  const applyFilters = (allLenders: LenderProfile[], currentFormData: any) => {
    const hasFilters =
      currentFormData.asset_types.length > 0 ||
      currentFormData.deal_types.length > 0 ||
      currentFormData.capital_types.length > 0 ||
      currentFormData.debt_ranges.length > 0 ||
      currentFormData.locations.length > 0;

    if (!hasFilters) {
      setFilteredLenders(allLenders);
      setFiltersApplied(false);
      return;
    }

    const scoredLenders = calculateMatchScores(allLenders, {
      asset_types: currentFormData.asset_types,
      deal_types: currentFormData.deal_types,
      capital_types: currentFormData.capital_types,
      debt_ranges: currentFormData.debt_ranges,
      locations: currentFormData.locations,
    });
    setFilteredLenders(scoredLenders.sort((a, b) => b.match_score - a.match_score));
    setFiltersApplied(true);
  };

  const handleFormDataChange = (newFormData: any) => {
    setFormData((prev: any) => ({ ...prev, ...newFormData }));
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header with login button */}
      <header className="bg-white shadow-sm p-4 border-b border-gray-200">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Building className="h-6 w-6 text-blue-600 mr-2" />
            <h1 className="text-xl font-semibold text-blue-800">ACARA-Cap Lender Matching Platform</h1>
          </div>
          <div>
            {userEmail ? (
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">Hello, {userEmail}</div>
                <Button 
                  className="bg-blue-600 text-white flex items-center" 
                  onClick={() => router.push('/dashboard')}
                >
                  <User className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </div>
            ) : (
              <Button 
                className="bg-blue-600 text-white flex items-center" 
                onClick={() => router.push('/login')}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main content with 40/60 split */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <div className="flex h-[85vh] w-full max-w-[1400px]">
          {/* Left sidebar with filters - 40% width */}
          <div className="w-2/5 pr-6 flex flex-col space-y-4 overflow-y-auto">
            <div className="p-4 bg-gray-50 rounded-lg">
              <FilterSection 
                formData={formData} 
                onChange={handleFormDataChange} 
                filterType="asset_types" 
              />
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <FilterSection 
                formData={formData} 
                onChange={handleFormDataChange} 
                filterType="deal_types" 
              />
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <FilterSection 
                formData={formData} 
                onChange={handleFormDataChange} 
                filterType="capital_types" 
              />
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <FilterSection 
                formData={formData} 
                onChange={handleFormDataChange} 
                filterType="locations" 
              />
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <FilterSection 
                formData={formData} 
                onChange={handleFormDataChange} 
                filterType="debt_ranges" 
              />
            </div>
          </div>
          
          {/* Right side with graph visualization - 60% width */}
          <div className="w-3/5 relative" ref={graphContainerRef}>
            <LenderGraph
              lenders={filteredLenders}
              formData={formData}
              filtersApplied={filtersApplied}
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