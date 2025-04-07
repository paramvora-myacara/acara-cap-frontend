// components/filters/LocationFilter.tsx
'use client';

import React from 'react';
import { MultiSelect } from '../../components/ui/MultiSelect';

interface LocationFilterProps {
  value: string[];
  onChange: (newValue: string[]) => void;
}

const LocationFilter: React.FC<LocationFilterProps> = ({ value, onChange }) => {
  const locationOptions = [
    "nationwide", "Northeast", "Southeast", "Midwest",
    "Southwest", "West Coast", "Other"
  ];

  return (
    <div className="mb-3">
      <h3 className="font-semibold mb-2 text-sm">Locations</h3>
      <MultiSelect
        options={locationOptions}
        value={value}
        onChange={onChange}
        size="sm"
      />
    </div>
  );
};

export default LocationFilter;
