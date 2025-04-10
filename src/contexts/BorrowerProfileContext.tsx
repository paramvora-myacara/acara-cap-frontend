// src/contexts/BorrowerProfileContext.tsx

'use client';

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { StorageService } from '../services/storage/StorageService';
import { useAuth } from '../hooks/useAuth';
import { BorrowerProfile, Principal } from '../types/enhanced-types';

// Define context interface
interface BorrowerProfileContextProps {
  borrowerProfile: BorrowerProfile | null;
  principals: Principal[];
  isLoading: boolean;
  createBorrowerProfile: (profile: Partial<BorrowerProfile>) => Promise<BorrowerProfile>;
  updateBorrowerProfile: (updates: Partial<BorrowerProfile>, manual?: boolean) => Promise<BorrowerProfile | null>;
  addPrincipal: (principal: Partial<Principal>) => Promise<Principal>;
  updatePrincipal: (id: string, updates: Partial<Principal>) => Promise<Principal | null>;
  removePrincipal: (id: string) => Promise<boolean>;
  calculateCompleteness: (profile: BorrowerProfile, principals: Principal[]) => number;
  profileChanges: boolean;
  setProfileChanges: (hasChanges: boolean) => void;
  autoSaveBorrowerProfile: () => Promise<void>;
}

// Create context with default values
export const BorrowerProfileContext = createContext<BorrowerProfileContextProps>({
  borrowerProfile: null,
  principals: [],
  isLoading: true,
  createBorrowerProfile: async () => ({ id: '', userId: '', fullLegalName: '', primaryEntityName: '', primaryEntityStructure: 'LLC', contactEmail: '', contactPhone: '', contactAddress: '', bioNarrative: '', linkedinUrl: '', websiteUrl: '', yearsCREExperienceRange: '0-2', assetClassesExperience: [], geographicMarketsExperience: [], totalDealValueClosedRange: 'N/A', existingLenderRelationships: '', creditScoreRange: 'N/A', netWorthRange: '<$1M', liquidityRange: '<$100k', bankruptcyHistory: false, foreclosureHistory: false, litigationHistory: false, completenessPercent: 0, createdAt: '', updatedAt: '' }),
  updateBorrowerProfile: async () => null,
  addPrincipal: async () => ({ id: '', borrowerProfileId: '', principalLegalName: '', principalRoleDefault: 'Key Principal', principalBio: '', principalEmail: '', ownershipPercentage: 0, creditScoreRange: 'N/A', netWorthRange: '<$1M', liquidityRange: '<$100k', bankruptcyHistory: false, foreclosureHistory: false, pfsDocumentId: null, createdAt: '', updatedAt: '' }),
  updatePrincipal: async () => null,
  removePrincipal: async () => false,
  calculateCompleteness: () => 0,
  profileChanges: false,
  setProfileChanges: () => {},
  autoSaveBorrowerProfile: async () => {},
});

interface BorrowerProfileProviderProps {
  children: ReactNode;
  storageService: StorageService;
}

// Auto-save interval in milliseconds (3 seconds)
const AUTO_SAVE_INTERVAL = 3000;

