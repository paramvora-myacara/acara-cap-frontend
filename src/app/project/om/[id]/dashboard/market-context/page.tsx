// src/app/project/om/[id]/dashboard/market-context/page.tsx
'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useProjects } from '@/hooks/useProjects';
import { DashboardShell } from '@/components/om/DashboardShell';
import { QuadrantGrid } from '@/components/om/QuadrantGrid';
import { MetricCard } from '@/components/om/widgets/MetricCard';
import { MiniChart } from '@/components/om/widgets/MiniChart';
import { employerData } from '@/services/mockOMData';
import { Users, Briefcase, Building2, Zap } from 'lucide-react';

export default function MarketContextPage() {
    const params = useParams();
    const projectId = params?.id as string;
    const { getProject } = useProjects();
    const project = projectId ? getProject(projectId) : null;
    
    const [scenario, setScenario] = useState<'base' | 'upside' | 'downside'>('base');
    
    if (!project) return <div>Project not found</div>;
    
    const quadrants = [
        {
            id: 'macro-demographics',
            title: 'Macro & Demographics',
            icon: Users,
            color: 'from-blue-400 to-blue-500',
            metrics: (
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <MetricCard label="Population" value="425,000" size="sm" />
                        <MetricCard label="5yr Growth" value={14.2} format="percent" size="sm" />
                        <MetricCard label="Median Age" value="32.5" size="sm" />
                        <MetricCard label="College Grad%" value={45} format="percent" size="sm" />
                    </div>
                    <div className="pt-2">
                        <p className="text-xs text-gray-500 mb-2">Income Distribution</p>
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span>$100k+</span>
                                <div className="flex items-center">
                                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '35%' }} />
                                    </div>
                                    <span>35%</span>
                                </div>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span>$50-100k</span>
                                <div className="flex items-center">
                                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '40%' }} />
                                    </div>
                                    <span>40%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'employment-drivers',
            title: 'Employment Drivers',
            icon: Briefcase,
            color: 'from-green-400 to-green-500',
            metrics: (
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <MetricCard label="Unemployment" value={3.2} format="percent" size="sm" />
                        <MetricCard label="Job Growth" value={3.5} format="percent" size="sm" change={0.8} />
                    </div>
                    <div className="pt-2">
                        <p className="text-xs text-gray-500 mb-2">Top Employers</p>
                        <div className="space-y-2">
                            {employerData.slice(0, 3).map((emp) => (
                                <div key={emp.name} className="flex justify-between items-center text-xs">
                                    <span className="truncate">{emp.name}</span>
                                    <div className="flex items-center space-x-2">
                                        <span>{emp.employees.toLocaleString()}</span>
                                        <span className={`text-xs ${emp.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {emp.growth >= 0 ? '+' : ''}{emp.growth}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'supply-pipeline',
            title: 'Supply Pipeline',
            icon: Building2,
            color: 'from-blue-400 to-blue-500',
            metrics: (
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <MetricCard label="Units U/C" value="2,450" size="sm" />
                        <MetricCard label="24mo Pipeline" value="4,200" size="sm" />
                    </div>
                    <div className="pt-2">
                        <p className="text-xs text-gray-500 mb-2">Delivery Schedule</p>
                        <MiniChart
                            type="bar"
                            data={[
                                { value: 800 }, { value: 1200 }, { value: 950 },
                                { value: 600 }, { value: 650 }
                            ]}
                            height={60}
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Q3'25</span>
                            <span>Q4'25</span>
                            <span>Q1'26</span>
                            <span>Q2'26</span>
                            <span>Q3'26</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'regulatory-incentives',
            title: 'Regulatory / Incentives',
            icon: Zap,
            color: 'from-green-400 to-green-500',
            metrics: (
                <div className="space-y-3">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                            <span className="text-sm">Opportunity Zone</span>
                            <span className="text-xs text-green-700 font-medium">Qualified</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                            <span className="text-sm">Tax Abatement</span>
                            <span className="text-xs text-blue-700 font-medium">10 Years</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm">Impact Fees</span>
                            <span className="text-xs text-gray-700 font-medium">$12/SF</span>
                        </div>
                    </div>
                    <div className="pt-2 border-t">
                        <p className="text-xs text-gray-500 mb-1">Total Incentive Value</p>
                        <p className="text-lg font-semibold text-green-600">$2.4M</p>
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
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Market Context Details</h2>
                <QuadrantGrid quadrants={quadrants} />
            </div>
        </DashboardShell>
    );
}