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