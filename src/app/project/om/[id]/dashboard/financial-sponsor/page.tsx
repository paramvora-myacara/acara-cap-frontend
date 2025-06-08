// src/app/project/om/[id]/dashboard/financial-sponsor/page.tsx
'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useProjects } from '@/hooks/useProjects';
import { DashboardShell } from '@/components/om/DashboardShell';
import { QuadrantGrid } from '@/components/om/QuadrantGrid';
import { MetricCard } from '@/components/om/widgets/MetricCard';
import { MiniChart } from '@/components/om/widgets/MiniChart';
import { scenarioData, sponsorDeals } from '@/services/mockOMData';
import { DollarSign, BarChart3, Users, Activity } from 'lucide-react';

export default function FinancialSponsorPage() {
    const params = useParams();
    const projectId = params?.id as string;
    const { getProject } = useProjects();
    const project = projectId ? getProject(projectId) : null;
    
    const [scenario, setScenario] = useState<'base' | 'upside' | 'downside'>('base');
    const data = scenarioData[scenario];
    
    if (!project) return <div>Project not found</div>;
    
    const quadrants = [
        {
            id: 'sources-uses',
            title: 'Sources & Uses',
            icon: DollarSign,
            color: 'from-green-400 to-green-500',
            metrics: (
                <div className="space-y-3">
                    <div className="space-y-2">
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Sources</p>
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span>Senior Debt</span>
                                <span className="font-medium">${(data.loanAmount / 1000000).toFixed(1)}M</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Equity</span>
                                <span className="font-medium">${((data.constructionCost - data.loanAmount) / 1000000).toFixed(1)}M</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2 pt-2 border-t">
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Uses</p>
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span>Land</span>
                                <span>$4.5M</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Hard Costs</span>
                                <span>$11.2M</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Soft Costs</span>
                                <span>$3.1M</span>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'underwriting-metrics',
            title: 'Underwriting Metrics',
            icon: BarChart3,
            color: 'from-blue-400 to-blue-500',
            metrics: (
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <MetricCard label="Yield on Cost" value={7.8} format="percent" size="sm" />
                        <MetricCard label="Stabilized Cap" value={5.5} format="percent" size="sm" />
                        <MetricCard label="Dev Spread" value={2.3} format="percent" size="sm" />
                        <MetricCard label="Profit Margin" value={28} format="percent" size="sm" />
                    </div>
                    <div className="pt-2">
                        <p className="text-xs text-gray-500 mb-2">5-Year Cash Flow</p>
                        <MiniChart
                            type="line"
                            data={[
                                { value: -2.5 }, { value: 0.8 }, { value: 1.2 },
                                { value: 1.4 }, { value: 15.5 }
                            ]}
                            height={60}
                        />
                    </div>
                </div>
            )
        },
        {
            id: 'sponsor-team',
            title: 'Sponsor & Team',
            icon: Users,
            color: 'from-green-400 to-green-500',
            metrics: (
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm">
                            <p className="text-gray-500">Experience</p>
                            <p className="font-medium">15+ Years</p>
                        </div>
                        <div className="text-sm">
                            <p className="text-gray-500">Total Developed</p>
                            <p className="font-medium">$450M</p>
                        </div>
                    </div>
                    <div className="pt-2">
                        <p className="text-xs text-gray-500 mb-2">Recent Performance</p>
                        <div className="space-y-2">
                            {sponsorDeals.slice(0, 3).map((deal) => (
                                <div key={deal.project} className="flex justify-between items-center text-xs">
                                    <span className="truncate flex-1">{deal.project}</span>
                                    <span className="font-medium text-green-600 ml-2">{deal.irr}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'sensitivity-stress',
            title: 'Sensitivity / Stress Tests',
            icon: Activity,
            color: 'from-blue-400 to-blue-500',
            metrics: (
                <div className="space-y-3">
                    <div className="space-y-2">
                        <p className="text-xs text-gray-500 mb-2">IRR Sensitivity</p>
                        <div className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                                <span>Exit Cap +50bps</span>
                                <div className="flex items-center">
                                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                        <div className="bg-red-500 h-2 rounded-full" style={{ width: '60%' }} />
                                    </div>
                                    <span className="text-red-600">-3.2%</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span>Rents -5%</span>
                                <div className="flex items-center">
                                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                        <div className="bg-red-500 h-2 rounded-full" style={{ width: '45%' }} />
                                    </div>
                                    <span className="text-red-600">-2.5%</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span>Costs +10%</span>
                                <div className="flex items-center">
                                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                        <div className="bg-red-500 h-2 rounded-full" style={{ width: '75%' }} />
                                    </div>
                                    <span className="text-red-600">-4.1%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="pt-2 border-t">
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Break-even Occupancy</span>
                            <span className="font-medium">78%</span>
                        </div>
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
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Financial & Sponsor Details</h2>
                <QuadrantGrid quadrants={quadrants} />
            </div>
        </DashboardShell>
    );
}