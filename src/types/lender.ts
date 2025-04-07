// types/lender.ts

export interface LenderProfile {
    match_score: number;
    lender_id: number;
    name: string;
    asset_types: string[];
    deal_types: string[];
    capital_types: string[];
    min_deal_size: number;
    max_deal_size: number;
    locations: string[];
    preference_scope: {
      asset_types: number;
      deal_types: number;
      capital_types: number;
      locations: number;
      deal_size: number;
    };
    user?: {
      email?: string;
      phone?: string;
    };
    debt_ranges?: string[];
    description?: string;
}