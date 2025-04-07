// components/filters/CapitalTypeFilter.tsx
'use client';

import React, { useState } from 'react';
import { ButtonSelect } from '../../components/ui/ButtonSelect';
import { Info } from 'lucide-react';

interface CapitalTypeFilterProps {
  value: string[];
  onChange: (newValue: string[]) => void;
}

const CapitalTypeFilter: React.FC<CapitalTypeFilterProps> = ({ value, onChange }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const capitalTypeOptions = [
    "Senior Debt", "Mezzanine", "Preferred Equity",
    "Common Equity", "JV Equity", "Other"
  ];

  return (
    <div className="mb-3">
      <div className="flex items-center mb-2">
        <h3 className="font-semibold text-sm">Capital Type</h3>
        <div className="relative ml-2">
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            aria-label="Capital Type Information"
          >
            <Info size={16} />
          </button>
          {showTooltip && (
            <div className="absolute z-10 w-64 p-2 mt-2 text-xs bg-white rounded-md shadow-lg border border-gray-200 -translate-x-1/2 left-1/2">
              Select the type of capital structure you're seeking. Different lenders specialize in different capital types.
            </div>
          )}
        </div>
      </div>
      <ButtonSelect
        options={capitalTypeOptions}
        value={value}
        onChange={onChange}
        size="sm"
      />
    </div>
  );
};

export default CapitalTypeFilter;