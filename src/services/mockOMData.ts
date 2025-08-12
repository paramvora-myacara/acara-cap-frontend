// src/services/mockOMData.ts
export const scenarioData = {
    base: {
        loanAmount: 15000000,
        ltv: 75,
        ltc: 80,
        dscr: 1.35,
        debtYield: 8.5,
        irr: 18.5,
        equityMultiple: 2.1,
        rentGrowth: 3,
        exitCap: 5.5,
        constructionCost: 18750000,
        vacancy: 5,
        noi: 1275000,
    },
    upside: {
        loanAmount: 16500000,
        ltv: 72,
        ltc: 78,
        dscr: 1.45,
        debtYield: 9.2,
        irr: 24.5,
        equityMultiple: 2.8,
        rentGrowth: 4.5,
        exitCap: 5.0,
        constructionCost: 18000000,
        vacancy: 3,
        noi: 1517000,
    },
    downside: {
        loanAmount: 13500000,
        ltv: 78,
        ltc: 85,
        dscr: 1.20,
        debtYield: 7.8,
        irr: 12.5,
        equityMultiple: 1.6,
        rentGrowth: 1.5,
        exitCap: 6.5,
        constructionCost: 20000000,
        vacancy: 8,
        noi: 1053000,
    }
};

export const timelineData = [
    { phase: 'LOI Signed', date: '2025-01-15', status: 'completed' },
    { phase: 'Due Diligence', date: '2025-06-07', status: 'current' },
    { phase: 'Term Sheet', date: '2025-07-01', status: 'upcoming' },
    { phase: 'Closing', date: '2025-08-15', status: 'upcoming' },
];

export const unitMixData = [
    { type: 'Studio', units: 24, avgSF: 475, avgRent: 1950 },
    { type: '1BR', units: 48, avgSF: 725, avgRent: 2650 },
    { type: '2BR', units: 36, avgSF: 1100, avgRent: 3850 },
    { type: '3BR', units: 12, avgSF: 1450, avgRent: 5200 },
];

export const marketComps = [
    { name: 'The Modern', yearBuilt: 2023, units: 145, rentPSF: 4.25, capRate: 4.8 },
    { name: 'Park Place Tower', yearBuilt: 2022, units: 200, rentPSF: 4.10, capRate: 5.0 },
    { name: 'Urban Living', yearBuilt: 2024, units: 175, rentPSF: 4.35, capRate: 4.7 },
    { name: 'Metro Heights', yearBuilt: 2021, units: 160, rentPSF: 3.95, capRate: 5.2 },
    { name: 'City View', yearBuilt: 2023, units: 180, rentPSF: 4.20, capRate: 4.9 },
];

export const employerData = [
    { name: 'Tech Corp', employees: 15000, growth: 12 },
    { name: 'Medical Center', employees: 8500, growth: 5 },
    { name: 'Financial Services Inc', employees: 6200, growth: 8 },
    { name: 'University', employees: 4800, growth: 3 },
    { name: 'Manufacturing Co', employees: 3500, growth: -2 },
];

export const sponsorDeals = [
    { project: 'Downtown Mixed-Use', year: 2022, size: 45000000, irr: 22.5, multiple: 2.3 },
    { project: 'Suburban Garden Apts', year: 2021, size: 28000000, irr: 18.2, multiple: 1.9 },
    { project: 'Urban Infill', year: 2020, size: 35000000, irr: 25.8, multiple: 2.6 },
    { project: 'Transit-Oriented Dev', year: 2023, size: 52000000, irr: 19.5, multiple: 2.1 },
    { project: 'Value-Add Portfolio', year: 2019, size: 38000000, irr: 28.3, multiple: 2.8 },
];

// NEW COMPREHENSIVE DATA STRUCTURES FOR OM PAGES

