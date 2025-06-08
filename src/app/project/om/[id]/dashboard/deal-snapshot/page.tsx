// src/app/project/om/[id]/dashboard/deal-snapshot/page.tsx
'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useProjects } from '@/hooks/useProjects';
import { DashboardShell } from '@/components/om/DashboardShell';
import { QuadrantGrid } from '@/components/om/QuadrantGrid';
import { MetricCard } from '@/components/om/widgets/MetricCard';
import { scenarioData } from '@/services/mockOMData';
import { Layers, FileText, Calendar, AlertTriangle } from 'lucide-react';

export default function DealSnapshotPage() {
    const params = useParams();
    const projectId = params?.id as string;
    const { getProject } = useProjects();
    const project = projectId ? getProject(projectId) : null;
    
    const [scenario, setScenario] = useState<'base' | 'upside' | 'downside'>('base');
    const data = scenarioData[scenario];
    
    if (!project) return <div>Project not found</div>;
    
    const quadrants = [
        {
            id: 'capital-stack',
            title: 'Capital Stack',
            icon: Layers,
            color: 'from-blue-400 to-blue-500',
            href: `/project/om/${projectId}/dashboard/deal-snapshot/capital-stack`,
            metrics: (
                <div className="space-y-3">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Senior Debt</span>
                            <span className="font-medium">{data.ltc}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div className="bg-blue-500 h-full" style={{ width: `${data.ltc}%` }} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Equity</span>
                            <span className="font-medium">{100 - data.ltc}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div className="bg-green-500 h-full" style={{ width: `${100 - data.ltc}%` }} />
                        </div>
                    </div>
                    <MetricCard label="Total Capitalization" value={data.constructionCost} format="currency" size="sm" />
                </div>
            )
        },
        {
            id: 'key-terms',
            title: 'Key Terms',
            icon: FileText,
            color: 'from-purple-400 to-purple-500',
            href: `/project/om/${projectId}/dashboard/deal-snapshot/key-terms`,
            metrics: (
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm">
                            <p className="text-gray-500">Rate</p>
                            <p className="font-medium">SOFR + 275</p>
                        </div>
                        <div className="text-sm">
                            <p className="text-gray-500">Term</p>
                            <p className="font-medium">3+1+1 Years</p>
                        </div>
                        <div className="text-sm">
                            <p className="text-gray-500">Recourse</p>
                            <p className="font-medium">25% Partial</p>
                        </div>
                        <div className="text-sm">
                            <p className="text-gray-500">Origination</p>
                            <p className="font-medium">1.0%</p>
                        </div>
                    </div>
                    <div className="pt-2 border-t">
                        <p className="text-xs text-gray-500 mb-1">Key Covenants</p>
                        <ul className="text-xs space-y-1">
                            <li>• Min DSCR: 1.20x</li>
                            <li>• Max LTV: 80%</li>
                            <li>• Completion Guaranty</li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            id: 'milestones',
            title: 'Milestones',
            icon: Calendar,
            color: 'from-green-400 to-green-500',
            href: `/project/om/${projectId}/dashboard/deal-snapshot/milestones`,
            metrics: (
                <div className="space-y-3">
                    <div className="space-y-2">
                        {[
                            { name: 'Term Sheet', date: 'Jul 1, 2025', status: 'upcoming' },
                            { name: 'Due Diligence', date: 'Jul 15, 2025', status: 'upcoming' },
                            { name: 'Closing', date: 'Aug 15, 2025', status: 'target' }
                        ].map((milestone, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <span className="text-sm">{milestone.name}</span>
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs text-gray-500">{milestone.date}</span>
                                    <div className={`w-2 h-2 rounded-full ${
                                        milestone.status === 'target' ? 'bg-amber-400' : 'bg-gray-300'
                                    }`} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: 'risk-flags',
            title: 'Risk Flags & Mitigants',
            icon: AlertTriangle,
            color: 'from-amber-400 to-amber-500',
            href: `/project/om/${projectId}/dashboard/deal-snapshot/risk-flags`,
            metrics: (
                <div className="space-y-3">
                    <div className="space-y-2">
                        {[
                            { risk: 'Construction', level: 'Medium', mitigant: 'Fixed-price GMP' },
                            { risk: 'Market', level: 'Low', mitigant: 'Pre-leasing 35%' },
                            { risk: 'Entitlement', level: 'Low', mitigant: 'Fully approved' }
                        ].map((item, idx) => (
                            <div key={idx} className="p-2 bg-gray-50 rounded">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium">{item.risk}</p>
                                        <p className="text-xs text-gray-500">{item.mitigant}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded ${
                                        item.level === 'Low' ? 'bg-green-100 text-green-700' :
                                        item.level === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                        {item.level}
                                    </span>
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
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Deal Snapshot Details</h2>
                <QuadrantGrid quadrants={quadrants} />
            </div>
        </DashboardShell>
    );
}