'use client';

import { dealSnapshotDetails } from '@/services/mockOMData';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function KeyTermsPage() {
  const [expandedCovenants, setExpandedCovenants] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Key Terms</h1>
        <p className="text-gray-600 mt-2">Comprehensive loan structure and terms overview</p>
      </div>

      {/* Basic Loan Terms */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Loan Structure</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Loan Type</p>
              <p className="font-semibold">{dealSnapshotDetails.keyTerms.loanType}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Interest Rate</p>
              <p className="font-semibold">{dealSnapshotDetails.keyTerms.rate}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Floor Rate</p>
              <p className="font-semibold">{dealSnapshotDetails.keyTerms.floor}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Term</p>
              <p className="font-semibold">{dealSnapshotDetails.keyTerms.term}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Extensions</p>
              <p className="font-semibold">{dealSnapshotDetails.keyTerms.extension}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Recourse</p>
              <p className="font-semibold">{dealSnapshotDetails.keyTerms.recourse}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fees and Reserves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Fees</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Origination Fee</span>
                <Badge variant="secondary">{dealSnapshotDetails.keyTerms.origination}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Exit Fee</span>
                <Badge variant="secondary">{dealSnapshotDetails.keyTerms.exitFee}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Lender Reserves</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Interest Reserve</span>
                <Badge variant="outline">{dealSnapshotDetails.keyTerms.lenderReserves.interest}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tax & Insurance</span>
                <Badge variant="outline">{dealSnapshotDetails.keyTerms.lenderReserves.taxInsurance}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">CapEx Reserve</span>
                <Badge variant="outline">{dealSnapshotDetails.keyTerms.lenderReserves.capEx}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Covenants */}
      <Card>
        <CardHeader 
          className="cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setExpandedCovenants(!expandedCovenants)}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Financial Covenants</h3>
            {expandedCovenants ? (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-500" />
            )}
          </div>
        </CardHeader>
        {expandedCovenants && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Minimum DSCR</p>
                <p className="font-semibold">{dealSnapshotDetails.keyTerms.covenants.minDSCR}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Maximum LTV</p>
                <p className="font-semibold">{dealSnapshotDetails.keyTerms.covenants.maxLTV}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Minimum Liquidity</p>
                <p className="font-semibold">{dealSnapshotDetails.keyTerms.covenants.minLiquidity}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Completion Guaranty</p>
                <p className="font-semibold">{dealSnapshotDetails.keyTerms.covenants.completionGuaranty}</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
} 