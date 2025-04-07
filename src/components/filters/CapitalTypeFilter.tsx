// components/filters/CapitalTypeFilter.tsx
'use client';

import React from 'react';
import { MultiSelect } from '../../components/ui/MultiSelect';

interface CapitalTypeFilterProps {
  value: string[];
  onChange: (newValue: string[]) => void;
}

const CapitalTypeFilter: React.FC<CapitalTypeFilterProps> = ({ value, onChange }) => {
  const capitalTypeOptions = [
    "Senior Debt", "Mezzanine", "Preferred Equity",
    "Common Equity", "JV Equity", "Other"
  ];

  return (
    <div className="mb-3">
      <h3 className="font-semibold mb-2 text-sm">Capital Type</h3>
      <MultiSelect
        options={capitalTypeOptions}
        value={value}
        onChange={onChange}
        size="sm"
      />
    </div>
  );
};

export default CapitalTypeFilter;
