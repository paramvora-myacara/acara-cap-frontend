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