export const dealSnapshotDetails = {
  keyTerms: {
    loanType: "Senior Construction Loan",
    rate: "SOFR + 275bps",
    floor: "4.50%",
    term: "36 months",
    extension: "Two 12-month extensions",
    recourse: "25% Partial Recourse",
    origination: "1.00%",
    exitFee: "0.50%",
    lenderReserves: {
      interest: "12 months",
      taxInsurance: "6 months",
      capEx: "$250,000"
    },
    covenants: {
      minDSCR: "1.20x",
      maxLTV: "80%",
      minLiquidity: "$2,000,000",
      completionGuaranty: "Full completion guaranty"
    }
  },
  
  milestones: [
    { phase: "Initial Underwriting", date: "Jul 1, 2025", status: "completed", duration: 5 },
    { phase: "LOI Execution", date: "Jul 8, 2025", status: "completed", duration: 3 },
    { phase: "Third Party Reports", date: "Jul 15, 2025", status: "current", duration: 10 },
    { phase: "Credit Committee", date: "Jul 25, 2025", status: "upcoming", duration: 2 },
    { phase: "Legal Documentation", date: "Aug 1, 2025", status: "upcoming", duration: 10 },
    { phase: "Closing", date: "Aug 15, 2025", status: "upcoming", duration: 1 }
  ],
  
  riskMatrix: {
    high: [],
    medium: [
      { risk: "Construction Cost Overrun", mitigation: "Fixed-price GMP contract with 5% contingency", probability: "30%" }
    ],
    low: [
      { risk: "Market Demand", mitigation: "35% pre-leased, strong demographic tailwinds", probability: "15%" },
      { risk: "Entitlement", mitigation: "Fully approved, building permits in hand", probability: "5%" }
    ]
  }
};

export const assetProfileDetails = {
  sitePlan: {
    lotSize: "2.5 acres (108,900 SF)",
    buildingFootprint: "28,500 SF",
    parkingSpaces: 130,
    greenSpace: "35% of site",
    zoningDetails: {
      current: "MU-4 (Mixed Use)",
      allowedFAR: "4.0",
      usedFAR: "3.5",
      heightLimit: "100 feet",
      actualHeight: "85 feet",
      setbacks: { front: "25ft", side: "15ft", rear: "20ft" }
    }
  },
  
  amenityDetails: [
    { name: "Resort-Style Pool", size: "3,200 SF", description: "Heated saltwater pool with cabanas" },
    { name: "Fitness Center", size: "2,500 SF", description: "24/7 access, Peloton bikes, free weights" },
    { name: "Sky Lounge", size: "1,800 SF", description: "Rooftop terrace with city views" },
    { name: "Co-Working Space", size: "1,200 SF", description: "Private offices and conference rooms" },
    { name: "Pet Spa", size: "400 SF", description: "Grooming station and dog wash" },
    { name: "Package Concierge", size: "300 SF", description: "Smart lockers with refrigeration" }
  ],
  
  unitMixDetails: {
    studios: { count: 24, avgSF: 475, rentRange: "$1,850-$2,050", deposit: "$500" },
    oneBed: { count: 48, avgSF: 725, rentRange: "$2,450-$2,850", deposit: "$750" },
    twoBed: { count: 36, avgSF: 1050, rentRange: "$3,650-$4,050", deposit: "$1,000" }
  },
  
  comparableDetails: [
    {
      name: "The Modern",
      address: "1234 Main St",
      distance: "0.8 miles",
      yearBuilt: 2023,
      units: 145,
      occupancy: "94%",
      avgRent: "$4.25 PSF",
      lastSale: { date: "Mar 2024", price: "$52M", capRate: "4.8%" }
    },
    {
      name: "Park Place Tower",
      address: "5678 Park Ave",
      distance: "1.2 miles",
      yearBuilt: 2022,
      units: 200,
      occupancy: "96%",
      avgRent: "$4.35 PSF",
      lastSale: { date: "Jan 2024", price: "$68M", capRate: "5.0%" }
    }
  ]
};

export const marketContextDetails = {
  demographicProfile: {
    oneMile: { population: 45000, medianIncome: 72000, medianAge: 29 },
    threeMile: { population: 185000, medianIncome: 68000, medianAge: 31 },
    fiveMile: { population: 425000, medianIncome: 65000, medianAge: 32.5 },
    growthTrends: {
      populationGrowth5yr: "14.2%",
      incomeGrowth5yr: "18.5%",
      jobGrowth5yr: "22.3%"
    }
  },
  
  majorEmployers: [
    { name: "Tech Corp HQ", employees: 15000, growth: "+12%", distance: "2.1 miles" },
    { name: "Regional Medical Center", employees: 8500, growth: "+5%", distance: "1.5 miles" },
    { name: "Financial Services Inc", employees: 6200, growth: "+8%", distance: "3.2 miles" },
    { name: "State University", employees: 4800, growth: "+3%", distance: "4.0 miles" },
    { name: "Aerospace Manufacturing", employees: 3200, growth: "+15%", distance: "5.5 miles" }
  ],
  
  supplyAnalysis: {
    currentInventory: 12500,
    underConstruction: 2450,
    planned24Months: 4200,
    averageOccupancy: "93.5%",
    deliveryByQuarter: [
      { quarter: "Q3 2025", units: 800 },
      { quarter: "Q4 2025", units: 1200 },
      { quarter: "Q1 2026", units: 950 },
      { quarter: "Q2 2026", units: 600 },
      { quarter: "Q3 2026", units: 650 }
    ]
  }
};

