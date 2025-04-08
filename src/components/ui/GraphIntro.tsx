// src/components/ui/GraphIntro.tsx
import React from 'react';

export const GraphIntro: React.FC = () => {
  return (
    <div className="bg-blue-50 rounded-lg p-6 max-w-3xl mx-auto mb-8 text-center">
      <h2 className="text-xl font-semibold text-blue-800 mb-3">Find Your Ideal Lender Match</h2>
      <p className="text-gray-700">
        Select all filters in the sidebar to narrow down your search. The graph will update to show your best matches.
        Click on the highest matched lender (brightest red node) to view details and proceed with your application.
      </p>
    </div>
  );
};