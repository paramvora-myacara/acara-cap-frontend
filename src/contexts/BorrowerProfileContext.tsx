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
  const { user, updateUser } = useAuth(); // Get user and updater from auth context
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
        
        // For new users (not borrower1/borrower2), start with 0% if they haven't filled meaningful info
        const isTestUser = profile.userId === 'borrower1@example.com' || profile.userId === 'borrower2@example.com';
        
        if (!isTestUser) {
          // For new users, only count fields that have meaningful content (not just defaults)
          const meaningfulFields: (keyof BorrowerProfile)[] = [ 'fullLegalName', 'primaryEntityName', 'contactPhone', 'contactAddress', 'bioNarrative', 'linkedinUrl', 'websiteUrl' ];
          let meaningfulCount = 0;
          meaningfulFields.forEach(field => { 
            const value = profile[field]; 
            if (value && String(value).trim() !== '') meaningfulCount++; 
          });
          
          // Only count experience fields if they're not default values
          if (profile.yearsCREExperienceRange && profile.yearsCREExperienceRange !== '0-2') meaningfulCount++;
          if (profile.assetClassesExperience && profile.assetClassesExperience.length > 0) meaningfulCount++;
          if (profile.geographicMarketsExperience && profile.geographicMarketsExperience.length > 0) meaningfulCount++;
          if (profile.creditScoreRange && profile.creditScoreRange !== 'N/A') meaningfulCount++;
          if (profile.netWorthRange && profile.netWorthRange !== '<$1M') meaningfulCount++;
          if (profile.liquidityRange && profile.liquidityRange !== '<$100k') meaningfulCount++;
          if (profile.totalDealValueClosedRange && profile.totalDealValueClosedRange !== 'N/A') meaningfulCount++;
          if (profile.existingLenderRelationships && profile.existingLenderRelationships.trim() !== '') meaningfulCount++;
          
          // Count principals only if they have meaningful content
          if (profilePrincipals.length > 0) {
            const meaningfulPrincipals = profilePrincipals.filter(p => 
              p.principalLegalName.trim() !== '' || 
              p.principalBio.trim() !== '' || 
              p.principalEmail.trim() !== ''
            );
            meaningfulCount += meaningfulPrincipals.length * 0.5;
          }
          
          const maxMeaningfulPoints = meaningfulFields.length + 8 + 1.5; // 8 experience fields + max 3 principals
          return Math.min(100, Math.round((meaningfulCount / maxMeaningfulPoints) * 100));
        } else {
          // For test users, use the original calculation logic
          const requiredFields: (keyof BorrowerProfile)[] = [ 'fullLegalName', 'primaryEntityName', 'primaryEntityStructure', 'contactEmail', 'contactPhone', 'contactAddress', 'yearsCREExperienceRange', 'assetClassesExperience', 'geographicMarketsExperience', 'creditScoreRange', 'netWorthRange', 'liquidityRange' ];
          let filledCount = 0;
          requiredFields.forEach(field => { const value = profile[field]; if (value && (Array.isArray(value) ? value.length > 0 : String(value).trim() !== '')) filledCount++; });
          const optionalFields: (keyof BorrowerProfile)[] = [ 'bioNarrative', 'linkedinUrl', 'websiteUrl', 'totalDealValueClosedRange', 'existingLenderRelationships' ];
          optionalFields.forEach(field => { const value = profile[field]; if (value && String(value).trim() !== '') filledCount += 0.5; });
          if (profilePrincipals.length > 0) filledCount += 1 + (Math.min(profilePrincipals.length, 3) * 0.5);
          const maxPoints = requiredFields.length + optionalFields.length * 0.5 + 2.5; // Adjusted max points
          return Math.min(100, Math.round((filledCount / maxPoints) * 100));
        }
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

  // ------------------------------------------------------------
  // (auto-create effect moved lower)

  // Create Borrower Profile - Ensure it returns the created profile
  const createBorrowerProfile = useCallback(async (profileData: Partial<BorrowerProfile>): Promise<BorrowerProfile> => {
        if (!user) throw new Error('User must be logged in');
        const now = new Date().toISOString();
        const profileId = generateUniqueId();
        // For new users (not borrower1/borrower2), create truly empty profile without defaults
        const isTestUser = user.email === 'borrower1@example.com' || user.email === 'borrower2@example.com';
        
        const newProfile: BorrowerProfile = {
            id: profileId, userId: user.email,
            fullLegalName: profileData.fullLegalName || '', 
            primaryEntityName: profileData.primaryEntityName || '',
            primaryEntityStructure: isTestUser ? (profileData.primaryEntityStructure || 'LLC') : (profileData.primaryEntityStructure || 'LLC'), 
            contactEmail: profileData.contactEmail || user.email,
            contactPhone: profileData.contactPhone || '', 
            contactAddress: profileData.contactAddress || '',
            bioNarrative: profileData.bioNarrative || '', 
            linkedinUrl: profileData.linkedinUrl || '', 
            websiteUrl: profileData.websiteUrl || '',
            yearsCREExperienceRange: isTestUser ? (profileData.yearsCREExperienceRange || '0-2') : (profileData.yearsCREExperienceRange || '0-2'), 
            assetClassesExperience: profileData.assetClassesExperience || [], 
            geographicMarketsExperience: profileData.geographicMarketsExperience || [], 
            totalDealValueClosedRange: isTestUser ? (profileData.totalDealValueClosedRange || 'N/A') : (profileData.totalDealValueClosedRange || 'N/A'), 
            existingLenderRelationships: profileData.existingLenderRelationships || '', 
            creditScoreRange: isTestUser ? (profileData.creditScoreRange || 'N/A') : (profileData.creditScoreRange || 'N/A'), 
            netWorthRange: isTestUser ? (profileData.netWorthRange || '<$1M') : (profileData.netWorthRange || '<$1M'), 
            liquidityRange: isTestUser ? (profileData.liquidityRange || '<$100k') : (profileData.liquidityRange || '<$100k'), 
            bankruptcyHistory: profileData.bankruptcyHistory || false, 
            foreclosureHistory: profileData.foreclosureHistory || false,
            litigationHistory: profileData.litigationHistory || false, 
            completenessPercent: 0, 
            createdAt: now, 
            updatedAt: now
        };
        // For new users (not borrower1/borrower2), start with 0% completeness
        if (isTestUser) {
          newProfile.completenessPercent = calculateCompleteness(newProfile, []); // Calculate initial completeness for test users
        } else {
          newProfile.completenessPercent = 0; // Start at 0% for new users
        }
        setBorrowerProfile(newProfile); // Update state
        setPrincipals([]); // Reset principals for new profile

        // Save new profile to storage
        const profiles = await storageService.getItem<BorrowerProfile[]>('borrowerProfiles') || [];
        await storageService.setItem('borrowerProfiles', [...profiles.filter(p => p.userId !== user.email), newProfile]); // Replace if exists

        lastSavedRef.current = JSON.stringify(newProfile); // Update last saved
        console.log(`[ProfileContext] Created profile ${profileId} for ${user.email}`);
        return newProfile; // Return the created profile object
  }, [user, storageService, calculateCompleteness]);

  // ------------------------------------------------------------
  // Auto-create minimal borrower profile for first-time borrowers
  // ------------------------------------------------------------
  useEffect(() => {
    if (isLoading) return;                    // wait until initial load finished
    if (!user || user.role !== 'borrower') return;
    if (borrowerProfile) return;              // profile already exists

    (async () => {
      try {
        // 1️⃣ Check local-storage again to avoid duplicates
        const stored = await storageService.getItem<BorrowerProfile[]>('borrowerProfiles') || [];
        const existing = stored.find(p => p.userId === user.email);
        if (existing) {
          setBorrowerProfile(existing);
          await updateUser({ profileId: existing.id });
          return;                              // nothing to create
        }

        // 2️⃣ Still missing → create minimal profile
        // For new users (not borrower1/borrower2), create empty profile without seeding details
        const isTestUser = user.email === 'borrower1@example.com' || user.email === 'borrower2@example.com';
        
        if (isTestUser) {
          // For test users, create profile with seeded data
          const newProfile = await createBorrowerProfile({
            userId: user.email,
            contactEmail: user.email,
            fullLegalName: user.email.split('@')[0] || 'New User',
            primaryEntityName: 'My Entity',
          });
          await updateUser({ profileId: newProfile.id });
        } else {
          // For new users, create completely empty profile
          const newProfile = await createBorrowerProfile({
            userId: user.email,
            contactEmail: user.email,
            fullLegalName: '',
            primaryEntityName: '',
          });
          await updateUser({ profileId: newProfile.id });
        }
      } catch (err) {
        console.error('[BorrowerProfileContext] Auto-create failed:', err);
      }
    })();

  }, [isLoading, user, borrowerProfile, createBorrowerProfile, updateUser, storageService]);

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