import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const OmQaSchema = z.object({
  answer_markdown: z.string(),
  assumptions: z.array(
    z.object({
      text: z.string(),
      source: z.enum(['om', 'industry', 'mixed']),
      citation: z.string().optional(), // single section string
    })
  ),
});

const system = [
  'You are a super genius expert analyst in Commercial Real Estate with 20+ years experience.',
  'Answer using the OM content; be professional and analytical.',
  'Output must match the provided JSON schema exactly. Return JSON only.',
].join(' ');

const MODEL_NAME = 'gemini-1.5-pro'; // use a model your key supports

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

    const { object } = await generateObject({
      model: google(MODEL_NAME),
      system,
      schema: OmQaSchema,
      prompt:
        `Offering Memorandum Document:\n${omText}\n\n` +
        `User Question:\n${question}\n\n` +
        `Return only JSON matching the schema.`,
    });

    console.log('Generated object:', object);
    console.log('Object type:', typeof object);
    console.log('Object keys:', Object.keys(object || {}));
    console.log('answer_markdown type:', typeof object?.answer_markdown);
    console.log('assumptions type:', typeof object?.assumptions);
    console.log('assumptions length:', object?.assumptions?.length);

    const response = { data: object };
    console.log('Final API response:', response);
    
    return NextResponse.json(response);
  } catch (e: any) {
    console.error('om-qa error:', e);
    return NextResponse.json({ error: 'Failed to get answer' }, { status: 500 });
  }
} 