// components/filter-section.tsx
'use client';

import React from 'react';
import AssetTypeFilter from './filters/AssetTypeFilter';
import DealTypeFilter from './filters/DealTypeFilter';
import CapitalTypeFilter from './filters/CapitalTypeFilter';
import DebtRangeFilter from './filters/DebtRangeFilter';
import LocationFilter from './filters/LocationFilter';
import { LenderFilters } from '../contexts/LenderContext'; // Ensure this path is correct

interface FilterSectionProps {
  formData: LenderFilters; // Use the specific LenderFilters type
  onChange: (newData: Partial<LenderFilters>) => void; // This is from page.tsx
  filterType: keyof LenderFilters; // Constrain filterType to keys of LenderFilters
}

const FilterSection: React.FC<FilterSectionProps> = ({
  formData,
  onChange, // This is the setFilters function from useLenders, via handleFilterChange in page.tsx
  filterType
}) => {

  // This is the crucial wrapper.
  // It takes the specific value from a child filter (e.g., asset_types array)
  // and calls the main onChange (setFilters) with the correct partial update.
  const handleIndividualFilterChange = (value: string[]) => {
    onChange({ [filterType]: value });
  };

  const renderFilterComponent = () => {
    switch (filterType) {
      case 'asset_types':
        return (
          <AssetTypeFilter
            value={formData.asset_types || []}
            onChange={handleIndividualFilterChange} // Pass the wrapped handler
          />
        );
      case 'deal_types':
        return (
          <DealTypeFilter
            value={formData.deal_types || []}
            onChange={handleIndividualFilterChange}
          />
        );
      case 'capital_types':
        return (
          <CapitalTypeFilter
            value={formData.capital_types || []}
            onChange={handleIndividualFilterChange}
          />
        );
      case 'debt_ranges':
        return (
          <DebtRangeFilter
            value={formData.debt_ranges || []}
            onChange={handleIndividualFilterChange}
          />
        );
      case 'locations':
        return (
          <LocationFilter
            value={formData.locations || []}
            onChange={handleIndividualFilterChange}
          />
        );
      default:
        // This case should ideally not be reached if filterType is correctly typed
        console.warn(`FilterSection: Unknown filterType "${filterType}"`);
        return null;
    }
  };

  return (
    // Removed the outer div, styling is handled by parent in page.tsx
    // className="space-y-3 transition-all duration-200 ease-in-out"
    <> 
      {renderFilterComponent()}
    </>
  );
};

export default FilterSection;