import React from 'react';

export const GraphIntro: React.FC = () => {
  return (
    <div className="bg-blue-50 rounded-lg p-6 max-w-3xl mx-auto mb-8 text-center">
      <h2 className="text-xl font-semibold text-blue-800 mb-3">Find Your Ideal Lender Match</h2>
      <p className="text-gray-700 leading-relaxed">
        Select all filters in the sidebar to narrow down your search. The graph will dynamically update to reveal your best lender matches.
        <span className="block mt-2 text-blue-600 font-semibold">
          Pro Tip: Click on the brightest red node to explore lender details!
        </span>
      </p>
    </div>
  );
};