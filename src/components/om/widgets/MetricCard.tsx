// src/components/om/widgets/MetricCard.tsx
import React from 'react';
import { cn } from '@/utils/cn';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
    label: string;
    value: string | number;
    change?: number;
    format?: 'currency' | 'percent' | 'number';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
    label,
    value,
    change,
    format = 'number',
    size = 'md',
    className
}) => {
    const formattedValue = () => {
        if (typeof value === 'number') {
            switch (format) {
                case 'currency':
                    return new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                    }).format(value);
                case 'percent':
                    return `${value}%`;
                default:
                    return value.toLocaleString();
            }
        }
        return value;
    };
    
    return (
        <div className={cn("bg-gray-50 rounded-lg p-3", className)}>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
            <div className="flex items-end justify-between">
                <p className={cn(
                    "font-semibold",
                    size === 'sm' && "text-lg",
                    size === 'md' && "text-xl",
                    size === 'lg' && "text-2xl"
                )}>
                    {formattedValue()}
                </p>
                {change !== undefined && (
                    <div className={cn(
                        "flex items-center text-xs",
                        change >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                        {change >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                        {Math.abs(change)}%
                    </div>
                )}
            </div>
        </div>
    );
};