export const financialDetails = {
  sourcesUses: {
    sources: [
      { type: "Senior Debt", amount: 15000000, percentage: 80 },
      { type: "Sponsor Equity", amount: 2850000, percentage: 15.2 },
      { type: "LP Equity", amount: 900000, percentage: 4.8 }
    ],
    uses: [
      { type: "Land Acquisition", amount: 4500000, percentage: 24 },
      { type: "Hard Costs", amount: 11200000, percentage: 59.7 },
      { type: "Soft Costs", amount: 2100000, percentage: 11.2 },
      { type: "Financing Costs", amount: 950000, percentage: 5.1 }
    ]
  },
  
  sponsorProfile: {
    firmName: "Premier Development Partners",
    yearFounded: 2008,
    totalDeveloped: "$450M",
    totalUnits: 2850,
    activeProjects: 4,
    principals: [
      { 
        name: "John Smith", 
        role: "Managing Partner", 
        experience: "22 years",
        bio: "John leads the firm's strategic direction and oversees all development activities. He has successfully delivered over 2,000 units across 15 projects with an average IRR of 21.5%.",
        education: "MBA, Harvard Business School",
        specialties: ["Mixed-Use Development", "Urban Infill", "Value-Add"],
        photo: "/api/placeholder/150/150/3B82F6/FFFFFF?text=JS",
        achievements: ["Top 40 Under 40 Developers", "Urban Land Institute Award", "25+ Successful Exits"]
      },
      { 
        name: "Sarah Johnson", 
        role: "Chief Investment Officer", 
        experience: "18 years",
        bio: "Sarah manages the firm's investment strategy and capital relationships. She has structured over $300M in financing and maintains relationships with 25+ institutional lenders.",
        education: "MS Finance, Stanford University",
        specialties: ["Capital Markets", "Structured Finance", "Risk Management"],
        photo: "/api/placeholder/150/150/10B981/FFFFFF?text=SJ",
        achievements: ["CFA Charterholder", "Real Estate Finance Excellence Award", "15+ Debt Fund Relationships"]
      }
    ],
    trackRecord: [
      { project: "Downtown Mixed-Use", year: 2023, units: 180, irr: "22.5%", status: "Completed", market: "Downtown", type: "Mixed-Use" },
      { project: "Suburban Garden Apts", year: 2022, units: 220, irr: "18.2%", status: "Completed", market: "Suburban", type: "Residential" },
      { project: "Urban Infill Tower", year: 2021, units: 165, irr: "25.8%", status: "Completed", market: "Urban Core", type: "Residential" },
      { project: "Transit-Oriented Dev", year: 2020, units: 145, irr: "20.3%", status: "Completed", market: "Transit Hub", type: "Mixed-Use" },
      { project: "Value-Add Portfolio", year: 2019, units: 320, irr: "28.5%", status: "Completed", market: "Multiple", type: "Portfolio" }
    ],
    references: [
      { firm: "National Bank", contact: "Available upon request", relationship: "Primary Lender", years: "8+ years" },
      { firm: "Regional Debt Fund", contact: "Available upon request", relationship: "Mezzanine Partner", years: "5+ years" },
      { firm: "Insurance Company", contact: "Available upon request", relationship: "Permanent Lender", years: "3+ years" }
    ]
  },
  
  returnProjections: {
    base: { irr: 18.5, multiple: 2.1, profitMargin: 28 },
    upside: { irr: 24.5, multiple: 2.8, profitMargin: 35 },
    downside: { irr: 12.5, multiple: 1.6, profitMargin: 18 }
  }
};

