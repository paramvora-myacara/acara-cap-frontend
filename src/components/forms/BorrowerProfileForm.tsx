// src/components/forms/BorrowerProfileForm.tsx
'use client';

import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useUI } from '../../hooks/useUI';
import { FormWizard, Step } from '../ui/FormWizard';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Form, FormGroup } from '../ui/Form';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { ButtonSelect } from '../ui/ButtonSelect';
import { Button } from '../ui/Button';
import {
  User, Building, DollarSign, Globe, Award, CheckCircle,
  Mail, Phone, MapPin, Briefcase, AlertTriangle
} from 'lucide-react';
import {
  BorrowerProfile, EntityStructure, ExperienceRange, DealValueRange, CreditScoreRange,
  NetWorthRange, LiquidityRange, Principal, PrincipalRole
} from '../../types/enhanced-types';
import { MultiSelect } from '../ui/MultiSelect';
import { useBorrowerProfile } from '../../hooks/useBorrowerProfile';

interface BorrowerProfileFormProps {
  onComplete?: (profile: BorrowerProfile | null) => void; // Allow null in callback
}

// Options definitions (no changes)
const entityStructureOptions: EntityStructure[] = [ 'LLC', 'LP', 'S-Corp', 'C-Corp', 'Sole Proprietorship', 'Trust', 'Other' ];
const experienceRangeOptions: ExperienceRange[] = [ '0-2', '3-5', '6-10', '11-15', '16+' ];
const dealValueRangeOptions: DealValueRange[] = [ 'N/A', '<$10M', '$10M-$50M', '$50M-$100M', '$100M-$250M', '$250M-$500M', '$500M+' ];
const creditScoreRangeOptions: CreditScoreRange[] = [ 'N/A', '<600', '600-649', '650-699', '700-749', '750-799', '800+' ];
const netWorthRangeOptions: NetWorthRange[] = [ '<$1M', '$1M-$5M', '$5M-$10M', '$10M-$25M', '$25M-$50M', '$50M-$100M', '$100M+' ];
const liquidityRangeOptions: LiquidityRange[] = [ '<$100k', '$100k-$500k', '$500k-$1M', '$1M-$5M', '$5M-$10M', '$10M+' ];
const principalRoleOptions: PrincipalRole[] = [ 'Managing Member', 'General Partner', 'Developer', 'Sponsor', 'Key Principal', 'Guarantor', 'Limited Partner', 'Other' ];
const assetClassOptions = [ "Multifamily", "Office", "Retail", "Industrial", "Hospitality", "Land", "Mixed-Use", "Self-Storage", "Data Center", "Medical Office", "Senior Housing", "Student Housing", "Other" ];
const geographicMarketsOptions = [ "Northeast", "Mid-Atlantic", "Southeast", "Midwest", "Southwest", "Mountain West", "West Coast", "Pacific Northwest", "Hawaii", "Alaska", "National" ];


