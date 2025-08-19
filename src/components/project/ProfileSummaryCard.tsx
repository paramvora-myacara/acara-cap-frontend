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
  const progressBgColor = completeness === 100 ? 'bg-emerald-50' : 'bg-blue-50';

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
        <div className="flex items-center space-x-1 animate-fadeIn">
          <input
            type="text"
            value={editValues[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="px-2 py-1 text-sm border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
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
            className="p-1 text-green-600 hover:bg-green-100 rounded-md transition-colors duration-200 hover:scale-105"
            title="Save"
          >
            <Check className="h-3 w-3" />
          </button>
          <button
            onClick={cancelEditing}
            className="p-1 text-red-600 hover:bg-red-100 rounded-md transition-colors duration-200 hover:scale-105"
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
        className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 px-2 py-1 rounded-md text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-sm"
        title={`Click to edit ${label.toLowerCase()}`}
      >
        {getDisplayValue(value, label)}
      </button>
    );
  };

  return (
    <Card className="mb-3 shadow-sm border border-gray-200 animate-fadeInUp relative overflow-hidden group"> 
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0 border-b bg-gradient-to-r from-gray-50/80 via-blue-50/30 to-purple-50/20 px-4 py-3 md:px-6 md:py-4 relative"> 
        <div className="flex items-center space-x-3">
           <div className="p-3 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow duration-300 group-hover:scale-105 transform transition-transform duration-300">
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
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleEditClick} 
          disabled={isLoading} 
          className="ml-4 flex-shrink-0 border-gray-300 hover:border-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:shadow-md transition-all duration-300 hover:scale-105"
        > 
          <Edit className="mr-1.5 h-3.5 w-3.5" /> 
          {profile ? 'Edit' : 'Create'} 
        </Button>
      </CardHeader>
      <CardContent className="p-3 md:p-4 relative">
        {isLoading ? (
          <div className="h-12 flex items-center justify-center text-gray-500">
            <div className="animate-pulse flex space-x-2">
              <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"></div>
            </div>
            <span className="ml-3">Loading profile...</span>
          </div>
        ) : profile ? (
            <>
                {/* Profile Completeness Section - Now the main content */}
                <div className="w-full">
                    <div className="flex justify-between mb-2 text-xs">
                        <span className="font-medium text-gray-700">Profile Completeness</span>
                        <span className={`font-semibold transition-colors duration-300 ${completeness === 100 ? 'text-emerald-600' : 'text-blue-600'}`}>
                            {completeness}%
                        </span>
                    </div>
                    <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                        {/* Progress bar with solid color and animation */}
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${progressColor} shadow-sm relative overflow-hidden`}
                            style={{ width: `${completeness}%` }}
                        >
                            {/* Shimmer effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" 
                                 style={{ 
                                   backgroundSize: '200% 100%',
                                   animation: 'shimmer 2s infinite'
                                 }} 
                            />
                        </div>
                        {/* Subtle glow effect for incomplete progress */}
                        {completeness < 100 && (
                          <div className={`absolute inset-0 ${progressBgColor} rounded-full animate-pulse opacity-20`} />
                        )}
                    </div>
                    
                    {/* Additional context for incomplete profiles */}
                    {completeness < 100 && (
                      <div className="mt-2 text-xs text-gray-600 animate-fadeIn">
                        <p className="flex items-center">
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2 animate-pulse"></span>
                          Complete your profile to improve lender matching and project success.
                        </p>
                      </div>
                    )}
                </div>
            </>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No profile found. Please create one to get started.
            <Button size="sm" onClick={handleEditClick} className="mt-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 hover:shadow-md transition-all duration-300 hover:scale-105">Create Profile</Button>
          </div>
        )}
      </CardContent>
      
      {/* Custom styles for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </Card>
  );
};