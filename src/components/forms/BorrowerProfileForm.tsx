// src/components/forms/BorrowerProfileForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBorrowerProfile } from '../../hooks/useBorrowerProfile';
import { useAuth } from '../../hooks/useAuth';
import { useUI } from '../../hooks/useUI';
import { FormWizard, Step } from '../ui/FormWizard';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Form, FormGroup } from '../ui/Form';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { 
  User, 
  Building, 
  DollarSign, 
  Globe, 
  Award, 
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  AlertTriangle
} from 'lucide-react';
import { 
  BorrowerProfile, 
  EntityStructure, 
  ExperienceRange, 
  DealValueRange, 
  CreditScoreRange,
  NetWorthRange,
  LiquidityRange,
  Principal,
  PrincipalRole
} from '../../types/enhanced-types';
import { MultiSelect } from '../ui/MultiSelect';

interface BorrowerProfileFormProps {
  onComplete?: (profile: BorrowerProfile) => void;
}

const assetClassOptions = [
  "Multifamily", "Office", "Retail", "Industrial", "Hospitality",
  "Land", "Mixed-Use", "Self-Storage", "Data Center",
  "Medical Office", "Senior Housing", "Student Housing", "Other"
];

const geographicMarketsOptions = [
  "Northeast", "Mid-Atlantic", "Southeast", "Midwest", 
  "Southwest", "Mountain West", "West Coast", "Pacific Northwest",
  "Hawaii", "Alaska", "National"
];

