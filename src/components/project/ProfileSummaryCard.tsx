// src/components/project/ProfileSummaryCard.tsx
import React from 'react';
import { useRouter } from 'next/navigation';
// *** REMOVED CardTitle, CardDescription from import ***
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/Button';
import { User, Edit } from 'lucide-react';
import { BorrowerProfile } from '@/types/enhanced-types';

interface ProfileSummaryCardProps {
  profile: BorrowerProfile | null;
  isLoading: boolean;
}

export const ProfileSummaryCard: React.FC<ProfileSummaryCardProps> = ({ profile, isLoading }) => {
  const router = useRouter();

  const handleEditClick = () => {
    router.push('/profile'); // Navigate to the dedicated profile edit page
  };

  const completeness = profile?.completenessPercent || 0;
  const progressColor = completeness === 100 ? 'bg-green-600' : 'bg-blue-600';

  return (
    <Card className="mb-6 shadow-sm border border-gray-200"> {/* Added subtle border */}
      <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0 border-b bg-gray-50/50 px-4 py-3 md:px-6 md:py-4"> {/* Adjusted padding & added bg */}
        <div className="flex items-center space-x-3">
           <div className="p-3 rounded-full bg-blue-100 text-blue-600 flex-shrink-0">
               <User className="h-5 w-5" />
           </div>
           {/* *** USE STANDARD TAGS *** */}
           <div className='flex-grow'>
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 leading-tight">Borrower Profile</h3>
                <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                    {profile ? 'Review or update your details.' : 'Complete your profile.'}
                </p>
           </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleEditClick} disabled={isLoading} className="ml-4 flex-shrink-0"> {/* Added margin */}
          <Edit className="mr-1.5 h-3.5 w-3.5" /> {/* Slightly smaller icon */}
          {profile ? 'Edit' : 'Create'} {/* Shorter text */}
        </Button>
      </CardHeader>
      <CardContent className="p-4 md:p-6"> {/* Adjusted padding */}
        {isLoading ? (
          <div className="h-16 flex items-center justify-center text-gray-500">Loading profile...</div> // Increased height
        ) : profile ? (
            <>
                <div className="text-sm text-gray-700 mb-4 space-y-1.5"> {/* Increased spacing */}
                    <p><span className="font-medium text-gray-800 w-20 inline-block">Name:</span> {profile.fullLegalName || 'N/A'}</p>
                    <p><span className="font-medium text-gray-800 w-20 inline-block">Entity:</span> {profile.primaryEntityName || 'N/A'} <span className='text-gray-500'>({profile.primaryEntityStructure})</span></p>
                    <p><span className="font-medium text-gray-800 w-20 inline-block">Contact:</span> {profile.contactEmail} {profile.contactPhone && <span className='text-gray-500'> | {profile.contactPhone}</span>}</p>
                </div>
                <div className="w-full">
                    <div className="flex justify-between mb-1 text-sm">
                        <span className="font-medium text-gray-700">Profile Completeness</span>
                        <span className={`font-semibold ${completeness === 100 ? 'text-green-600' : 'text-blue-600'}`}>
                            {completeness}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div
                            className={`h-2.5 rounded-full transition-all duration-500 ${progressColor}`}
                            style={{ width: `${completeness}%` }}
                        />
                    </div>
                </div>
          </>
        ) : (
          <div className="text-center py-6 text-gray-500">
            No profile found. Please create one to get started.
             <Button size="sm" onClick={handleEditClick} className="mt-3">Create Profile</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};