// components/filters/DealTypeFilter.tsx
'use client';

import React from 'react';
import MultiSelect from '../../components/ui/MultiSelect';

interface DealTypeFilterProps {
  value: string[];
  onChange: (newValue: string[]) => void;
}

const DealTypeFilter: React.FC<DealTypeFilterProps> = ({ value, onChange }) => {
  const dealTypeOptions = [
    "Acquisition", "Refinance", "Construction", "Bridge",
    "Development", "Value-Add", "Other"
  ];

  return (
    <div className="mb-3">
      <h3 className="font-semibold mb-2 text-sm">Deal Type</h3>
      <MultiSelect
        options={dealTypeOptions}
        value={value}
        onChange={onChange}
        size="sm"
      />
    </div>
  );
};

export default DealTypeFilter;