export const BorrowerProfileForm: React.FC<BorrowerProfileFormProps> = ({ onComplete }) => {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    borrowerProfile, 
    principals,
    createBorrowerProfile,
    updateBorrowerProfile,
    addPrincipal,
    updatePrincipal,
    removePrincipal,
    setProfileChanges
  } = useBorrowerProfile();
  const { showNotification } = useUI();
  
  // Form state
  const [formSaved, setFormSaved] = useState(false);
  const [formData, setFormData] = useState<Partial<BorrowerProfile>>({
    fullLegalName: '',
    primaryEntityName: '',
    primaryEntityStructure: 'LLC',
    contactEmail: user?.email || '',
    contactPhone: '',
    contactAddress: '',
    bioNarrative: '',
    linkedinUrl: '',
    websiteUrl: '',
    yearsCREExperienceRange: '0-2',
    assetClassesExperience: [],
    geographicMarketsExperience: [],
    totalDealValueClosedRange: 'N/A',
    existingLenderRelationships: '',
    creditScoreRange: 'N/A',
    netWorthRange: '<$1M',
    liquidityRange: '<$100k',
    bankruptcyHistory: false,
    foreclosureHistory: false,
    litigationHistory: false,
  });
  
  // Principal form state
  const [principalFormData, setPrincipalFormData] = useState<Partial<Principal>>({
    principalLegalName: '',
    principalRoleDefault: 'Key Principal',
    principalBio: '',
    principalEmail: '',
    ownershipPercentage: 0,
    creditScoreRange: 'N/A',
    netWorthRange: '<$1M',
    liquidityRange: '<$100k',
    bankruptcyHistory: false,
    foreclosureHistory: false,
  });
  
  // Initialize form with existing profile data if available
  useEffect(() => {
    if (borrowerProfile) {
      setFormData({
        fullLegalName: borrowerProfile.fullLegalName,
        primaryEntityName: borrowerProfile.primaryEntityName,
        primaryEntityStructure: borrowerProfile.primaryEntityStructure,
        contactEmail: borrowerProfile.contactEmail,
        contactPhone: borrowerProfile.contactPhone,
        contactAddress: borrowerProfile.contactAddress,
        bioNarrative: borrowerProfile.bioNarrative,
        linkedinUrl: borrowerProfile.linkedinUrl,
        websiteUrl: borrowerProfile.websiteUrl,
        yearsCREExperienceRange: borrowerProfile.yearsCREExperienceRange,
        assetClassesExperience: borrowerProfile.assetClassesExperience,
        geographicMarketsExperience: borrowerProfile.geographicMarketsExperience,
        totalDealValueClosedRange: borrowerProfile.totalDealValueClosedRange,
        existingLenderRelationships: borrowerProfile.existingLenderRelationships,
        creditScoreRange: borrowerProfile.creditScoreRange,
        netWorthRange: borrowerProfile.netWorthRange,
        liquidityRange: borrowerProfile.liquidityRange,
        bankruptcyHistory: borrowerProfile.bankruptcyHistory,
        foreclosureHistory: borrowerProfile.foreclosureHistory,
        litigationHistory: borrowerProfile.litigationHistory,
      });
    }
  }, [borrowerProfile]);
  
  // Handle form changes
  const handleInputChange = (field: keyof BorrowerProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setProfileChanges(true);
  };
  
  // Handle principal form changes
  const handlePrincipalInputChange = (field: keyof Principal, value: any) => {
    setPrincipalFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Handle form submission
  const handleFormSubmit = async () => {
    try {
      if (borrowerProfile) {
        // Update existing profile
        const updatedProfile = await updateBorrowerProfile(formData, true);
        
        if (updatedProfile) {
          showNotification({
            type: 'success',
            message: 'Borrower profile updated successfully',
          });
          
          setFormSaved(true);
          setTimeout(() => setFormSaved(false), 3000);
          
          if (onComplete) {
            onComplete(updatedProfile);
          }
        }
    } else {
        // Create new profile
        const newProfile = await createBorrowerProfile(formData);
        
        showNotification({
          type: 'success',
          message: 'Borrower profile created successfully',
        });
        
        setFormSaved(true);
        setTimeout(() => setFormSaved(false), 3000);
        
        if (onComplete) {
          onComplete(newProfile);
        }
      }
    } catch (error) {
      console.error('Error saving borrower profile:', error);
      showNotification({
        type: 'error',
        message: 'Failed to save borrower profile. Please try again.',
      });
    }
  };
  
  // Add a principal
  const handleAddPrincipal = async () => {
    if (!borrowerProfile) {
      // Create the borrower profile first if it doesn't exist
      await handleFormSubmit();
      
      // If profile was created, it should now be in the context
      if (!borrowerProfile) {
        showNotification({
          type: 'error',
          message: 'Please save the borrower profile before adding principals',
        });
        return;
      }
    }
    
    try {
      await addPrincipal(principalFormData);
      
      showNotification({
        type: 'success',
        message: 'Principal added successfully',
      });
      
      // Reset the principal form
      setPrincipalFormData({
        principalLegalName: '',
        principalRoleDefault: 'Key Principal',
        principalBio: '',
        principalEmail: '',
        ownershipPercentage: 0,
        creditScoreRange: 'N/A',
        netWorthRange: '<$1M',
        liquidityRange: '<$100k',
        bankruptcyHistory: false,
        foreclosureHistory: false,
      });
    } catch (error) {
      console.error('Error adding principal:', error);
      showNotification({
        type: 'error',
        message: 'Failed to add principal. Please try again.',
      });
    }
  };
  
  // Remove a principal
  const handleRemovePrincipal = async (principalId: string) => {
    try {
      await removePrincipal(principalId);
      
      showNotification({
        type: 'success',
        message: 'Principal removed successfully',
      });
    } catch (error) {
      console.error('Error removing principal:', error);
      showNotification({
        type: 'error',
        message: 'Failed to remove principal. Please try again.',
      });
    }
  };
  
  // Define the steps for the form wizard
  const steps: Step[] = [
    {
      id: 'basic-info',
      title: 'Basic Information',
      component: (
        <Card>
          <CardHeader className="pb-3 border-b">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Basic Information
            </h2>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-6">
              <FormGroup>
                <Input
                  id="fullLegalName"
                  label="Full Legal Name"
                  value={formData.fullLegalName || ''}
                  onChange={(e) => handleInputChange('fullLegalName', e.target.value)}
                  placeholder="John Doe / Smith Property Ventures LLC"
                  required
                  leftIcon={<User className="h-5 w-5 text-gray-400" />}
                />
              </FormGroup>
              
              <FormGroup>
                <Input
                  id="primaryEntityName"
                  label="Primary Entity Name"
                  value={formData.primaryEntityName || ''}
                  onChange={(e) => handleInputChange('primaryEntityName', e.target.value)}
                  placeholder="Smith Property Ventures LLC"
                  required
                  leftIcon={<Building className="h-5 w-5 text-gray-400" />}
                />
              </FormGroup>
              
              <FormGroup>
                <Select
                  id="primaryEntityStructure"
                  label="Entity Structure"
                  value={formData.primaryEntityStructure || 'LLC'}
                  onChange={(e) => handleInputChange('primaryEntityStructure', e.target.value as EntityStructure)}
                  options={[
                    { value: 'LLC', label: 'LLC' },
                    { value: 'LP', label: 'LP' },
                    { value: 'S-Corp', label: 'S-Corp' },
                    { value: 'C-Corp', label: 'C-Corp' },
                    { value: 'Sole Proprietorship', label: 'Sole Proprietorship' },
                    { value: 'Trust', label: 'Trust' },
                    { value: 'Other', label: 'Other' },
                  ]}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Input
                  id="contactEmail"
                  type="email"
                  label="Contact Email"
                  value={formData.contactEmail || ''}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  placeholder="you@example.com"
                  required
                  leftIcon={<Mail className="h-5 w-5 text-gray-400" />}
                />
              </FormGroup>
              
              <FormGroup>
                <Input
                  id="contactPhone"
                  label="Contact Phone"
                  value={formData.contactPhone || ''}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  placeholder="(123) 456-7890"
                  required
                  leftIcon={<Phone className="h-5 w-5 text-gray-400" />}
                />
              </FormGroup>
              
              <FormGroup>
                <Input
                  id="contactAddress"
                  label="Mailing Address"
                  value={formData.contactAddress || ''}
                  onChange={(e) => handleInputChange('contactAddress', e.target.value)}
                  placeholder="123 Main St, Suite 100, Anytown, CA 90210"
                  required
                  leftIcon={<MapPin className="h-5 w-5 text-gray-400" />}
                />
              </FormGroup>
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      id: 'experience',
      title: 'Experience',
      component: (
        <Card>
          <CardHeader className="pb-3 border-b">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
              Experience & Track Record
            </h2>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-6">
              <FormGroup>
                <Select
                  id="yearsCREExperience"
                  label="Years of CRE Experience"
                  value={formData.yearsCREExperienceRange || '0-2'}
                  onChange={(e) => handleInputChange('yearsCREExperienceRange', e.target.value as ExperienceRange)}
                  options={[
                    { value: '0-2', label: '0-2 years' },
                    { value: '3-5', label: '3-5 years' },
                    { value: '6-10', label: '6-10 years' },
                    { value: '11-15', label: '11-15 years' },
                    { value: '16+', label: '16+ years' },
                  ]}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asset Classes Experience
                </label>
                <MultiSelect
                  options={assetClassOptions}
                  value={formData.assetClassesExperience || []}
                  onChange={(v) => handleInputChange('assetClassesExperience', v)}
                />
              </FormGroup>
              
              <FormGroup>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Geographic Markets Experience
                </label>
                <MultiSelect
                  options={geographicMarketsOptions}
                  value={formData.geographicMarketsExperience || []}
                  onChange={(v) => handleInputChange('geographicMarketsExperience', v)}
                />
              </FormGroup>
              
              <FormGroup>
                <Select
                  id="totalDealValueClosed"
                  label="Total Value of Deals Closed"
                  value={formData.totalDealValueClosedRange || 'N/A'}
                  onChange={(e) => handleInputChange('totalDealValueClosedRange', e.target.value as DealValueRange)}
                  options={[
                    { value: 'N/A', label: 'Not Applicable' },
                    { value: '<$10M', label: 'Less than $10 Million' },
                    { value: '$10M-$50M', label: '$10 Million - $50 Million' },
                    { value: '$50M-$100M', label: '$50 Million - $100 Million' },
                    { value: '$100M-$250M', label: '$100 Million - $250 Million' },
                    { value: '$250M-$500M', label: '$250 Million - $500 Million' },
                    { value: '$500M+', label: 'Over $500 Million' },
                  ]}
                />
              </FormGroup>
              
              <FormGroup>
                <Input
                  id="existingLenderRelationships"
                  label="Existing Lender Relationships"
                  value={formData.existingLenderRelationships || ''}
                  onChange={(e) => handleInputChange('existingLenderRelationships', e.target.value)}
                  placeholder="List any lenders you've worked with previously"
                />
              </FormGroup>
              
              <FormGroup>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Bio/Narrative (Optional)
                </label>
                <textarea
                  id="bioNarrative"
                  value={formData.bioNarrative || ''}
                  onChange={(e) => handleInputChange('bioNarrative', e.target.value)}
                  placeholder="Brief professional bio or narrative about your CRE experience..."
                  className="w-full h-32 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </FormGroup>
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      id: 'financial',
      title: 'Financial Information',
      component: (
        <Card>
          <CardHeader className="pb-3 border-b">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
              Financial Information
            </h2>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-6">
              <FormGroup>
                <Select
                  id="creditScoreRange"
                  label="Credit Score Range"
                  value={formData.creditScoreRange || 'N/A'}
                  onChange={(e) => handleInputChange('creditScoreRange', e.target.value as CreditScoreRange)}
                  options={[
                    { value: 'N/A', label: 'Prefer not to disclose' },
                    { value: '<600', label: 'Below 600' },
                    { value: '600-649', label: '600-649' },
                    { value: '650-699', label: '650-699' },
                    { value: '700-749', label: '700-749' },
                    { value: '750-799', label: '750-799' },
                    { value: '800+', label: '800 or above' },
                  ]}
                />
              </FormGroup>
              
              <FormGroup>
                <Select
                  id="netWorthRange"
                  label="Net Worth Range"
                  value={formData.netWorthRange || '<$1M'}
                  onChange={(e) => handleInputChange('netWorthRange', e.target.value as NetWorthRange)}
                  options={[
                    { value: '<$1M', label: 'Less than $1 Million' },
                    { value: '$1M-$5M', label: '$1 Million - $5 Million' },
                    { value: '$5M-$10M', label: '$5 Million - $10 Million' },
                    { value: '$10M-$25M', label: '$10 Million - $25 Million' },
                    { value: '$25M-$50M', label: '$25 Million - $50 Million' },
                    { value: '$50M-$100M', label: '$50 Million - $100 Million' },
                    { value: '$100M+', label: 'Over $100 Million' },
                  ]}
                />
              </FormGroup>
              
              <FormGroup>
                <Select
                  id="liquidityRange"
                  label="Liquidity Range"
                  value={formData.liquidityRange || '<$100k'}
                  onChange={(e) => handleInputChange('liquidityRange', e.target.value as LiquidityRange)}
                  options={[
                    { value: '<$100k', label: 'Less than $100,000' },
                    { value: '$100k-$500k', label: '$100,000 - $500,000' },
                    { value: '$500k-$1M', label: '$500,000 - $1 Million' },
                    { value: '$1M-$5M', label: '$1 Million - $5 Million' },
                    { value: '$5M-$10M', label: '$5 Million - $10 Million' },
                    { value: '$10M+', label: 'Over $10 Million' },
                  ]}
                />
              </FormGroup>
              
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h3 className="text-sm font-semibold text-amber-800 flex items-center mb-2">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Financial Background
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="bankruptcyHistory"
                      checked={formData.bankruptcyHistory || false}
                      onChange={(e) => handleInputChange('bankruptcyHistory', e.target.checked)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="bankruptcyHistory" className="ml-2 text-sm text-gray-700">
                      Bankruptcy history in the past 7 years
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="foreclosureHistory"
                      checked={formData.foreclosureHistory || false}
                      onChange={(e) => handleInputChange('foreclosureHistory', e.target.checked)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="foreclosureHistory" className="ml-2 text-sm text-gray-700">
                      Foreclosure history in the past 7 years
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="litigationHistory"
                      checked={formData.litigationHistory || false}
                      onChange={(e) => handleInputChange('litigationHistory', e.target.checked)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="litigationHistory" className="ml-2 text-sm text-gray-700">
                      Significant litigation history
                    </label>
                  </div>
                </div>
                <p className="text-xs text-amber-700 mt-2">
                  Note: This information helps us match you with appropriate lenders. Disclosure of accurate information is essential.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      id: 'online-presence',
      title: 'Online Presence',
      isOptional: true,
      component: (
        <Card>
          <CardHeader className="pb-3 border-b">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <Globe className="h-5 w-5 mr-2 text-blue-600" />
              Online Presence (Optional)
            </h2>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-6">
              <FormGroup>
                <Input
                  id="linkedinUrl"
                  label="LinkedIn Profile URL"
                  value={formData.linkedinUrl || ''}
                  onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                  placeholder="https://www.linkedin.com/in/username"
                />
              </FormGroup>
              
              <FormGroup>
                <Input
                  id="websiteUrl"
                  label="Company Website URL"
                  value={formData.websiteUrl || ''}
                  onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                  placeholder="https://www.example.com"
                />
              </FormGroup>
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      id: 'principals',
      title: 'Key Principals',
      isOptional: true,
      component: (
        <Card>
          <CardHeader className="pb-3 border-b">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <Award className="h-5 w-5 mr-2 text-blue-600" />
              Key Principals (Optional)
            </h2>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Add Principal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormGroup>
                    <Input
                      id="principalName"
                      label="Principal Name"
                      value={principalFormData.principalLegalName || ''}
                      onChange={(e) => handlePrincipalInputChange('principalLegalName', e.target.value)}
                      placeholder="Jane Doe"
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <Select
                      id="principalRole"
                      label="Role"
                      value={principalFormData.principalRoleDefault || 'Key Principal'}
                      onChange={(e) => handlePrincipalInputChange('principalRoleDefault', e.target.value as PrincipalRole)}
                      options={[
                        { value: 'Managing Member', label: 'Managing Member' },
                        { value: 'General Partner', label: 'General Partner' },
                        { value: 'Developer', label: 'Developer' },
                        { value: 'Sponsor', label: 'Sponsor' },
                        { value: 'Key Principal', label: 'Key Principal' },
                        { value: 'Guarantor', label: 'Guarantor' },
                        { value: 'Limited Partner', label: 'Limited Partner' },
                        { value: 'Other', label: 'Other' },
                      ]}
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <Input
                      id="principalEmail"
                      type="email"
                      label="Email Address"
                      value={principalFormData.principalEmail || ''}
                      onChange={(e) => handlePrincipalInputChange('principalEmail', e.target.value)}
                      placeholder="jane@example.com"
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <Input
                      id="ownershipPercentage"
                      type="number"
                      label="Ownership Percentage"
                      value={principalFormData.ownershipPercentage?.toString() || '0'}
                      onChange={(e) => handlePrincipalInputChange('ownershipPercentage', Number(e.target.value))}
                      placeholder="50"
                    />
                  </FormGroup>
                  
                  <div className="md:col-span-2">
                    <FormGroup>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Principal Bio
                      </label>
                      <textarea
                        id="principalBio"
                        value={principalFormData.principalBio || ''}
                        onChange={(e) => handlePrincipalInputChange('principalBio', e.target.value)}
                        placeholder="Brief description of this principal's background and role..."
                        className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                    </FormGroup>
                  </div>
                </div>
                <div className="mt-4">
                  <Button
                    onClick={handleAddPrincipal}
                    variant="secondary"
                  >
                    Add Principal
                  </Button>
                </div>
              </div>
              
              {/* Display existing principals */}
              {principals.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Principals</h3>
                  <div className="space-y-4">
                    {principals.map(principal => (
                      <div key={principal.id} className="border rounded-md p-4 bg-gray-50">
                        <div className="flex justify-between">
                          <div>
                            <h4 className="font-medium text-gray-800">{principal.principalLegalName}</h4>
                            <p className="text-sm text-gray-600">{principal.principalRoleDefault}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemovePrincipal(principal.id)}
                          >
                            Remove
                          </Button>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          <p><strong>Email:</strong> {principal.principalEmail}</p>
                          <p><strong>Ownership:</strong> {principal.ownershipPercentage}%</p>
                          {principal.principalBio && <p><strong>Bio:</strong> {principal.principalBio}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      id: 'review',
      title: 'Review & Submit',
      component: (
        <Card>
          <CardHeader className="pb-3 border-b">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
              Review & Submit
            </h2>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-blue-800">
                  Please review your borrower profile information below. Once submitted, this information will be used to help match you with appropriate lenders for your projects.
                </p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Full Legal Name</p>
                      <p className="font-medium">{formData.fullLegalName || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Primary Entity Name</p>
                      <p className="font-medium">{formData.primaryEntityName || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Entity Structure</p>
                      <p className="font-medium">{formData.primaryEntityStructure || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Contact Email</p>
                      <p className="font-medium">{formData.contactEmail || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Contact Phone</p>
                      <p className="font-medium">{formData.contactPhone || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Contact Address</p>
                      <p className="font-medium">{formData.contactAddress || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Experience</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Years of CRE Experience</p>
                      <p className="font-medium">{formData.yearsCREExperienceRange || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Asset Classes Experience</p>
                      <p className="font-medium">
                        {formData.assetClassesExperience && formData.assetClassesExperience.length > 0 
                          ? formData.assetClassesExperience.join(', ') 
                          : 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Geographic Markets Experience</p>
                      <p className="font-medium">
                        {formData.geographicMarketsExperience && formData.geographicMarketsExperience.length > 0 
                          ? formData.geographicMarketsExperience.join(', ') 
                          : 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Value of Deals Closed</p>
                      <p className="font-medium">{formData.totalDealValueClosedRange || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Financial Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Credit Score Range</p>
                      <p className="font-medium">{formData.creditScoreRange || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Net Worth Range</p>
                      <p className="font-medium">{formData.netWorthRange || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Liquidity Range</p>
                      <p className="font-medium">{formData.liquidityRange || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
                
                {principals.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Principals ({principals.length})</h3>
                    <p className="text-sm text-gray-600">
                      You have added {principals.length} principal{principals.length !== 1 ? 's' : ''} to your profile.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-center">
                <Button
                  variant="primary"
                  onClick={handleFormSubmit}
                  isLoading={formSaved}
                >
                  {borrowerProfile ? (formSaved ? 'Saved!' : 'Update Profile') : (formSaved ? 'Saved!' : 'Create Profile')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ),
    },
  ];
  
  return (
    <FormWizard 
      steps={steps}
      onComplete={handleFormSubmit}
      showProgressBar={true}
      showStepIndicators={true}
      allowSkip={true}
    />
  );
};