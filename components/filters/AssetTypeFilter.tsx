// components/filters/AssetTypeFilter.tsx
'use client';

import React from 'react';
import MultiSelect from '../../components/ui/MultiSelect';

interface AssetTypeFilterProps {
  value: string[];
  onChange: (newValue: string[]) => void;
}

const AssetTypeFilter: React.FC<AssetTypeFilterProps> = ({ value, onChange }) => {
  const assetTypeOptions = [
    "Multifamily", "Office", "Retail", "Industrial", "Hospitality",
    "Land", "Mixed-Use", "Self-Storage", "Data Center",
    "Medical Office", "Senior Housing", "Student Housing", "Other"
  ];

  return (
    <div className="mb-3">
      <h3 className="font-semibold mb-2 text-sm">Asset Type</h3>
      <MultiSelect
        options={assetTypeOptions}
        value={value}
        onChange={onChange}
        size="sm"
      />
    </div>
  );
};

export default AssetTypeFilter;
