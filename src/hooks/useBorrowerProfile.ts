// src/hooks/useBorrowerProfile.ts
import { useContext } from 'react';
import { BorrowerProfileContext } from '../contexts/BorrowerProfileContext';

export function useBorrowerProfile() {
  const context = useContext(BorrowerProfileContext);
  
  if (context === undefined) {
    throw new Error('useBorrowerProfile must be used within a BorrowerProfileProvider');
  }
  
  return context;
}