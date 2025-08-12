// src/components/om/QuadrantGrid.tsx
import React from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils/cn';
import { LucideIcon, Expand } from 'lucide-react';

export interface QuadrantData {
    id: string;
    title: string;
    icon: LucideIcon;
    color: string;
    metrics?: React.ReactNode;
    description?: string;
    href?: string;
}

interface QuadrantGridProps {
    quadrants: QuadrantData[];
    className?: string;
}

export const QuadrantGrid: React.FC<QuadrantGridProps> = ({ quadrants, className }) => {
    const router = useRouter();
    
    return (
        <div className={cn("grid grid-cols-2 gap-6", className)}>
            {quadrants.map((quadrant) => {
                const Icon = quadrant.icon;
                
                return (
                    <div
                        key={quadrant.id}
                        onClick={() => quadrant.href && router.push(quadrant.href)}
                        className={cn(
                            "bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group",
                            quadrant.href && "cursor-pointer"
                        )}
                    >
                        <div className={cn(
                            "h-2 bg-gradient-to-r",
                            quadrant.color
                        )} />
                        
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center">
                                    <div className={cn(
                                        "p-3 rounded-lg",
                                        quadrant.color.includes('blue') && "bg-blue-50",
                                        quadrant.color.includes('green') && "bg-green-50"
                                    )}>
                                        <Icon className={cn(
                                            "h-6 w-6",
                                            quadrant.color.includes('blue') && "text-blue-600",
                                            quadrant.color.includes('green') && "text-green-600"
                                        )} />
                                    </div>
                                    <h3 className="ml-3 text-lg font-semibold text-gray-800">
                                        {quadrant.title}
                                    </h3>
                                </div>
                                {quadrant.href && (
                                    <Expand className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                                )}
                            </div>
                            
                            {quadrant.description && (
                                <p className="text-sm text-gray-600 mb-4">{quadrant.description}</p>
                            )}
                            
                            {quadrant.metrics && (
                                <div className="space-y-3">
                                    {quadrant.metrics}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};