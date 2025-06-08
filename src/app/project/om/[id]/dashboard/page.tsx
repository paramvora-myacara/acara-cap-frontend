// src/app/project/om/[id]/dashboard/page.tsx
'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProjects } from '@/hooks/useProjects';
import { DashboardShell } from '@/components/om/DashboardShell';
import { QuadrantGrid } from '@/components/om/QuadrantGrid';
import { MetricCard } from '@/components/om/widgets/MetricCard';
import { MiniChart } from '@/components/om/widgets/MiniChart';
import { AIInsightsBar } from '@/components/om/AIInsightsBar';
import { scenarioData, timelineData, unitMixData } from '@/services/mockOMData';
import { DollarSign, Building, TrendingUp, Users } from 'lucide-react';

export default function OMDashboardPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params?.id as string;
    const { getProject } = useProjects();
    const project = projectId ? getProject(projectId) : null;
    
    const [scenario, setScenario] = useState<'base' | 'upside' | 'downside'>('base');
    const data = scenarioData[scenario];
    
    if (!project) {
        return <div>Project not found</div>;
    }
    
    const quadrants = [
        {
            id: 'deal-snapshot',
            title: 'Deal Snapshot',
            icon: DollarSign,
            color: 'from-blue-400 to-blue-500',
            href: `/project/om/${projectId}/dashboard/deal-snapshot`,
            description: 'Capital requirements, key terms, and timeline',
            metrics: (
                <>
                    <div className="grid grid-cols-2 gap-3">
                        <MetricCard label="Loan Amount" value={data.loanAmount} format="currency" />
                        <MetricCard label="LTV" value={data.ltv} format="percent" />
                        <MetricCard label="DSCR" value={data.dscr} />
                        <MetricCard label="Debt Yield" value={data.debtYield} format="percent" />
                    </div>
                    <div className="mt-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Timeline</p>
                        <div className="flex space-x-1">
                            {timelineData.map((item, idx) => (
                                <div
                                    key={idx}
                                    className={`flex-1 h-2 rounded ${
                                        item.status === 'completed' ? 'bg-green-500' :
                                        item.status === 'current' ? 'bg-blue-500' :
                                        'bg-gray-200'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </>
            )
        },
        {
            id: 'asset-profile',
            title: 'Asset Profile',
            icon: Building,
            color: 'from-green-400 to-green-500',
            href: `/project/om/${projectId}/dashboard/asset-profile`,
            description: 'Property details, unit mix, and comparables',
            metrics: (
                <>
                    <div className="grid grid-cols-2 gap-3">
                        <MetricCard label="Total Units" value={120} />
                        <MetricCard label="Total SF" value="95,000" />
                    </div>
                    <div className="mt-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Unit Mix</p>
                        <MiniChart
                            type="pie"
                            data={unitMixData.map(u => ({ name: u.type, value: u.units }))}
                            height={80}
                            colors={['#3B82F6', '#10B981', '#06B6D4', '#8B5CF6']}
                        />
                    </div>
                </>
            )
        },
        {
            id: 'market-context',
            title: 'Market Context',
            icon: TrendingUp,
            color: 'from-blue-400 to-blue-500',
            href: `/project/om/${projectId}/dashboard/market-context`,
            description: 'Demographics, employment, and supply dynamics',
            metrics: (
                <>
                    <div className="grid grid-cols-2 gap-3">
                        <MetricCard label="Population Growth" value={2.8} format="percent" change={0.3} />
                        <MetricCard label="Job Growth" value={3.5} format="percent" change={0.8} />
                        <MetricCard label="Median Income" value={85000} format="currency" />
                        <MetricCard label="Vacancy Rate" value={data.vacancy} format="percent" />
                    </div>
                    <div className="mt-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Rent Growth Trend</p>
                        <MiniChart
                            type="line"
                            data={[
                                { value: 2.5 }, { value: 3.1 }, { value: 3.8 },
                                { value: 4.2 }, { value: data.rentGrowth }
                            ]}
                            height={60}
                        />
                    </div>
                </>
            )
        },
        {
            id: 'financial-sponsor',
            title: 'Financial & Sponsor',
            icon: Users,
            color: 'from-green-400 to-green-500',
            href: `/project/om/${projectId}/dashboard/financial-sponsor`,
            description: 'Returns, sponsor track record, and sensitivity',
            metrics: (
                <>
                    <div className="grid grid-cols-2 gap-3">
                        <MetricCard label="Project IRR" value={data.irr} format="percent" />
                        <MetricCard label="Equity Multiple" value={`${data.equityMultiple}x`} />
                        <MetricCard label="Sponsor Net Worth" value={25000000} format="currency" />
                        <MetricCard label="Past Deals" value={12} />
                    </div>
                    <div className="mt-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Returns by Scenario</p>
                        <MiniChart
                            type="bar"
                            data={[
                                { value: scenarioData.downside.irr },
                                { value: scenarioData.base.irr },
                                { value: scenarioData.upside.irr }
                            ]}
                            height={60}
                            colors={['#EF4444', '#3B82F6', '#10B981']}
                        />
                    </div>
                </>
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
            <div className="max-w-7xl mx-auto">
                <AIInsightsBar scenario={scenario} />
                <QuadrantGrid quadrants={quadrants} />
            </div>
        </DashboardShell>
    );
}