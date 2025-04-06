// lib/utils.ts

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { LenderProfile } from '../types/lender';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface UserFilters {
  asset_types: string[];
  deal_types: string[];
  capital_types: string[];
  debt_ranges: string[];
  locations: string[];
  requested_amount?: number;
}

export interface LenderWithScore extends LenderProfile {
  match_score: number;
}

/**
 * Helper to parse a debt range string into a numeric range (in dollars).
 *
 * Supported formats include:
 * - "$0 - $5M", "0-5M", "$0 to 5M" → { min: 0, max: 5000000 }
 * - "$100M+" → { min: 100000000, max: Infinity }
 */
export function parseDebtRange(rangeStr: string): { min: number; max: number } | null {
  if (!rangeStr) return null;
  // Remove spaces, commas, and dollar signs.
  let cleaned = rangeStr.replace(/\s/g, '').replace(/[,]/g, '').replace(/\$/g, '');
  
  // Check if the string ends with a plus sign.
  const hasPlus = cleaned.endsWith('+');
  if (hasPlus) {
    cleaned = cleaned.slice(0, -1);
  }
  
  // Determine the delimiter: '-' or 'to' (case-insensitive).
  let delimiter = '';
  if (cleaned.includes('-')) {
    delimiter = '-';
  } else if (cleaned.toLowerCase().includes('to')) {
    delimiter = 'to';
  }
  
  // If no delimiter, assume a single number (min = max).
  if (!delimiter) {
    const num = parseFloat(cleaned.replace(/M/gi, '')) * ( /M/i.test(cleaned) ? 1000000 : 1);
    return { min: num, max: num };
  }
  
  const parts = cleaned.split(delimiter);
  if (parts.length < 1) return null;
  
  const min = parseFloat(parts[0].replace(/M/gi, '')) * ( /M/i.test(parts[0]) ? 1000000 : 1);
  const max = parts[1] ? parseFloat(parts[1].replace(/M/gi, '')) * ( /M/i.test(parts[1]) ? 1000000 : 1) : min;
  return { min, max: hasPlus ? Infinity : max };
}

/**
 * Helper to format a number (in dollars) to a string in millions.
 * For example, 2000000 becomes "$2M".
 */
function formatToMillion(amount: number): string {
  return `$${(amount / 1000000).toFixed(0)}M`;
}

/**
 * Derives a lender's debt range string from min_deal_size and max_deal_size.
 * For example, if min_deal_size = 2000000 and max_deal_size = 50000000,
 * it returns "$2M - $50M".
 */
function deriveDebtRange(lender: LenderProfile): string {
  return `${formatToMillion(lender.min_deal_size)} - ${formatToMillion(lender.max_deal_size)}`;
}

/**
 * Calculates match scores for lenders based on user filters.
 *
 * For each filter category:
 * - If the lender does not match the user-selected filters, the score is reduced by
 *   a factor based on the lender's preference_scope.
 *
 * For debt ranges:
 * - If the lender has a defined debt_ranges array, those are used.
 * - Otherwise, we derive a debt range from min_deal_size and max_deal_size.
 * - Both the user's selected debt_ranges and the lender's debt range(s) are parsed
 *   into numeric ranges, and a match is counted if any overlap exists.
 */
export function calculateMatchScores(lenders: LenderProfile[], filters: Partial<UserFilters> = {}): LenderWithScore[] {
  // Ensure all filter keys exist as arrays.
  const safeFilters: UserFilters = {
    asset_types: filters.asset_types || [],
    deal_types: filters.deal_types || [],
    capital_types: filters.capital_types || [],
    debt_ranges: filters.debt_ranges || [],
    locations: filters.locations || [],
    requested_amount: filters.requested_amount,
  };

  return lenders.map(lender => {
    let matchScore = 1;

    // --- Asset Types Matching ---
    if (safeFilters.asset_types.length > 0) {
      const assetTypeMatch = safeFilters.asset_types.some(filterAssetType =>
        lender.asset_types.includes(filterAssetType)
      );
      if (!assetTypeMatch) {
        matchScore *= (1 - lender.preference_scope.asset_types);
      }
    }

    // --- Deal Types Matching ---
    if (safeFilters.deal_types.length > 0) {
      const dealTypeMatch = safeFilters.deal_types.some(filterDealType =>
        lender.deal_types.includes(filterDealType)
      );
      if (!dealTypeMatch) {
        matchScore *= (1 - lender.preference_scope.deal_types);
      }
    }

    // --- Capital Types Matching ---
    if (safeFilters.capital_types.length > 0) {
      const capitalTypeMatch = safeFilters.capital_types.some(filterCapitalType =>
        lender.capital_types.includes(filterCapitalType)
      );
      if (!capitalTypeMatch) {
        matchScore *= (1 - lender.preference_scope.capital_types);
      }
    }

    // --- Locations Matching ---
    if (safeFilters.locations.length > 0) {
      const locationMatch =
        lender.locations.includes("nationwide") ||
        lender.locations.some(loc => safeFilters.locations.includes(loc));
      if (!locationMatch) {
        matchScore *= (1 - lender.preference_scope.locations);
      }
    }

    // --- Debt Range Matching ---
    if (safeFilters.debt_ranges.length > 0) {
      let debtRangeMatched = false;
      // Use lender.debt_ranges if defined and non-empty; otherwise, derive it.
      const lenderDebtRanges: string[] = (lender.debt_ranges && lender.debt_ranges.length > 0)
        ? lender.debt_ranges
        : [deriveDebtRange(lender)];
      
      const filterRanges = safeFilters.debt_ranges
        .map(range => parseDebtRange(range))
        .filter(Boolean) as { min: number; max: number }[];
      const lenderRanges = lenderDebtRanges
        .map(range => parseDebtRange(range))
        .filter(Boolean) as { min: number; max: number }[];
      
      // Check for any overlap between any filter range and any lender range.
      for (const f of filterRanges) {
        for (const l of lenderRanges) {
          if (f.min <= l.max && f.max >= l.min) {
            debtRangeMatched = true;
            break;
          }
        }
        if (debtRangeMatched) break;
      }
      if (!debtRangeMatched) {
        matchScore *= (1 - lender.preference_scope.deal_size);
      }
    }

    return {
      ...lender,
      match_score: Math.max(0, matchScore),
    };
  });
}
