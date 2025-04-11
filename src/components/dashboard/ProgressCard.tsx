// src/components/dashboard/ProgressCard.tsx
import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/Button';
import { ChevronRight, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface ProgressCardProps {
  title: string;
  description: string;
  percentage: number;
  status: string;
  actionText: string;
  actionUrl: string;
  icon: React.ReactNode;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  title,
  description,
  percentage,
  status,
  actionText,
  actionUrl,
  icon,
}) => {
  const router = useRouter();

  // Get status icon
  const getStatusIcon = () => {
    if (percentage === 100) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (percentage < 30) return <AlertCircle className="h-4 w-4 text-amber-600" />;
    return <Clock className="h-4 w-4 text-blue-600" />;
  };

  // Get status text and color
  const getStatusInfo = () => {
    if (status === 'needed') {
      return {
        label: 'Action Needed',
        color: 'bg-red-100 text-red-800'
      };
    }
    
    if (percentage === 100) {
      return {
        label: 'Complete',
        color: 'bg-green-100 text-green-800'
      };
    }
    
    if (percentage < 30) {
      return {
        label: 'Just Started',
        color: 'bg-amber-100 text-amber-800'
      };
    }
    
    if (percentage < 70) {
      return {
        label: 'In Progress',
        color: 'bg-blue-100 text-blue-800'
      };
    }
    
    return {
      label: 'Almost Complete',
      color: 'bg-teal-100 text-teal-800'
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg">
            {icon}
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Completion</span>
            <div className="flex items-center">
              {getStatusIcon()}
              <span className="font-medium text-gray-800 ml-1">{percentage}%</span>
            </div>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div 
              className={`h-full rounded-full ${
                percentage === 100 ? 'bg-green-600' : 'bg-blue-600'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
          
          <Button 
            variant="outline"
            rightIcon={<ChevronRight size={16} />}
            onClick={() => router.push(actionUrl)}
            size="sm"
          >
            {actionText}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};