// Generate a truly unique ID
const generateUniqueId = (): string => {
  return `profile_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

export const BorrowerProfileProvider: React.FC<BorrowerProfileProviderProps> = ({ 
  children, 
  storageService 
}) => {
  const { user } = useAuth();
  const [borrowerProfile, setBorrowerProfile] = useState<BorrowerProfile | null>(null);
  const [principals, setPrincipals] = useState<Principal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profileChanges, setProfileChanges] = useState(false);
  
  const autoSaveTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = React.useRef<string | null>(null);

  // Load borrower profile from storage on mount or when user changes
  useEffect(() => {
    const loadBorrowerProfile = async () => {
      if (!user) {
        setBorrowerProfile(null);
        setPrincipals([]);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Try to load existing profile for this user
        const userProfiles = await storageService.getItem<BorrowerProfile[]>('borrowerProfiles') || [];
        const userProfile = userProfiles.find(profile => profile.userId === user.email);
        
        if (userProfile) {
          setBorrowerProfile(userProfile);
          
          // Load principals for this profile
          const allPrincipals = await storageService.getItem<Principal[]>('principals') || [];
          const profilePrincipals = allPrincipals.filter(p => p.borrowerProfileId === userProfile.id);
          setPrincipals(profilePrincipals);
        } else {
          setBorrowerProfile(null);
        }
      } catch (error) {
        console.error('Failed to load borrower profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBorrowerProfile();
  }, [user, storageService]);

  // Save borrower profile to storage whenever it changes
  useEffect(() => {
    const saveBorrowerProfile = async () => {
      if (!borrowerProfile) return;
      
      try {
        // Get existing profiles
        const existingProfiles = await storageService.getItem<BorrowerProfile[]>('borrowerProfiles') || [];
        
        // Replace or add the current profile
        const updatedProfiles = borrowerProfile.id 
          ? existingProfiles.map(p => p.id === borrowerProfile.id ? borrowerProfile : p)
          : [...existingProfiles, borrowerProfile];
        
        if (!updatedProfiles.some(p => p.id === borrowerProfile.id)) {
          updatedProfiles.push(borrowerProfile);
        }
        
        await storageService.setItem('borrowerProfiles', updatedProfiles);
      } catch (error) {
        console.error('Failed to save borrower profile:', error);
      }
    };

    // Save principals to storage
    const savePrincipals = async () => {
      if (!principals.length) return;
      
      try {
        // Get existing principals
        const existingPrincipals = await storageService.getItem<Principal[]>('principals') || [];
        
        // Find principals not associated with this profile
        const otherPrincipals = existingPrincipals.filter(
          p => !principals.some(current => current.id === p.id)
        );
        
        // Combine with current principals
        const updatedPrincipals = [...otherPrincipals, ...principals];
        
        await storageService.setItem('principals', updatedPrincipals);
      } catch (error) {
        console.error('Failed to save principals:', error);
      }
    };

    if (borrowerProfile) {
      saveBorrowerProfile();
    }
    
    if (principals.length) {
      savePrincipals();
    }
  }, [borrowerProfile, principals, storageService]);

  // Set up auto-save for profile
  useEffect(() => {
    // Clear any existing auto-save timer
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }

    // If there's a profile and unsaved changes, set up auto-save timer
    if (borrowerProfile && profileChanges) {
      autoSaveTimerRef.current = setInterval(() => {
        autoSaveBorrowerProfile();
      }, AUTO_SAVE_INTERVAL);
    }

    // Cleanup function
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, [borrowerProfile, profileChanges]);

  // Auto-save the borrower profile
  const autoSaveBorrowerProfile = useCallback(async () => {
    if (!borrowerProfile || !profileChanges) return;
    
    try {
      // Create a serializable version of the profile for comparison
      const profileStateStr = JSON.stringify(borrowerProfile);
      
      // Only save if profile state has changed since last save
      if (profileStateStr !== lastSavedRef.current) {
        const now = new Date().toISOString();
        
        // Update profile with current progress calculations
        const completeness = calculateCompleteness(borrowerProfile, principals);
        
        const updatedProfile = {
          ...borrowerProfile,
          completenessPercent: completeness,
          updatedAt: now
        };
        
        // Update in state
        setBorrowerProfile(updatedProfile);
        
        // Keep track of what we've saved
        lastSavedRef.current = JSON.stringify(updatedProfile);
        
        // Reset changes flag
        setProfileChanges(false);
        
        console.log(`Auto-saved borrower profile: ${updatedProfile.fullLegalName}`);
      }
    } catch (error) {
      console.error('Failed to auto-save borrower profile:', error);
    }
  }, [borrowerProfile, profileChanges, principals]);

  // Calculate profile completeness
  const calculateCompleteness = useCallback((profile: BorrowerProfile, profilePrincipals: Principal[]) => {
    if (!profile) return 0;
    
    // Define required fields
    const requiredFields: (keyof BorrowerProfile)[] = [
      'fullLegalName',
      'primaryEntityName',
      'primaryEntityStructure',
      'contactEmail',
      'contactPhone',
      'contactAddress',
      'yearsCREExperienceRange',
      'assetClassesExperience',
      'geographicMarketsExperience',
      'creditScoreRange',
      'netWorthRange',
      'liquidityRange'
    ];
    
    // Count filled required fields
    let filledCount = 0;
    for (const field of requiredFields) {
      const value = profile[field];
      if (value) {
        if (Array.isArray(value) && value.length > 0) {
          filledCount++;
        } else if (typeof value === 'string' && value.trim() !== '') {
          filledCount++;
        } else if (typeof value === 'number' || typeof value === 'boolean') {
          filledCount++;
        }
      }
    }
    
    // Add bonus points for optional fields
    const optionalFields: (keyof BorrowerProfile)[] = [
      'bioNarrative',
      'linkedinUrl',
      'websiteUrl',
      'totalDealValueClosedRange',
      'existingLenderRelationships'
    ];
    
    for (const field of optionalFields) {
      const value = profile[field];
      if (value && typeof value === 'string' && value.trim() !== '') {
        filledCount += 0.5; // Half point for optional fields
      }
    }
    
    // Add points for having principals
    if (profilePrincipals.length > 0) {
      filledCount += 1 + (Math.min(profilePrincipals.length, 3) * 0.5); // Up to 2.5 extra points for 3+ principals
    }
    
    // Calculate percentage (max points possible is requiredFields.length + 5)
    const maxPoints = requiredFields.length + 5;
    const completenessPercent = Math.min(100, Math.round((filledCount / maxPoints) * 100));
    
    return completenessPercent;
  }, []);

  // Create a new borrower profile
  const createBorrowerProfile = useCallback(async (profileData: Partial<BorrowerProfile>) => {
    if (!user) throw new Error('User must be logged in to create a profile');
    
    const now = new Date().toISOString();
    const profileId = generateUniqueId();
    
    const newProfile: BorrowerProfile = {
      id: profileId,
      userId: user.email,
      fullLegalName: profileData.fullLegalName || '',
      primaryEntityName: profileData.primaryEntityName || '',
      primaryEntityStructure: profileData.primaryEntityStructure || 'LLC',
      contactEmail: profileData.contactEmail || user.email,
      contactPhone: profileData.contactPhone || '',
      contactAddress: profileData.contactAddress || '',
      bioNarrative: profileData.bioNarrative || '',
      linkedinUrl: profileData.linkedinUrl || '',
      websiteUrl: profileData.websiteUrl || '',
      yearsCREExperienceRange: profileData.yearsCREExperienceRange || '0-2',
      assetClassesExperience: profileData.assetClassesExperience || [],
      geographicMarketsExperience: profileData.geographicMarketsExperience || [],
      totalDealValueClosedRange: profileData.totalDealValueClosedRange || 'N/A',
      existingLenderRelationships: profileData.existingLenderRelationships || '',
      creditScoreRange: profileData.creditScoreRange || 'N/A',
      netWorthRange: profileData.netWorthRange || '<$1M',
      liquidityRange: profileData.liquidityRange || '<$100k',
      bankruptcyHistory: profileData.bankruptcyHistory || false,
      foreclosureHistory: profileData.foreclosureHistory || false,
      litigationHistory: profileData.litigationHistory || false,
      completenessPercent: 0, // Will be calculated
      createdAt: now,
      updatedAt: now
    };
    
    // Calculate initial completeness
    newProfile.completenessPercent = calculateCompleteness(newProfile, []);
    
    setBorrowerProfile(newProfile);
    
    // Update user with profile ID reference
    if (user) {
      const userUpdate = {
        ...user,
        profileId: profileId
      };
      await storageService.setItem('user', userUpdate);
    }
    
    return newProfile;
  }, [user, calculateCompleteness, storageService]);

  // Update borrower profile
  const updateBorrowerProfile = useCallback(async (updates: Partial<BorrowerProfile>, manual = false) => {
    if (!borrowerProfile) return null;
    
    const now = new Date().toISOString();
    
    const updatedProfile: BorrowerProfile = {
      ...borrowerProfile,
      ...updates,
      updatedAt: now
    };
    
    // Recalculate completeness
    updatedProfile.completenessPercent = calculateCompleteness(updatedProfile, principals);
    
    setBorrowerProfile(updatedProfile);
    
    // If it's a manual save, update last saved reference and reset changes flag
    if (manual) {
      lastSavedRef.current = JSON.stringify(updatedProfile);
      setProfileChanges(false);
    }
    
    return updatedProfile;
  }, [borrowerProfile, principals, calculateCompleteness]);

  // Add a principal
  const addPrincipal = useCallback(async (principalData: Partial<Principal>) => {
    if (!borrowerProfile) throw new Error('Borrower profile must exist to add a principal');
    
    const now = new Date().toISOString();
    const principalId = `principal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const newPrincipal: Principal = {
      id: principalId,
      borrowerProfileId: borrowerProfile.id,
      principalLegalName: principalData.principalLegalName || '',
      principalRoleDefault: principalData.principalRoleDefault || 'Key Principal',
      principalBio: principalData.principalBio || '',
      principalEmail: principalData.principalEmail || '',
      ownershipPercentage: principalData.ownershipPercentage || 0,
      creditScoreRange: principalData.creditScoreRange || 'N/A',
      netWorthRange: principalData.netWorthRange || '<$1M',
      liquidityRange: principalData.liquidityRange || '<$100k',
      bankruptcyHistory: principalData.bankruptcyHistory || false,
      foreclosureHistory: principalData.foreclosureHistory || false,
      pfsDocumentId: principalData.pfsDocumentId || null,
      createdAt: now,
      updatedAt: now
    };
    
    setPrincipals(prev => [...prev, newPrincipal]);
    
    // Update borrower profile completeness
    const updatedCompleteness = calculateCompleteness(borrowerProfile, [...principals, newPrincipal]);
    setBorrowerProfile(prev => prev ? { ...prev, completenessPercent: updatedCompleteness, updatedAt: now } : null);
    
    return newPrincipal;
  }, [borrowerProfile, principals, calculateCompleteness]);

  // Update a principal
  const updatePrincipal = useCallback(async (id: string, updates: Partial<Principal>) => {
    const principalIndex = principals.findIndex(p => p.id === id);
    if (principalIndex === -1) return null;
    
    const now = new Date().toISOString();
    
    const updatedPrincipal: Principal = {
      ...principals[principalIndex],
      ...updates,
      updatedAt: now
    };
    
    const updatedPrincipals = [...principals];
    updatedPrincipals[principalIndex] = updatedPrincipal;
    
    setPrincipals(updatedPrincipals);
    
    // Update borrower profile completeness if it exists
    if (borrowerProfile) {
      const updatedCompleteness = calculateCompleteness(borrowerProfile, updatedPrincipals);
      setBorrowerProfile(prev => prev ? { ...prev, completenessPercent: updatedCompleteness, updatedAt: now } : null);
    }
    
    return updatedPrincipal;
  }, [borrowerProfile, principals, calculateCompleteness]);

  // Remove a principal
  const removePrincipal = useCallback(async (id: string) => {
    try {
      const updatedPrincipals = principals.filter(p => p.id !== id);
      setPrincipals(updatedPrincipals);
      
      // Update borrower profile completeness if it exists
      if (borrowerProfile) {
        const now = new Date().toISOString();
        const updatedCompleteness = calculateCompleteness(borrowerProfile, updatedPrincipals);
        setBorrowerProfile(prev => prev ? { ...prev, completenessPercent: updatedCompleteness, updatedAt: now } : null);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to remove principal:', error);
      return false;
    }
  }, [borrowerProfile, principals, calculateCompleteness]);

  return (
    <BorrowerProfileContext.Provider value={{
      borrowerProfile,
      principals,
      isLoading,
      createBorrowerProfile,
      updateBorrowerProfile,
      addPrincipal,
      updatePrincipal,
      removePrincipal,
      calculateCompleteness,
      profileChanges,
      setProfileChanges,
      autoSaveBorrowerProfile,
    }}>
      {children}
    </BorrowerProfileContext.Provider>
  );
};