// components/filters/DebtRangeFilter.tsx
'use client';

import React from 'react';
import { MultiSelect } from '../../components/ui/MultiSelect';

interface DebtRangeFilterProps {
  value: string[];
  onChange: (newValue: string[]) => void;
}

const DebtRangeFilter: React.FC<DebtRangeFilterProps> = ({ value, onChange }) => {
  const debtRangeOptions = [
    "$0 - $5M",
    "$5M - $25M",
    "$25M - $100M",
    "$100M+"
  ];

  return (
    <div className="mb-3">
      <h3 className="font-semibold mb-2 text-sm">Debt Range</h3>
      <MultiSelect
        options={debtRangeOptions}
        value={value}
        onChange={onChange}
        size="sm"
      />
    </div>
  );
};

export default DebtRangeFilter;
