// components/filters/DealTypeFilter.tsx
'use client';

import React, { useState } from 'react';
import { ButtonSelect } from '../../components/ui/ButtonSelect';
import { Info } from 'lucide-react';

interface DealTypeFilterProps {
  value: string[];
  onChange: (newValue: string[]) => void;
}

const DealTypeFilter: React.FC<DealTypeFilterProps> = ({ value, onChange }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const dealTypeOptions = [
    "Acquisition", "Refinance", "Construction", "Bridge",
    "Development", "Value-Add", "Other"
  ];

  return (
    <div className="mb-3">
      <div className="flex items-center mb-2">
        <h3 className="font-semibold text-sm">Deal Type</h3>
        <div className="relative ml-2">
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            aria-label="Deal Type Information"
          >
            <Info size={16} />
          </button>
          {showTooltip && (
            <div className="absolute z-10 w-64 p-2 mt-2 text-xs bg-white rounded-md shadow-lg border border-gray-200 -translate-x-1/2 left-1/2">
              Select the type of transaction you're pursuing. This impacts which lenders will match with your project.
            </div>
          )}
        </div>
      </div>
      <ButtonSelect
        options={dealTypeOptions}
        value={value}
        onChange={onChange}
        size="sm"
      />
    </div>
  );
};

export default DealTypeFilter;