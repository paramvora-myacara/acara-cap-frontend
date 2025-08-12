'use client';

import { marketContextDetails } from '@/services/mockOMData';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, TrendingUp, BarChart3, Clock } from 'lucide-react';

export default function SupplyDemandPage() {
  const getOccupancyColor = (occupancy: string) => {
    const occ = parseFloat(occupancy);
    if (occ >= 95) return 'bg-green-100 text-green-800';
    if (occ >= 90) return 'bg-blue-100 text-blue-800';
    if (occ >= 85) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getSupplyStatusColor = (status: string) => {
    switch (status) {
      case 'current':
        return 'bg-blue-100 text-blue-800';
      case 'underConstruction':
        return 'bg-yellow-100 text-yellow-800';
      case 'planned':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalSupply = marketContextDetails.supplyAnalysis.currentInventory + 
                     marketContextDetails.supplyAnalysis.underConstruction + 
                     marketContextDetails.supplyAnalysis.planned24Months;

  const supplyUtilization = ((marketContextDetails.supplyAnalysis.currentInventory + 
                             marketContextDetails.supplyAnalysis.underConstruction) / totalSupply) * 100;

  return (
    <div className="space-y-6 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Supply & Demand</h1>
        <p className="text-gray-600 mt-2">Market supply analysis and demand trends</p>
      </div>

      {/* Supply Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <Building2 className="h-5 w-5 text-blue-500 mr-2" />
              <h3 className="text-lg font-semibold">Current Supply</h3>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              {marketContextDetails.supplyAnalysis.currentInventory.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">Available units</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-yellow-500 mr-2" />
              <h3 className="text-lg font-semibold">Under Construction</h3>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">
              {marketContextDetails.supplyAnalysis.underConstruction.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">Units in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <BarChart3 className="h-5 w-5 text-purple-500 mr-2" />
              <h3 className="text-lg font-semibold">Planned 24M</h3>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">
              {marketContextDetails.supplyAnalysis.planned24Months.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">Future units</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <h3 className="text-lg font-semibold">Occupancy</h3>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {marketContextDetails.supplyAnalysis.averageOccupancy}
            </p>
            <p className="text-sm text-gray-500 mt-1">Current average</p>
          </CardContent>
        </Card>
      </div>

      {/* Supply Pipeline Chart */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Supply Pipeline</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Current Inventory</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {marketContextDetails.supplyAnalysis.currentInventory.toLocaleString()} units
                </span>
                <Badge className="bg-blue-100 text-blue-800">Available</Badge>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="h-4 rounded-full bg-blue-500"
                style={{ width: `${(marketContextDetails.supplyAnalysis.currentInventory / totalSupply) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Under Construction</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {marketContextDetails.supplyAnalysis.underConstruction.toLocaleString()} units
                </span>
                <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="h-4 rounded-full bg-yellow-500"
                style={{ width: `${(marketContextDetails.supplyAnalysis.underConstruction / totalSupply) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Planned 24 Months</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {marketContextDetails.supplyAnalysis.planned24Months.toLocaleString()} units
                </span>
                <Badge className="bg-purple-100 text-purple-800">Planned</Badge>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="h-4 rounded-full bg-purple-500"
                style={{ width: `${(marketContextDetails.supplyAnalysis.planned24Months / totalSupply) * 100}%` }}
              />
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">Total Supply</span>
                <Badge className="bg-gray-100 text-gray-800">{totalSupply.toLocaleString()} units</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quarterly Delivery Schedule */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Quarterly Delivery Schedule</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {marketContextDetails.supplyAnalysis.deliveryByQuarter.map((quarter, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{quarter.quarter}</h4>
                  <Badge className="bg-blue-100 text-blue-800">
                    {quarter.units.toLocaleString()} units
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full bg-blue-500"
                    style={{ width: `${(quarter.units / Math.max(...marketContextDetails.supplyAnalysis.deliveryByQuarter.map(q => q.units))) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Supply Utilization</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">{supplyUtilization.toFixed(1)}%</span>
                </div>
                <p className="text-sm text-gray-600">Current supply utilization</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Available Units</span>
                  <Badge variant="outline">
                    {marketContextDetails.supplyAnalysis.currentInventory.toLocaleString()}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pipeline Units</span>
                  <Badge variant="outline">
                    {(marketContextDetails.supplyAnalysis.underConstruction + marketContextDetails.supplyAnalysis.planned24Months).toLocaleString()}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Market</span>
                  <Badge variant="outline">{totalSupply.toLocaleString()}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Occupancy Trends</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">
                    {marketContextDetails.supplyAnalysis.averageOccupancy}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Current market occupancy</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Market Status</span>
                  <Badge className={getOccupancyColor(marketContextDetails.supplyAnalysis.averageOccupancy)}>
                    {parseFloat(marketContextDetails.supplyAnalysis.averageOccupancy) >= 95 ? 'Tight' : 
                     parseFloat(marketContextDetails.supplyAnalysis.averageOccupancy) >= 90 ? 'Balanced' : 'Soft'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Demand Trend</span>
                  <Badge className="bg-green-100 text-green-800">↑ Growing</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Supply Pressure</span>
                  <Badge className="bg-yellow-100 text-yellow-800">Moderate</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Insights */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Market Insights</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Supply Strengths</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">•</span>
                  Limited luxury supply
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">•</span>
                  High occupancy rates
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">•</span>
                  Controlled pipeline
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Market Opportunities</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="text-blue-500 mr-2">•</span>
                  Growing demand base
                </li>
                <li className="flex items-center">
                  <span className="text-blue-500 mr-2">•</span>
                  Premium positioning
                </li>
                <li className="flex items-center">
                  <span className="text-blue-500 mr-2">•</span>
                  Limited competition
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Risk Factors</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="text-yellow-500 mr-2">•</span>
                  Pipeline delivery timing
                </li>
                <li className="flex items-center">
                  <span className="text-yellow-500 mr-2">•</span>
                  Economic sensitivity
                </li>
                <li className="flex items-center">
                  <span className="text-yellow-500 mr-2">•</span>
                  Interest rate impact
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supply Map Placeholder */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Supply Map</h3>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Interactive Supply Map</p>
            <p className="text-gray-500 text-sm mt-1">Coming soon - Geographic visualization of supply pipeline</p>
            <div className="mt-4 p-4 bg-white rounded border-2 border-dashed border-gray-300">
              <p className="text-sm text-gray-500">Supply pipeline map will be integrated here</p>
              <p className="text-xs text-gray-400 mt-1">Including current inventory and future deliveries</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 