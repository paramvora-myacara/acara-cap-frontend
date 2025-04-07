// src/hooks/useLenders.ts
import { useContext } from 'react';
import { LenderContext } from '../contexts/LenderContext';

export function useLenders() {
  const context = useContext(LenderContext);
  
  if (context === undefined) {
    throw new Error('useLenders must be used within a LenderProvider');
  }
  
  return context;
}