export const certifications = {
  badges: [
    { name: "Opportunity Zone", status: "Qualified", icon: "shield-check" },
    { name: "Energy Star", status: "Pending", icon: "leaf" },
    { name: "LEED Silver", status: "Targeting", icon: "award" }
  ]
};

export const capitalStackData = {
    base: {
        totalCapitalization: 18750000,
        sources: [
            { type: "Senior Construction Loan", amount: 15000000, percentage: 80, rate: "SOFR + 275bps", term: "36 months" },
            { type: "Sponsor Equity", amount: 2850000, percentage: 15.2, contribution: "Cash", timing: "Upfront" },
            { type: "LP Equity", amount: 900000, percentage: 4.8, contribution: "Cash", timing: "Upfront" }
        ],
        uses: [
            { type: "Land Acquisition", amount: 4500000, percentage: 24, timing: "Month 0" },
            { type: "Hard Costs", amount: 11200000, percentage: 59.7, timing: "Months 1-18" },
            { type: "Soft Costs", amount: 2100000, percentage: 11.2, timing: "Months 1-18" },
            { type: "Financing Costs", amount: 950000, percentage: 5.1, timing: "Month 0" }
        ],
        debtTerms: {
            loanType: "Senior Construction Loan",
            lender: "Regional Bank",
            rate: "SOFR + 275bps",
            floor: "4.50%",
            term: "36 months",
            extension: "Two 12-month extensions available",
            recourse: "25% Partial Recourse",
            origination: "1.00%",
            exitFee: "0.50%",
            reserves: {
                interest: "12 months",
                taxInsurance: "6 months",
                capEx: "$250,000"
            }
        }
    },
    upside: {
        totalCapitalization: 18000000,
        sources: [
            { type: "Senior Construction Loan", amount: 16500000, percentage: 91.7, rate: "SOFR + 250bps", term: "36 months" },
            { type: "Sponsor Equity", amount: 1500000, percentage: 8.3, contribution: "Cash", timing: "Upfront" }
        ],
        uses: [
            { type: "Land Acquisition", amount: 4200000, percentage: 23.3, timing: "Month 0" },
            { type: "Hard Costs", amount: 10800000, percentage: 60, timing: "Months 1-18" },
            { type: "Soft Costs", amount: 2000000, percentage: 11.1, timing: "Months 1-18" },
            { type: "Financing Costs", amount: 1000000, percentage: 5.6, timing: "Month 0" }
        ],
        debtTerms: {
            loanType: "Senior Construction Loan",
            lender: "Regional Bank",
            rate: "SOFR + 250bps",
            floor: "4.25%",
            term: "36 months",
            extension: "Two 12-month extensions available",
            recourse: "20% Partial Recourse",
            origination: "0.75%",
            exitFee: "0.25%",
            reserves: {
                interest: "10 months",
                taxInsurance: "6 months",
                capEx: "$200,000"
            }
        }
    },
    downside: {
        totalCapitalization: 20000000,
        sources: [
            { type: "Senior Construction Loan", amount: 13500000, percentage: 67.5, rate: "SOFR + 325bps", term: "36 months" },
            { type: "Sponsor Equity", amount: 5000000, percentage: 25, contribution: "Cash", timing: "Upfront" },
            { type: "LP Equity", amount: 1500000, percentage: 7.5, contribution: "Cash", timing: "Upfront" }
        ],
        uses: [
            { type: "Land Acquisition", amount: 4800000, percentage: 24, timing: "Month 0" },
            { type: "Hard Costs", amount: 12000000, percentage: 60, timing: "Months 1-18" },
            { type: "Soft Costs", amount: 2500000, percentage: 12.5, timing: "Months 1-18" },
            { type: "Financing Costs", amount: 700000, percentage: 3.5, timing: "Month 0" }
        ],
        debtTerms: {
            loanType: "Senior Construction Loan",
            lender: "Regional Bank",
            rate: "SOFR + 325bps",
            floor: "4.75%",
            term: "36 months",
            extension: "One 12-month extension available",
            recourse: "35% Partial Recourse",
            origination: "1.25%",
            exitFee: "0.75%",
            reserves: {
                interest: "15 months",
                taxInsurance: "8 months",
                capEx: "$300,000"
            }
        }
    }
};