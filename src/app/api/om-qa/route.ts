import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();
    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Missing question' }, { status: 400 });
    }

    // OM content embedded directly in the code
    const omText = `# Downtown Highrise - Offering Memorandum

## Deal Snapshot Details

### Capital Stack
- **Total Capitalization**: $18,750,000
- **Senior Debt**: 80%
- **Equity**: 20%

### Key Terms
- **Rate**: SOFR + 275
- **Term**: 3+1+1 Years
- **Recourse**: 25% Partial
- **Origination**: 1.0%
- **Key Covenants**:
    - Min DSCR: 1.20x
    - Max LTV: 80%
    - Completion Guaranty

### Milestones
- **Term Sheet**: Jul 1, 2025
- **Due Diligence**: Jul 15, 2025
- **Closing**: Aug 15, 2025

### Risk Flags & Mitigants
- **Construction**: Fixed-price GMP (Medium)
- **Market**: Pre-leasing 35% (Low)
- **Entitlement**: Fully approved (Low)

---

## Asset Profile Details

### Site & Zoning
- **Lot Size**: 2.5 Acres
- **Zoning**: MU-4
- **FAR**: 3.5 / 4.0
- **Height**: 85' / 100'
- **Site Map**: Placeholder

### Design & Amenities
- **Amenities**: Pool, Gym, Lounge, Rooftop, Co-work, Pet Spa
- **Building Stats**:
    - **Stories**: 8
    - **Parking Ratio**: 1.2 / unit
    - **Efficiency**: 85%

### Unit Economics
- **Studio**: 24 units, $1950
- **1BR**: 48 units, $2650
- **2BR**: 36 units, $3850
- **Avg Rent PSF**: $4.20

### Comparable Assets
- **The Modern** (145 units • 2023): $4.25 PSF, 4.8% cap
- **Park Place Tower** (200 units • 2022): $4.35 PSF, 5% cap
- **Urban Living** (175 units • 2024): $4.35 PSF, 4.7% cap

---

## Market Context Details

### Macro & Demographics
- **Population**: 425,000
- **5YR Growth**: 14.2%
- **Median Age**: 32.5
- **College Grad %**: 45%
- **Income Distribution**:
    - $100k+: 35%
    - $50-100k: 40%

### Employment Drivers
- **Unemployment**: 3.2%
- **Job Growth**: 3.5% (↑ 0.8%)
- **Top Employers**:
    - Tech Corp: 15,000 (+12%)
    - Medical Center: 8,500 (+5%)
    - Financial Services Inc: 6,200 (+8%)

### Supply Pipeline
- **Units U/C**: 2,450
- **24MO Pipeline**: 4,200
- **Delivery Schedule**: Q3'25, Q4'25, Q1'26, Q2'26, Q3'26

### Regulatory / Incentives
- **Opportunity Zone**: Qualified
- **Tax Abatement**: 10 Years
- **Impact Fees**: $12/SF
- **Total Incentive Value**: $2.4M

---

## Financial & Sponsor Details

### Sources & Uses
- **Sources**:
    - Senior Debt: $15.0M
    - Equity: $3.8M
- **Uses**:
    - Land: $4.5M
    - Hard Costs: $11.2M
    - Soft Costs: $3.1M

### Underwriting Metrics
- **Yield on Cost**: 7.8%
- **Stabilized Cap**: 5.5%
- **Dev Spread**: 2.3%
- **Profit Margin**: 28%
- **5-Year Cash Flow**: (graphical data)

### Sponsor & Team
- **Experience**: 15+ Years
- **Total Developed**: $450M
- **Recent Performance**:
    - Downtown Mixed-Use: 22.5%
    - Suburban Garden Apts: 18.2%
    - Urban Infill: 25.8%

### Sensitivity / Stress Tests
- **IRR Sensitivity**:
    - Exit Cap +50bps: -3.2%
    - Rents -5%: -2.5%
    - Costs +10%: -4.1%
- **Break-even Occupancy**: 78%

---

## Deal Scenarios & AI Insights

### Downside Scenario
*Conservative scenario maintains acceptable returns with clear risk mitigants.*

**AI Insights**
- **Construction Cost Containment**: GMP contract with 5% contingency may be insufficient in prolonged inflation scenario. Consider increasing to 8% contingency or negotiating shared savings structure.
- **Downside Protection**: Even at 8% vacancy and 6.5% exit cap, project maintains 1.20x DSCR and delivers 12.5% IRR. Debt structure provides 18-month interest reserve cushion.
- **Alternative Exit Strategy**: Consider partial condo conversion for top 2 floors. Market analysis shows $850/SF condo pricing vs. $650/SF rental valuation, potentially recovering 15% of equity in downside scenario.

**Key Metrics**
- **Loan Amount**: $13,500,000
- **LTV**: 78%
- **DSCR**: 1.2
- **Debt Yield**: 7.8%
- **Project IRR**: 12.5%
- **Equity Multiple**: 1.6x
- **Vacancy Rate**: 8%
- **Sponsor Net Worth**: $25,000,000
- **Past Deals**: 12

---

### Base Case Scenario
*Strong fundamentals with balanced risk-return profile.*

**AI Insights**
- **Market Timing Advantage**: Current market conditions suggest a 6-12 month window of favorable construction pricing before anticipated material cost increases. Lock in GMP contract now to capture 8-12% savings vs. 2026 projections.
- **Sponsor Track Record Validation**: Sponsor's previous 5 projects in similar markets achieved average IRRs of 22.5%, exceeding pro forma by 3.2%. Strong execution capability demonstrated in value-add multifamily segment.
- **Lease-Up Risk Mitigation**: Recommend securing anchor commercial tenant (15% of NOI) pre-construction. Current LOIs from 3 national credit tenants could reduce lease-up period by 4-6 months.
- **Hidden Value Opportunity**: Adjacent parcel (0.8 acres) available for $2.1M. Combined development could increase project IRR by 4.5% through economies of scale and enhanced amenity package.

**Key Metrics**
- **Loan Amount**: $15,000,000
- **LTV**: 75%
- **DSCR**: 1.35
- **Debt Yield**: 8.5%
- **Project IRR**: 18.5%
- **Equity Multiple**: 2.1x
- **Vacancy Rate**: 5%
- **Sponsor Net Worth**: $25,000,000
- **Past Deals**: 12

---

### Upside Scenario
*Exceptional return potential with manageable execution risks.*

**AI Insights**
- **Rent Growth Acceleration**: Tech sector expansion (3 new HQs announced within 2 miles) positions property for 5-6% annual rent growth vs. 3% market average. Comparable properties seeing 15% premium.
- **Exit Multiple Expansion**: Institutional buyer activity increasing 40% YoY in submarket. Cap rate compression of 50-75 bps likely by stabilization, adding $4.2M to exit value.
- **Tax Optimization Strategy**: Property qualifies for Opportunity Zone benefits. Structure as QOF to enhance LP returns by 8-12% through capital gains deferral and step-up basis.

**Key Metrics**
- **Loan Amount**: $16,500,000
- **LTV**: 72%
- **DSCR**: 1.45
- **Debt Yield**: 9.2%
- **Project IRR**: 24.5%
- **Equity Multiple**: 2.8x
- **Vacancy Rate**: 3%
- **Sponsor Net Worth**: $25,000,000
- **Past Deals**: 12

---
*AI insights generated based on pattern analysis of 2,847 similar transactions in comparable markets. Confidence levels: 91% (Downside), 94% (Base), 87% (Upside).*`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = [
      'You are a super genius expert analyst in Commercial Real Estate with over 20+ years of experience in the field.',
      'You have analyzed thousands of deals, advised major institutional investors, and have an unparalleled understanding of CRE markets, underwriting, and investment strategies.',
      'Your role is to answer questions based on your exceptional expertise about this deal.',
      'When you make financial projections, state your assumptions, and do your best to ground them in the contents of the documents.',
      'Response Structure:',
      '1. ANSWER: Provide a direct answer to the question in maximum 3 lines',
      '2. ASSUMPTIONS: List key assumptions with their sources (from OM document or industry knowledge)',
      'Rules:',
      '(1) Leverage your 20+ years of CRE expertise to provide insightful analysis and projections.',
      '(2) When making projections or analysis, clearly state your assumptions and reasoning.',
      '(3) Ground analysis in OM facts when available, but feel free to apply your extensive industry knowledge and best practices.',
      '(4) You can make reasonable projections and estimates based on your exceptional expertise, even if not explicitly stated in the OM.',
      '(5) Provide professional, analytical responses that would be valuable to investors and lenders.',
      '(6) Use bullet points and clear formatting for readability.',
      '(7) Keep responses concise and to the point - prioritize brevity while maintaining analytical depth.',
      '(8) Always structure responses with ANSWER (max 3 lines) followed by ASSUMPTIONS with sources.',
      '(9) When using industry knowledge or estimates, clearly indicate this in your assumptions.',
      '(10) Draw from your vast experience to provide insights that go beyond basic analysis.'
    ].join(' ');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text:
                `Offering Memorandum Document:\n${omText}\n\n` +
                `User Question:\n${question}\n\n` +
                `As an expert commercial real estate analyst, structure your response as follows:
1. ANSWER: Provide a direct answer to the question in maximum 3 lines
2. ASSUMPTIONS: List key assumptions with their sources (from OM document or industry knowledge)

Base your analysis on your expertise and the OM content. You can make reasonable projections and estimates based on your industry knowledge, even if not explicitly stated in the OM. When making projections or analysis, clearly state your assumptions and ground them in available data or industry best practices.`
            }
          ]
        }
      ],
      config: {
        systemInstruction,
        thinkingConfig: { thinkingBudget: 0 },
        // Optional caps for ultra-concise output:
        // maxOutputTokens: 512,
      }
    });

    const answer = (response.text || '').trim();
    return NextResponse.json({ answer });
  } catch (e: any) {
    console.error('om-qa error:', e);
    return NextResponse.json({ error: 'Failed to get answer' }, { status: 500 });
  }
} 