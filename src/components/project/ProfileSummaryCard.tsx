// src/components/project/ProfileSummaryCard.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
// *** REMOVED CardTitle, CardDescription from import ***
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/Button';
import { User, Edit, Check, X } from 'lucide-react';
import { BorrowerProfile } from '@/types/enhanced-types';
import { useBorrowerProfile } from '@/hooks/useBorrowerProfile';

interface ProfileSummaryCardProps {
  profile: BorrowerProfile | null;
  isLoading: boolean;
}

export const ProfileSummaryCard: React.FC<ProfileSummaryCardProps> = ({ profile, isLoading }) => {
  const router = useRouter();
  const { updateBorrowerProfile } = useBorrowerProfile();
  
  // Inline editing state
  const [editingField, setEditingField] = useState<'name' | 'entity' | 'email' | null>(null);
  const [editValues, setEditValues] = useState({
    name: '',
    entity: '',
    email: ''
  });

  const handleEditClick = () => {
    router.push('/profile'); // Navigate to the dedicated profile edit page
  };

  const completeness = profile?.completenessPercent || 0;
  const progressColor = completeness === 100 ? 'bg-green-600' : 'bg-blue-600';

  // Helper function to get display values with better placeholders
  const getDisplayValue = (value: string | undefined, placeholder: string) => {
    if (!value || value.trim() === '') {
      return placeholder;
    }
    return value;
  };

  // Start editing a field
  const startEditing = (field: 'name' | 'entity' | 'email') => {
    setEditingField(field);
    setEditValues({
      name: profile?.fullLegalName || '',
      entity: profile?.primaryEntityName || '',
      email: profile?.contactEmail || ''
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingField(null);
    setEditValues({
      name: '',
      entity: '',
      email: ''
    });
  };

  // Save changes
  const saveChanges = async () => {
    if (!profile || !editingField) return;

    try {
      const updates: Partial<BorrowerProfile> = {};
      
      if (editingField === 'name') {
        updates.fullLegalName = editValues.name;
      } else if (editingField === 'entity') {
        updates.primaryEntityName = editValues.entity;
      } else if (editingField === 'email') {
        updates.contactEmail = editValues.email;
      }

      console.log('Saving profile updates:', updates);
      
      // Pass manual=true to ensure immediate storage persistence
      const updatedProfile = await updateBorrowerProfile(updates, true);
      console.log('Profile updated successfully:', updatedProfile);
      
      setEditingField(null);
      
              // Profile copied successfully
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      // Keep the editing state open so user can retry
              // Profile update failed
    }
  };

  // Handle input changes
  const handleInputChange = (field: 'name' | 'entity' | 'email', value: string) => {
    setEditValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Get the consolidated title with key information
  const getConsolidatedTitle = () => {
    if (!profile) {
      return 'Borrower Profile';
    }

    const name = getDisplayValue(profile.fullLegalName, 'Name');
    const entity = getDisplayValue(profile.primaryEntityName, 'Entity');
    const contact = profile.contactEmail || 'Email';

    return `${name} | ${entity} | ${contact}`;
  };

  // Render editable field
  const renderEditableField = (field: 'name' | 'entity' | 'email', label: string, value: string) => {
    const isEditing = editingField === field;
    
    if (isEditing) {
      return (
        <div className="flex items-center space-x-1">
          <input
            type="text"
            value={editValues[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                saveChanges();
              } else if (e.key === 'Escape') {
                cancelEditing();
              }
            }}
          />
          <button
            onClick={saveChanges}
            className="p-1 text-green-600 hover:bg-green-100 rounded"
            title="Save"
          >
            <Check className="h-3 w-3" />
          </button>
          <button
            onClick={cancelEditing}
            className="p-1 text-red-600 hover:bg-red-100 rounded"
            title="Cancel"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={() => startEditing(field)}
        className="hover:bg-blue-50 px-1 py-0.5 rounded text-left transition-colors"
        title={`Click to edit ${label.toLowerCase()}`}
      >
        {getDisplayValue(value, label)}
      </button>
    );
  };

  return (
    <Card className="mb-3 shadow-sm border border-gray-200"> {/* Reduced from mb-4 to give more space for the form */}
      <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0 border-b bg-gray-50/50 px-4 py-3 md:px-6 md:py-4"> {/* Adjusted padding & added bg */}
        <div className="flex items-center space-x-3">
           <div className="p-3 rounded-full bg-blue-100 text-blue-600 flex-shrink-0">
               <User className="h-5 w-5" />
           </div>
           {/* *** USE STANDARD TAGS *** */}
           <div className='flex-grow min-w-0'> {/* Added min-w-0 for text truncation */}
                <h3 className="text-base md:text-lg lg:text-xl font-semibold text-gray-800 leading-tight break-words">
                  {profile ? (
                    <div className="flex items-center space-x-2">
                      {renderEditableField('name', 'Name', profile.fullLegalName || '')}
                      <span className="text-gray-400">|</span>
                      {renderEditableField('entity', 'Entity', profile.primaryEntityName || '')}
                      <span className="text-gray-400">|</span>
                      {renderEditableField('email', 'Email', profile.contactEmail || '')}
                    </div>
                  ) : (
                    'Borrower Profile'
                  )}
                </h3>
                <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                    {profile ? 'Click on any field to edit, or use Edit button for full profile.' : 'Complete your profile.'}
                </p>
           </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleEditClick} disabled={isLoading} className="ml-4 flex-shrink-0"> {/* Added margin */}
          <Edit className="mr-1.5 h-3.5 w-3.5" /> {/* Slightly smaller icon */}
          {profile ? 'Edit' : 'Create'} {/* Shorter text */}
        </Button>
      </CardHeader>
      <CardContent className="p-3 md:p-4">
        {isLoading ? (
          <div className="h-12 flex items-center justify-center text-gray-500">Loading profile...</div>
        ) : profile ? (
            <>
                {/* Profile Completeness Section - Now the main content */}
                <div className="w-full">
                    <div className="flex justify-between mb-1 text-xs">
                        <span className="font-medium text-gray-700">Profile Completeness</span>
                        <span className={`font-semibold ${completeness === 100 ? 'text-green-600' : 'text-blue-600'}`}>
                            {completeness}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all duration-500 ${progressColor}`}
                            style={{ width: `${completeness}%` }}
                        />
                    </div>
                    
                    {/* Additional context for incomplete profiles */}
                    {completeness < 100 && (
                      <div className="mt-2 text-xs text-gray-600">
                        <p>Complete your profile to improve lender matching and project success.</p>
                      </div>
                    )}
                </div>
            </>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No profile found. Please create one to get started.
            <Button size="sm" onClick={handleEditClick} className="mt-2">Create Profile</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};