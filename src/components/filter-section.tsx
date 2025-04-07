// components/filter-section.tsx
'use client';

import React from 'react';
import AssetTypeFilter from './filters/AssetTypeFilter';
import DealTypeFilter from './filters/DealTypeFilter';
import CapitalTypeFilter from './filters/CapitalTypeFilter';
import DebtRangeFilter from './filters/DebtRangeFilter';
import LocationFilter from './filters/LocationFilter';

interface FilterSectionProps {
  formData: any;
  onChange: (data: any) => void;
  filterType: 'asset_types' | 'deal_types' | 'capital_types' | 'debt_ranges' | 'locations';
}

export default function FilterSection({
  formData,
  onChange,
  filterType,
}: FilterSectionProps) {
  return (
    <div className="space-y-3">
      {filterType === 'asset_types' && (
        <AssetTypeFilter
          value={formData.asset_types || []}
          onChange={(newValue) => onChange({ asset_types: newValue })}
        />
      )}
      {filterType === 'deal_types' && (
        <DealTypeFilter
          value={formData.deal_types || []}
          onChange={(newValue) => onChange({ deal_types: newValue })}
        />
      )}
      {filterType === 'capital_types' && (
        <CapitalTypeFilter
          value={formData.capital_types || []}
          onChange={(newValue) => onChange({ capital_types: newValue })}
        />
      )}
      {filterType === 'debt_ranges' && (
        <DebtRangeFilter
          value={formData.debt_ranges || []}
          onChange={(newValue) => onChange({ debt_ranges: newValue })}
        />
      )}
      {filterType === 'locations' && (
        <LocationFilter
          value={formData.locations || []}
          onChange={(newValue) => onChange({ locations: newValue })}
        />
      )}
    </div>
  );
}
