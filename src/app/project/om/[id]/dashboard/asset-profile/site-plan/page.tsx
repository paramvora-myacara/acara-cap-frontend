'use client';

import { assetProfileDetails } from '@/services/mockOMData';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building2, TreePine, Car } from 'lucide-react';

export default function SitePlanPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Site Plan</h1>
        <p className="text-gray-600 mt-2">Comprehensive site analysis and zoning information</p>
      </div>

      {/* Site Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-blue-500 mr-2" />
              <h3 className="text-lg font-semibold">Lot Size</h3>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{assetProfileDetails.sitePlan.lotSize}</p>
            <p className="text-sm text-gray-500 mt-1">Total site area</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <Building2 className="h-5 w-5 text-green-500 mr-2" />
              <h3 className="text-lg font-semibold">Building</h3>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{assetProfileDetails.sitePlan.buildingFootprint}</p>
            <p className="text-sm text-gray-500 mt-1">Building footprint</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <Car className="h-5 w-5 text-purple-500 mr-2" />
              <h3 className="text-lg font-semibold">Parking</h3>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-600">{assetProfileDetails.sitePlan.parkingSpaces}</p>
            <p className="text-sm text-gray-500 mt-1">Parking spaces</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <TreePine className="h-5 w-5 text-emerald-500 mr-2" />
              <h3 className="text-lg font-semibold">Green Space</h3>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">{assetProfileDetails.sitePlan.greenSpace}</p>
            <p className="text-sm text-gray-500 mt-1">Site coverage</p>
          </CardContent>
        </Card>
      </div>

      {/* Zoning Details */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Zoning Information</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Current Zoning</p>
                <p className="font-semibold">{assetProfileDetails.sitePlan.zoningDetails.current}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Allowed FAR</p>
                <p className="font-semibold">{assetProfileDetails.sitePlan.zoningDetails.allowedFAR}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Used FAR</p>
                <p className="font-semibold">{assetProfileDetails.sitePlan.zoningDetails.usedFAR}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Height Limit</p>
                <p className="font-semibold">{assetProfileDetails.sitePlan.zoningDetails.heightLimit}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Actual Height</p>
                <p className="font-semibold">{assetProfileDetails.sitePlan.zoningDetails.actualHeight}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">FAR Utilization</p>
                <Badge variant="outline">
                  {Math.round((parseFloat(assetProfileDetails.sitePlan.zoningDetails.usedFAR) / parseFloat(assetProfileDetails.sitePlan.zoningDetails.allowedFAR)) * 100)}%
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Setbacks</p>
                <div className="space-y-1">
                  <p className="text-xs text-gray-600">Front: {assetProfileDetails.sitePlan.zoningDetails.setbacks.front}</p>
                  <p className="text-xs text-gray-600">Side: {assetProfileDetails.sitePlan.zoningDetails.setbacks.side}</p>
                  <p className="text-xs text-gray-600">Rear: {assetProfileDetails.sitePlan.zoningDetails.setbacks.rear}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Site Map Placeholder */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Interactive Site Map</h3>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Interactive Site Map</p>
            <p className="text-gray-500 text-sm mt-1">Coming soon - Interactive visualization of site layout</p>
            <div className="mt-4 p-4 bg-white rounded border-2 border-dashed border-gray-300">
              <p className="text-sm text-gray-500">Site map visualization will be integrated here</p>
              <p className="text-xs text-gray-400 mt-1">Including building footprint, parking, and green spaces</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Site Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Site Efficiency</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Building Coverage</span>
                <Badge variant="secondary">
                  {Math.round((parseFloat(assetProfileDetails.sitePlan.buildingFootprint.replace(/[^\d]/g, '')) / 108900) * 100)}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Parking Ratio</span>
                <Badge variant="secondary">
                  {Math.round(assetProfileDetails.sitePlan.parkingSpaces / 108)} spaces/acre
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Green Space Ratio</span>
                <Badge variant="secondary">{assetProfileDetails.sitePlan.greenSpace}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Development Potential</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">FAR Remaining</span>
                <Badge variant="outline">
                  {(parseFloat(assetProfileDetails.sitePlan.zoningDetails.allowedFAR) - parseFloat(assetProfileDetails.sitePlan.zoningDetails.usedFAR)).toFixed(1)}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Height Remaining</span>
                <Badge variant="outline">
                  {(parseInt(assetProfileDetails.sitePlan.zoningDetails.heightLimit) - parseInt(assetProfileDetails.sitePlan.zoningDetails.actualHeight))} feet
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Zoning Compliance</span>
                <Badge className="bg-green-100 text-green-800">Compliant</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 