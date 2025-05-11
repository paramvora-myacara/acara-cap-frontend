// src/contexts/BorrowerProfileContext.tsx
'use client';

import React, { createContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { StorageService } from '../services/storage/StorageService';
import { useAuth } from '../hooks/useAuth';
import { BorrowerProfile, Principal } from '../types/enhanced-types';

// Define context interface - ADD reset function
interface BorrowerProfileContextProps {
  borrowerProfile: BorrowerProfile | null;
  principals: Principal[];
  isLoading: boolean;
  createBorrowerProfile: (profileData: Partial<BorrowerProfile>) => Promise<BorrowerProfile>; // Keep return type
  updateBorrowerProfile: (updates: Partial<BorrowerProfile>, manual?: boolean) => Promise<BorrowerProfile | null>;
  addPrincipal: (principal: Partial<Principal>) => Promise<Principal>;
  updatePrincipal: (id: string, updates: Partial<Principal>) => Promise<Principal | null>;
  removePrincipal: (id: string) => Promise<boolean>;
  calculateCompleteness: (profile: BorrowerProfile | null, principals: Principal[]) => number; // Allow null profile
  profileChanges: boolean;
  setProfileChanges: (hasChanges: boolean) => void;
  autoSaveBorrowerProfile: () => Promise<void>;
  resetProfileState: () => void; // Add reset function type
}

// Create context with default values - ADD reset function default
export const BorrowerProfileContext = createContext<BorrowerProfileContextProps>({
  borrowerProfile: null, principals: [], isLoading: true,
  createBorrowerProfile: async () => ({ id: '', userId: '', fullLegalName: '', primaryEntityName: '', /*...*/ } as BorrowerProfile), // Provide full default obj structure
  updateBorrowerProfile: async () => null,
  addPrincipal: async () => ({ id: '', borrowerProfileId: '', /*...*/ } as Principal), // Provide full default obj structure
  updatePrincipal: async () => null, removePrincipal: async () => false,
  calculateCompleteness: () => 0, profileChanges: false, setProfileChanges: () => {},
  autoSaveBorrowerProfile: async () => {},
  resetProfileState: () => {}, // Add default empty reset function
});

interface BorrowerProfileProviderProps { children: ReactNode; storageService: StorageService; }
const AUTO_SAVE_INTERVAL = 3000;
const generateUniqueId = (): string => `profile_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

export const BorrowerProfileProvider: React.FC<BorrowerProfileProviderProps> = ({ children, storageService }) => {
  const { user } = useAuth(); // Use user from auth context
  const [borrowerProfile, setBorrowerProfile] = useState<BorrowerProfile | null>(null);
  const [principals, setPrincipals] = useState<Principal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profileChanges, setProfileChanges] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string | null>(null);

   // Reset State Function
   const resetProfileState = useCallback(() => {
        console.log("[BorrowerProfileContext] Resetting state.");
        setBorrowerProfile(null);
        setPrincipals([]);
        setProfileChanges(false);
        lastSavedRef.current = null;
        if (autoSaveTimerRef.current) { clearInterval(autoSaveTimerRef.current); autoSaveTimerRef.current = null; }
        // No need to set isLoading here, loading effect handles it
    }, []); // No dependencies

  // Load borrower profile based on user
  useEffect(() => {
    const loadBorrowerProfile = async () => {
      if (!user || user.role !== 'borrower') {
        resetProfileState(); // Reset if no user or not borrower
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const profiles = await storageService.getItem<BorrowerProfile[]>('borrowerProfiles') || [];
        const currentProfile = profiles.find(profile => profile.userId === user.email);
        if (currentProfile) {
            setBorrowerProfile(currentProfile);
             // Load associated principals
            const allPrincipals = await storageService.getItem<Principal[]>('principals') || [];
            setPrincipals(allPrincipals.filter(p => p.borrowerProfileId === currentProfile.id));
            lastSavedRef.current = JSON.stringify(currentProfile); // Update last saved state on load
        } else {
           resetProfileState(); // Reset if profile not found for user
        }
      } catch (error) { console.error('[ProfileContext] Failed load profile:', error); resetProfileState(); }
      finally { setIsLoading(false); }
    };
    loadBorrowerProfile();
  }, [user, storageService, resetProfileState]); // Depend on user

  // Calculate Completeness
  const calculateCompleteness = useCallback((profile: BorrowerProfile | null, profilePrincipals: Principal[]): number => {
        if (!profile) return 0;
        const requiredFields: (keyof BorrowerProfile)[] = [ 'fullLegalName', 'primaryEntityName', 'primaryEntityStructure', 'contactEmail', 'contactPhone', 'contactAddress', 'yearsCREExperienceRange', 'assetClassesExperience', 'geographicMarketsExperience', 'creditScoreRange', 'netWorthRange', 'liquidityRange' ];
        let filledCount = 0;
        requiredFields.forEach(field => { const value = profile[field]; if (value && (Array.isArray(value) ? value.length > 0 : String(value).trim() !== '')) filledCount++; });
        const optionalFields: (keyof BorrowerProfile)[] = [ 'bioNarrative', 'linkedinUrl', 'websiteUrl', 'totalDealValueClosedRange', 'existingLenderRelationships' ];
        optionalFields.forEach(field => { const value = profile[field]; if (value && String(value).trim() !== '') filledCount += 0.5; });
        if (profilePrincipals.length > 0) filledCount += 1 + (Math.min(profilePrincipals.length, 3) * 0.5);
        const maxPoints = requiredFields.length + optionalFields.length * 0.5 + 2.5; // Adjusted max points
        return Math.min(100, Math.round((filledCount / maxPoints) * 100));
   }, []);

   // Auto Save Profile
   const autoSaveBorrowerProfile = useCallback(async () => {
        if (!borrowerProfile || !profileChanges) return;
        try {
            const profileStateStr = JSON.stringify(borrowerProfile);
            if (profileStateStr !== lastSavedRef.current) {
                const now = new Date().toISOString();
                const completeness = calculateCompleteness(borrowerProfile, principals);
                const updatedProfile = { ...borrowerProfile, completenessPercent: completeness, updatedAt: now };
                setBorrowerProfile(updatedProfile); // Update local state first

                 // Save updated profile to storage
                 const profiles = await storageService.getItem<BorrowerProfile[]>('borrowerProfiles') || [];
                 const updatedProfiles = profiles.map(p => p.id === updatedProfile.id ? updatedProfile : p);
                 if (!updatedProfiles.some(p => p.id === updatedProfile.id)) updatedProfiles.push(updatedProfile); // Add if new
                 await storageService.setItem('borrowerProfiles', updatedProfiles);

                 // Save principals associated with this profile
                 const allPrincipals = await storageService.getItem<Principal[]>('principals') || [];
                 const otherPrincipals = allPrincipals.filter(p => p.borrowerProfileId !== updatedProfile.id);
                 await storageService.setItem('principals', [...otherPrincipals, ...principals]);


                lastSavedRef.current = JSON.stringify(updatedProfile);
                setProfileChanges(false);
                console.log(`[ProfileContext] Auto-saved profile: ${updatedProfile.fullLegalName}`);
            }
        } catch (error) { console.error('[ProfileContext] Auto-save failed:', error); }
    }, [borrowerProfile, principals, profileChanges, storageService, calculateCompleteness]);

   // useEffect for Auto Save Timer
   useEffect(() => {
       if (autoSaveTimerRef.current) { clearInterval(autoSaveTimerRef.current); }
       if (borrowerProfile && profileChanges) {
           autoSaveTimerRef.current = setInterval(autoSaveBorrowerProfile, AUTO_SAVE_INTERVAL);
       }
       return () => { if (autoSaveTimerRef.current) { clearInterval(autoSaveTimerRef.current); } };
   }, [borrowerProfile, profileChanges, autoSaveBorrowerProfile]);


  // Create Borrower Profile - Ensure it returns the created profile
  const createBorrowerProfile = useCallback(async (profileData: Partial<BorrowerProfile>): Promise<BorrowerProfile> => {
        if (!user) throw new Error('User must be logged in');
        const now = new Date().toISOString();
        const profileId = generateUniqueId();
        const newProfile: BorrowerProfile = {
            id: profileId, userId: user.email,
            fullLegalName: profileData.fullLegalName || '', primaryEntityName: profileData.primaryEntityName || '',
            primaryEntityStructure: profileData.primaryEntityStructure || 'LLC', contactEmail: profileData.contactEmail || user.email,
            contactPhone: profileData.contactPhone || '', contactAddress: profileData.contactAddress || '',
            bioNarrative: profileData.bioNarrative || '', linkedinUrl: profileData.linkedinUrl || '', websiteUrl: profileData.websiteUrl || '',
            yearsCREExperienceRange: profileData.yearsCREExperienceRange || '0-2', assetClassesExperience: profileData.assetClassesExperience || [],
            geographicMarketsExperience: profileData.geographicMarketsExperience || [], totalDealValueClosedRange: profileData.totalDealValueClosedRange || 'N/A',
            existingLenderRelationships: profileData.existingLenderRelationships || '', creditScoreRange: profileData.creditScoreRange || 'N/A',
            netWorthRange: profileData.netWorthRange || '<$1M', liquidityRange: profileData.liquidityRange || '<$100k',
            bankruptcyHistory: profileData.bankruptcyHistory || false, foreclosureHistory: profileData.foreclosureHistory || false,
            litigationHistory: profileData.litigationHistory || false, completenessPercent: 0, createdAt: now, updatedAt: now
        };
        newProfile.completenessPercent = calculateCompleteness(newProfile, []); // Calculate initial completeness
        setBorrowerProfile(newProfile); // Update state
        setPrincipals([]); // Reset principals for new profile

        // Save new profile to storage
        const profiles = await storageService.getItem<BorrowerProfile[]>('borrowerProfiles') || [];
        await storageService.setItem('borrowerProfiles', [...profiles.filter(p => p.userId !== user.email), newProfile]); // Replace if exists

        lastSavedRef.current = JSON.stringify(newProfile); // Update last saved
        console.log(`[ProfileContext] Created profile ${profileId} for ${user.email}`);
        return newProfile; // Return the created profile object
  }, [user, storageService, calculateCompleteness]);

  // Update Borrower Profile
  const updateBorrowerProfile = useCallback(async (updates: Partial<BorrowerProfile>, manual = false): Promise<BorrowerProfile | null> => {
        if (!borrowerProfile) return null;
        const now = new Date().toISOString();
        const updatedProfile: BorrowerProfile = { ...borrowerProfile, ...updates, updatedAt: now };
        updatedProfile.completenessPercent = calculateCompleteness(updatedProfile, principals);
        setBorrowerProfile(updatedProfile); // Update state
        if (manual) {
            lastSavedRef.current = JSON.stringify(updatedProfile);
            setProfileChanges(false);
             // Trigger immediate save to storage on manual update
             try {
                 const profiles = await storageService.getItem<BorrowerProfile[]>('borrowerProfiles') || [];
                 const updatedProfiles = profiles.map(p => p.id === updatedProfile.id ? updatedProfile : p);
                 await storageService.setItem('borrowerProfiles', updatedProfiles);
             } catch (e) { console.error("Manual profile save failed:", e); }
        } else {
            setProfileChanges(true); // Mark changes for auto-save if not manual
        }
        return updatedProfile;
  }, [borrowerProfile, principals, storageService, calculateCompleteness]);

  // Add Principal
  const addPrincipal = useCallback(async (principalData: Partial<Principal>): Promise<Principal> => {
        if (!borrowerProfile?.id) throw new Error('Profile must exist');
        const now = new Date().toISOString(); const pid = `principal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const newPrincipal: Principal = {
            id: pid, borrowerProfileId: borrowerProfile.id, principalLegalName: principalData.principalLegalName || '',
            principalRoleDefault: principalData.principalRoleDefault || 'Key Principal', principalBio: principalData.principalBio || '',
            principalEmail: principalData.principalEmail || '', ownershipPercentage: principalData.ownershipPercentage || 0,
            creditScoreRange: principalData.creditScoreRange || 'N/A', netWorthRange: principalData.netWorthRange || '<$1M',
            liquidityRange: principalData.liquidityRange || '<$100k', bankruptcyHistory: principalData.bankruptcyHistory || false,
            foreclosureHistory: principalData.foreclosureHistory || false, pfsDocumentId: principalData.pfsDocumentId || null,
            createdAt: now, updatedAt: now
        };
        const updatedPrincipals = [...principals, newPrincipal];
        setPrincipals(updatedPrincipals);
        // Update profile completeness & mark changes for auto-save
        const updatedCompleteness = calculateCompleteness(borrowerProfile, updatedPrincipals);
        setBorrowerProfile(prev => prev ? { ...prev, completenessPercent: updatedCompleteness, updatedAt: now } : null);
        setProfileChanges(true);
        // Save principals list immediately to storage as well
        try {
            const allStoredPrincipals = await storageService.getItem<Principal[]>('principals') || [];
            const otherStoredPrincipals = allStoredPrincipals.filter(p => p.borrowerProfileId !== borrowerProfile.id);
            await storageService.setItem('principals', [...otherStoredPrincipals, ...updatedPrincipals]);
        } catch (e) { console.error("Failed to save principals after add:", e); }
        return newPrincipal;
  }, [borrowerProfile, principals, storageService, calculateCompleteness]);

  // Update Principal
  const updatePrincipal = useCallback(async (id: string, updates: Partial<Principal>): Promise<Principal | null> => {
        let updatedPrincipal: Principal | null = null;
        setPrincipals(prev => { const i = prev.findIndex(p => p.id === id); if (i === -1) return prev; const now = new Date().toISOString(); updatedPrincipal = { ...prev[i], ...updates, updatedAt: now }; const list = [...prev]; list[i] = updatedPrincipal; return list; });
        if (updatedPrincipal && borrowerProfile) {
            setProfileChanges(true); // Mark profile as changed due to principal update
             // Save updated principals list to storage
             try {
                 const allStoredPrincipals = await storageService.getItem<Principal[]>('principals') || [];
                 const updatedList = allStoredPrincipals.map(p => p.id === id ? updatedPrincipal! : p);
                 await storageService.setItem('principals', updatedList);
             } catch (e) { console.error("Failed to save principals after update:", e); }
        }
        return updatedPrincipal;
  }, [borrowerProfile, storageService]); // Removed principals dependency

  // Remove Principal
  const removePrincipal = useCallback(async (id: string): Promise<boolean> => {
        let success = false;
        setPrincipals(prev => { const list = prev.filter(p => p.id !== id); success = list.length < prev.length; return list; });
        if (success && borrowerProfile) {
            setProfileChanges(true); // Mark profile as changed
            // Save updated principals list to storage
             try {
                 const allStoredPrincipals = await storageService.getItem<Principal[]>('principals') || [];
                 const updatedList = allStoredPrincipals.filter(p => p.id !== id);
                 await storageService.setItem('principals', updatedList);
             } catch (e) { console.error("Failed to save principals after remove:", e); success = false; }
        }
        return success;
  }, [borrowerProfile, storageService]);

  return (
    <BorrowerProfileContext.Provider value={{ borrowerProfile, principals, isLoading, createBorrowerProfile, updateBorrowerProfile, addPrincipal, updatePrincipal, removePrincipal, calculateCompleteness, profileChanges, setProfileChanges, autoSaveBorrowerProfile, resetProfileState }}>
      {children}
    </BorrowerProfileContext.Provider>
  );
};