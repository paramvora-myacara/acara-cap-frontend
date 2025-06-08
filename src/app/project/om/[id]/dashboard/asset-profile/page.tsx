// src/app/project/om/[id]/dashboard/asset-profile/page.tsx
'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useProjects } from '@/hooks/useProjects';
import { DashboardShell } from '@/components/om/DashboardShell';
import { QuadrantGrid } from '@/components/om/QuadrantGrid';
import { MetricCard } from '@/components/om/widgets/MetricCard';
import { MiniChart } from '@/components/om/widgets/MiniChart';
import { unitMixData, marketComps } from '@/services/mockOMData';
import { MapPin, Home, Package, Building2 } from 'lucide-react';

export default function AssetProfilePage() {
    const params = useParams();
    const projectId = params?.id as string;
    const { getProject } = useProjects();
    const project = projectId ? getProject(projectId) : null;
    
    const [scenario, setScenario] = useState<'base' | 'upside' | 'downside'>('base');
    
    if (!project) return <div>Project not found</div>;
    
    const quadrants = [
        {
            id: 'site-zoning',
            title: 'Site & Zoning',
            icon: MapPin,
            color: 'from-purple-400 to-purple-500',
            metrics: (
                <div className="space-y-3">
                    <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center text-gray-400">
                        Site Map Placeholder
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <p className="text-gray-500">Lot Size</p>
                            <p className="font-medium">2.5 Acres</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Zoning</p>
                            <p className="font-medium">MU-4</p>
                        </div>
                        <div>
                            <p className="text-gray-500">FAR</p>
                            <p className="font-medium">3.5 / 4.0</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Height</p>
                            <p className="font-medium">85' / 100'</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'design-amenities',
            title: 'Design & Amenities',
            icon: Home,
            color: 'from-blue-400 to-blue-500',
            metrics: (
                <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                        {['Pool', 'Gym', 'Lounge', 'Rooftop', 'Co-work', 'Pet Spa'].map((amenity) => (
                            <div key={amenity} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded text-center">
                                {amenity}
                            </div>
                        ))}
                    </div>
                    <div className="pt-2">
                        <p className="text-xs text-gray-500 mb-2">Building Stats</p>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Stories</span>
                                <span className="font-medium">8</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Parking Ratio</span>
                                <span className="font-medium">1.2 / unit</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Efficiency</span>
                                <span className="font-medium">85%</span>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'unit-economics',
            title: 'Unit Economics',
            icon: Package,
            color: 'from-green-400 to-green-500',
            metrics: (
                <div className="space-y-3">
                    <MiniChart
                        type="bar"
                        data={unitMixData.map(u => ({ value: u.avgRent }))}
                        height={80}
                    />
                    <div className="space-y-2">
                        {unitMixData.slice(0, 3).map((unit) => (
                            <div key={unit.type} className="flex justify-between text-sm">
                                <span>{unit.type}</span>
                                <span>{unit.units} units</span>
                                <span className="font-medium">${unit.avgRent}</span>
                            </div>
                        ))}
                    </div>
                    <div className="pt-2 border-t text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Avg Rent PSF</span>
                            <span className="font-medium">$4.20</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'comparable-assets',
            title: 'Comparable Assets',
            icon: Building2,
            color: 'from-amber-400 to-amber-500',
            metrics: (
                <div className="space-y-3">
                    <div className="space-y-2">
                        {marketComps.slice(0, 3).map((comp) => (
                            <div key={comp.name} className="p-2 bg-gray-50 rounded">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium">{comp.name}</p>
                                        <p className="text-xs text-gray-500">{comp.units} units • {comp.yearBuilt}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">${comp.rentPSF} PSF</p>
                                        <p className="text-xs text-gray-500">{comp.capRate}% cap</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        }
    ];
    
    return (
        <DashboardShell
            projectId={projectId}
            projectName={project.projectName}
            currentScenario={scenario}
            onScenarioChange={setScenario}
        >
            <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Asset Profile Details</h2>
                <QuadrantGrid quadrants={quadrants} />
            </div>
        </DashboardShell>
    );
}