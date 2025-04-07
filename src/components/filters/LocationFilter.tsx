// components/filters/LocationFilter.tsx
'use client';

import React, { useState } from 'react';
import { ButtonSelect } from '../../components/ui/ButtonSelect';
import { Info } from 'lucide-react';

interface LocationFilterProps {
  value: string[];
  onChange: (newValue: string[]) => void;
}

const LocationFilter: React.FC<LocationFilterProps> = ({ value, onChange }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const locationOptions = [
    "nationwide", "Northeast", "Southeast", "Midwest",
    "Southwest", "West Coast", "Other"
  ];

  return (
    <div className="mb-3">
      <div className="flex items-center mb-2">
        <h3 className="font-semibold text-sm">Locations</h3>
        <div className="relative ml-2">
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            aria-label="Location Information"
          >
            <Info size={16} />
          </button>
          {showTooltip && (
            <div className="absolute z-10 w-64 p-2 mt-2 text-xs bg-white rounded-md shadow-lg border border-gray-200 -translate-x-1/2 left-1/2">
              Select the geographic region(s) of your project. Many lenders focus on specific regions.
            </div>
          )}
        </div>
      </div>
      <ButtonSelect
        options={locationOptions}
        value={value}
        onChange={onChange}
        size="sm"
      />
    </div>
  );
};

export default LocationFilter;