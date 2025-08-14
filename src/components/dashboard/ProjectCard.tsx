// src/components/dashboard/ProjectCard.tsx
import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/Button';
import { ChevronRight, CheckCircle, Zap, Calendar, Building } from 'lucide-react'; // Added Building
import { ProjectProfile } from '@/types/enhanced-types';

interface ProjectCardProps {
  project: ProjectProfile;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const router = useRouter();

  const completeness = project.completenessPercent || 0;
  const progressColor = completeness === 100 ? 'bg-green-600' : 'bg-blue-600';

  // Format date helper (could be moved to utils)
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) { return 'Invalid Date'; }
  };

  // Get status color helper (could be moved to utils)
  const getStatusColorClasses = (status: string) => {
     switch (status) {
        case 'Draft': return 'bg-gray-100 text-gray-800';
        case 'Info Gathering': return 'bg-blue-100 text-blue-800';
        case 'Advisor Review': return 'bg-amber-100 text-amber-800';
        case 'Matches Curated': return 'bg-purple-100 text-purple-800';
        case 'Introductions Sent': return 'bg-indigo-100 text-indigo-800';
        case 'Term Sheet Received': return 'bg-teal-100 text-teal-800';
        case 'Closed': return 'bg-green-100 text-green-800';
        default: return 'bg-red-100 text-red-800'; // For Stalled/Withdrawn
     }
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow h-full flex flex-col"> {/* Ensure card takes full height */}
      <CardContent className="p-4 md:p-6 flex flex-col flex-grow"> {/* Adjusted padding and flex grow */}
        {/* Header: Name and Status */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-800 truncate mr-2" title={project.projectName || 'Unnamed Project'}>
            {project.projectName || 'Unnamed Project'}
          </h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColorClasses(project.projectStatus)}`}>
            {project.projectStatus === 'Closed' ? <CheckCircle className="h-3 w-3 mr-1" /> : <Zap className="h-3 w-3 mr-1" />}
            {project.projectStatus}
          </span>
        </div>

        {/* Details: Asset Type & Last Updated */}
        <div className="text-sm text-gray-500 mb-4 space-y-1">
           <p className="flex items-center">
                <Building className="h-4 w-4 mr-1.5 flex-shrink-0" />
                {project.assetType || 'N/A'}
           </p>
           <p className="flex items-center">
                <Calendar className="h-4 w-4 mr-1.5 flex-shrink-0" />
                Updated: {formatDate(project.updatedAt)}
           </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-4 mt-auto"> {/* Pushed progress to bottom */}
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Completion</span>
            <span className={`font-medium ${completeness === 100 ? 'text-green-600' : 'text-blue-600'}`}>
              {completeness}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
              style={{ width: `${completeness}%` }}
            />
          </div>
        </div>

        {/* See OM Button - Only show for 100% complete projects */}
        {completeness === 100 && (
          <Button
            variant="primary"
            fullWidth
            onClick={() => router.push(`/project/om/${project.id}`)}
            className="mb-2 flex-shrink-0 bg-green-600 hover:bg-green-700 text-white"
          >
            See OM
          </Button>
        )}

        {/* Action Button */}
        <Button
          variant="outline"
          fullWidth
          rightIcon={<ChevronRight size={16} />}
          onClick={() => router.push(`/project/workspace/${project.id}`)} // Link to workspace
          className="flex-shrink-0" // Prevent button shrinking
        >
          View / Edit Project
        </Button>
      </CardContent>
    </Card>
  );
};