export const BorrowerProfileForm: React.FC<BorrowerProfileFormProps> = ({ onComplete }) => {
  const router = useRouter();
  const { user } = useAuth();
  const borrowerProfileHookData = useBorrowerProfile(); // Use the hook
   // **Safely destructure, providing fallback functions**
   const {
    borrowerProfile = null, // Default to null
    principals = [], // Default to empty array
    createBorrowerProfile = async () => { throw new Error("createBorrowerProfile not available"); }, // Throw error if called when not available
    updateBorrowerProfile = async () => { throw new Error("updateBorrowerProfile not available"); },
    addPrincipal = async () => { throw new Error("addPrincipal not available"); },
    updatePrincipal = async () => { throw new Error("updatePrincipal not available"); },
    removePrincipal = async () => { throw new Error("removePrincipal not available"); },
    setProfileChanges = () => {}, // Default to no-op
    autoSaveBorrowerProfile = async () => {} // Default to no-op
  } = borrowerProfileHookData || {}; // Handle hook returning undefined initially


  const { showNotification } = useUI();

  // State variables
  const [formSaved, setFormSaved] = useState(false);
  const [formData, setFormData] = useState<Partial<BorrowerProfile>>({});
  const [principalFormData, setPrincipalFormData] = useState<Partial<Principal>>({ principalRoleDefault: 'Key Principal' });
  const [isAddingPrincipal, setIsAddingPrincipal] = useState(false);

  // Initialize form
  useEffect(() => {
     const defaultData: Partial<BorrowerProfile> = { primaryEntityStructure: 'LLC', contactEmail: user?.email || '', yearsCREExperienceRange: '0-2', totalDealValueClosedRange: 'N/A', creditScoreRange: 'N/A', netWorthRange: '<$1M', liquidityRange: '<$100k', bankruptcyHistory: false, foreclosureHistory: false, litigationHistory: false, assetClassesExperience: [], geographicMarketsExperience: [] };
    setFormData(borrowerProfile ? { ...borrowerProfile } : { ...defaultData });
  }, [borrowerProfile, user?.email]);

  // Input change handlers
  const handleInputChange = (field: keyof BorrowerProfile, value: any) => { setFormData(prev => ({ ...prev, [field]: value })); setProfileChanges(true); };
  const handlePrincipalInputChange = (field: keyof Principal, value: any) => { setPrincipalFormData(prev => ({ ...prev, [field]: value })); };
  const resetPrincipalForm = () => { setPrincipalFormData({ principalRoleDefault: 'Key Principal' }); }; // Reset with default role

  // --- Submit Profile - Safest Context Access ---
  const handleProfileSubmit = async () => {
    try {
      setFormSaved(true);
      // Await auto-save to process current formData
      await autoSaveBorrowerProfile();
      // Give context state a moment to potentially update after auto-save
      await new Promise(res => setTimeout(res, 50));

      showNotification({ type: 'success', message: 'Profile changes saved.' });
      setFormSaved(false);

      if (onComplete) {
         // **Safest Check:** Access the profile directly from the hook data again *after* await
         const finalProfileState = borrowerProfileHookData?.borrowerProfile;
         if (finalProfileState) {
              onComplete(finalProfileState);
         } else {
              console.warn("Profile still not available in context after save for onComplete.");
              onComplete(null); // Call onComplete with null to indicate potential issue
         }
      }
    } catch (error) {
      console.error('Error saving borrower profile:', error);
      showNotification({ type: 'error', message: 'Failed to save profile.' });
      setFormSaved(false);
       if (onComplete) onComplete(null); // Indicate failure in callback
    }
  };

  // Add Principal
  const handleAddPrincipal = async () => {
     if (!principalFormData.principalLegalName?.trim()) { showNotification({ type: 'warning', message: 'Enter principal name.' }); return; }
     if (!borrowerProfile?.id) { showNotification({ type: 'error', message: 'Save profile first.' }); return; }
    setIsAddingPrincipal(true);
    try { await addPrincipal(principalFormData); showNotification({ type: 'success', message: 'Principal added.' }); resetPrincipalForm(); }
    catch (error) { console.error('Error adding principal:', error); showNotification({ type: 'error', message: 'Failed add principal.' }); }
    finally { setIsAddingPrincipal(false); }
  };

  // Remove Principal
  const handleRemovePrincipal = async (principalId: string) => {
    try { await removePrincipal(principalId); showNotification({ type: 'success', message: 'Principal removed.' }); }
    catch (error) { console.error('Error removing principal:', error); showNotification({ type: 'error', message: 'Failed remove principal.' }); }
  };


  // FormWizard Steps definition (useMemo)
  const steps: Step[] = useMemo(() => [
    // Step 1: Basic Info (JSX using ButtonSelect for Entity Structure)
    { id: 'basic-info', title: 'Basic Info', component: ( <Card> <CardHeader><h2 className="text-xl font-semibold flex items-center"><User className="mr-2"/> Basic Info</h2></CardHeader> <CardContent className="p-4 space-y-6"> <FormGroup> <Input id="fullLegalName" label="Full Legal Name" value={formData.fullLegalName || ''} onChange={(e) => handleInputChange('fullLegalName', e.target.value)} required/> </FormGroup><FormGroup> <Input id="primaryEntityName" label="Primary Entity Name" value={formData.primaryEntityName || ''} onChange={(e) => handleInputChange('primaryEntityName', e.target.value)} required/> </FormGroup><FormGroup> <ButtonSelect label="Entity Structure" options={entityStructureOptions} selectedValue={formData.primaryEntityStructure || 'LLC'} onSelect={(v) => handleInputChange('primaryEntityStructure', v as EntityStructure)} required /> </FormGroup><FormGroup> <Input id="contactEmail" type="email" label="Contact Email" value={formData.contactEmail || ''} onChange={(e) => handleInputChange('contactEmail', e.target.value)} required disabled /> </FormGroup><FormGroup> <Input id="contactPhone" label="Contact Phone" value={formData.contactPhone || ''} onChange={(e) => handleInputChange('contactPhone', e.target.value)} required/> </FormGroup><FormGroup> <Input id="contactAddress" label="Mailing Address" value={formData.contactAddress || ''} onChange={(e) => handleInputChange('contactAddress', e.target.value)} required/> </FormGroup></CardContent> </Card> ) },
    // Step 2: Experience (JSX using ButtonSelect & MultiSelect)
    { id: 'experience', title: 'Experience', component: ( <Card> <CardHeader><h2 className="text-xl font-semibold flex items-center"><Briefcase className="mr-2"/> Experience</h2></CardHeader> <CardContent className="p-4 space-y-6"><FormGroup> <ButtonSelect label="Years of CRE Experience" options={experienceRangeOptions} selectedValue={formData.yearsCREExperienceRange || '0-2'} onSelect={(v) => handleInputChange('yearsCREExperienceRange', v as ExperienceRange)} required /> </FormGroup><FormGroup> <label className="block text-sm font-medium mb-1">Asset Classes Experience</label> <MultiSelect options={assetClassOptions} value={formData.assetClassesExperience || []} onChange={(v) => handleInputChange('assetClassesExperience', v)} /> </FormGroup><FormGroup> <label className="block text-sm font-medium mb-1">Geographic Markets Experience</label> <MultiSelect options={geographicMarketsOptions} value={formData.geographicMarketsExperience || []} onChange={(v) => handleInputChange('geographicMarketsExperience', v)} /> </FormGroup><FormGroup> <ButtonSelect label="Total Value Deals Closed" options={dealValueRangeOptions} selectedValue={formData.totalDealValueClosedRange || 'N/A'} onSelect={(v) => handleInputChange('totalDealValueClosedRange', v as DealValueRange)} /> </FormGroup><FormGroup> <Input id="existingLenderRelationships" label="Existing Lenders (Opt)" value={formData.existingLenderRelationships || ''} onChange={(e) => handleInputChange('existingLenderRelationships', e.target.value)} /> </FormGroup><FormGroup> <label className="block text-sm font-medium mb-1">Bio (Opt)</label> <textarea id="bioNarrative" value={formData.bioNarrative || ''} onChange={(e) => handleInputChange('bioNarrative', e.target.value)} className="w-full h-24 border rounded p-2" /> </FormGroup></CardContent> </Card> ) },
    // Step 3: Financial Info (JSX using ButtonSelect & Checkboxes)
    { id: 'financial', title: 'Financial Info', component: ( <Card> <CardHeader><h2 className="text-xl font-semibold flex items-center"><DollarSign className="mr-2"/> Financial Info</h2></CardHeader> <CardContent className="p-4 space-y-6"><FormGroup> <ButtonSelect label="Credit Score Range" options={creditScoreRangeOptions} selectedValue={formData.creditScoreRange || 'N/A'} onSelect={(v) => handleInputChange('creditScoreRange', v as CreditScoreRange)} /> </FormGroup><FormGroup> <ButtonSelect label="Net Worth Range" options={netWorthRangeOptions} selectedValue={formData.netWorthRange || '<$1M'} onSelect={(v) => handleInputChange('netWorthRange', v as NetWorthRange)} /> </FormGroup><FormGroup> <ButtonSelect label="Liquidity Range" options={liquidityRangeOptions} selectedValue={formData.liquidityRange || '<$100k'} onSelect={(v) => handleInputChange('liquidityRange', v as LiquidityRange)} /> </FormGroup><div className="p-4 bg-amber-50 rounded border border-amber-200"><h3 className="text-sm font-semibold mb-2 flex items-center"><AlertTriangle className="mr-2 h-4 w-4"/> Financial Background</h3><div className="space-y-2"><label className="flex items-center"><input type="checkbox" checked={formData.bankruptcyHistory || false} onChange={(e) => handleInputChange('bankruptcyHistory', e.target.checked)} className="mr-2"/> Bankruptcy (7yr)</label><label className="flex items-center"><input type="checkbox" checked={formData.foreclosureHistory || false} onChange={(e) => handleInputChange('foreclosureHistory', e.target.checked)} className="mr-2"/> Foreclosure (7yr)</label><label className="flex items-center"><input type="checkbox" checked={formData.litigationHistory || false} onChange={(e) => handleInputChange('litigationHistory', e.target.checked)} className="mr-2"/> Litigation</label></div></div></CardContent> </Card> ) },
    // Step 4: Online Presence (JSX - Optional)
    { id: 'online-presence', title: 'Online Presence', isOptional: true, component: ( <Card> <CardHeader><h2 className="text-xl font-semibold flex items-center"><Globe className="mr-2"/> Online Presence (Opt)</h2></CardHeader> <CardContent className="p-4 space-y-6"><FormGroup> <Input id="linkedinUrl" label="LinkedIn URL" value={formData.linkedinUrl || ''} onChange={(e) => handleInputChange('linkedinUrl', e.target.value)} /> </FormGroup><FormGroup> <Input id="websiteUrl" label="Company Website" value={formData.websiteUrl || ''} onChange={(e) => handleInputChange('websiteUrl', e.target.value)} /> </FormGroup></CardContent> </Card> ) },
    // Step 5: Key Principals (JSX - Optional, uses ButtonSelect for Role)
    { id: 'principals', title: 'Key Principals', isOptional: true, component: ( <Card> <CardHeader><h2 className="text-xl font-semibold flex items-center"><Award className="mr-2"/> Key Principals (Opt)</h2></CardHeader> <CardContent className="p-4 space-y-6"><div className="border rounded p-4 bg-gray-50"><h3 className="text-lg font-semibold mb-4">Add Principal</h3><div className="grid md:grid-cols-2 gap-4"><FormGroup> <Input id="pName" label="Name" value={principalFormData.principalLegalName || ''} onChange={(e)=>handlePrincipalInputChange('principalLegalName',e.target.value)} required/> </FormGroup><FormGroup> <ButtonSelect label="Role" options={principalRoleOptions} selectedValue={principalFormData.principalRoleDefault||'Key Principal'} onSelect={(v)=>handlePrincipalInputChange('principalRoleDefault',v as PrincipalRole)} required/> </FormGroup><FormGroup> <Input id="pEmail" type="email" label="Email" value={principalFormData.principalEmail || ''} onChange={(e)=>handlePrincipalInputChange('principalEmail',e.target.value)}/> </FormGroup><FormGroup> <Input id="pOwn" type="number" label="Ownership (%)" value={principalFormData.ownershipPercentage?.toString()||''} onChange={(e)=>handlePrincipalInputChange('ownershipPercentage',Number(e.target.value||0))} min="0" max="100"/> </FormGroup><div className="md:col-span-2"><FormGroup><label className="block text-sm mb-1">Bio (Opt)</label><textarea id="pBio" value={principalFormData.principalBio||''} onChange={(e)=>handlePrincipalInputChange('principalBio',e.target.value)} rows={2} className="w-full border rounded p-2"/> </FormGroup></div></div><Button onClick={handleAddPrincipal} variant="secondary" isLoading={isAddingPrincipal} disabled={isAddingPrincipal || !borrowerProfile?.id} className="mt-3">Add</Button></div> {principals.length>0 && <div className="mt-4"><h3 className="text-lg font-semibold mb-2">Added Principals</h3><ul className="space-y-2">{principals.map(p=><li key={p.id} className="flex justify-between items-center border p-2 rounded bg-white"><span className="text-sm">{p.principalLegalName} ({p.principalRoleDefault} - {p.ownershipPercentage}%)</span><Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-100 px-1 py-0.5 h-auto" onClick={()=>handleRemovePrincipal(p.id)}>Remove</Button></li>)}</ul></div>}</CardContent> </Card> ) },
    // Step 6: Review & Save (JSX)
    { id: 'review', title: 'Review & Save', component: ( <Card> <CardHeader><h2 className="text-xl font-semibold flex items-center"><CheckCircle className="mr-2"/> Review & Save</h2></CardHeader> <CardContent className="p-4 space-y-6"><div className="p-3 bg-blue-50 rounded text-sm border border-blue-100">Review details. Changes auto-save. Click below to manually confirm save and finish.</div><Button onClick={handleProfileSubmit} isLoading={formSaved} disabled={formSaved}>Save Profile</Button></CardContent> </Card> ) },
  ], [formData, principals, principalFormData, isAddingPrincipal, formSaved, handleInputChange, handleProfileSubmit, handleAddPrincipal, handleRemovePrincipal, handlePrincipalInputChange, borrowerProfile?.id]) // Dependencies reviewed


  return (
    <FormWizard
      steps={steps}
      onComplete={handleProfileSubmit}
      showProgressBar={true}
      showStepIndicators={true}
      allowSkip={true}
    />
  );
};