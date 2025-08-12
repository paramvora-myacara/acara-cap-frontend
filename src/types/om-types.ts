// src/types/om-types.ts
export interface OMScenarioData {
    loanAmount: number;
    ltv: number;
    ltc: number;
    dscr: number;
    debtYield: number;
    irr: number;
    equityMultiple: number;
    rentGrowth: number;
    exitCap: number;
    constructionCost: number;
    vacancy: number;
    noi: number;
}

export interface TimelineItem {
    phase: string;
    date: string;
    status: 'completed' | 'current' | 'upcoming';
}

export interface UnitMix {
    type: string;
    units: number;
    avgSF: number;
    avgRent: number;
}

export interface MarketComp {
    name: string;
    yearBuilt: number;
    units: number;
    rentPSF: number;
    capRate: number;
}

// Added for Talk to OM structured responses
export type OmQaAssumptionSource = 'om' | 'industry' | 'mixed';

export interface OmQaAssumption {
  text: string;
  source: OmQaAssumptionSource;
  citation?: string; // single section string; optional if not applicable
}

export interface OmQaResponse {
  answer_markdown: string;
  assumptions: OmQaAssumption[];
}