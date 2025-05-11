// src/components/forms/EnhancedProjectForm.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react'; // Added useMemo
import { useRouter } from 'next/navigation';
import { FormWizard, Step } from '../ui/FormWizard';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Form, FormGroup } from '../ui/Form';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select'; // Keep Select for States
import { Button } from '../ui/Button';
import { ButtonSelect } from '../ui/ButtonSelect'; // Import ButtonSelect
// Removed MultiSelect import if not used for project form fields directly
// import { MultiSelect } from '../ui/MultiSelect';
import { DocumentUpload } from '../ui/DocumentUpload';
import { useProjects } from '../../hooks/useProjects';
import { useBorrowerProfile } from '../../hooks/useBorrowerProfile';
import { useUI } from '../../hooks/useUI';
import { useAuth } from '../../hooks/useAuth';
import { ContextHelp } from '../ui/ContextHelp';

import {
  FileText, MapPin, Building, DollarSign, Clock, CheckCircle,
  FileQuestion, CalendarClock, BarChart, Info // Added Info icon
} from 'lucide-react';
import {
  ProjectProfile, ProjectDocumentRequirement, ProjectStatus, ProjectPhase,
  InterestRateType, RecoursePreference, ExitStrategy
} from '../../types/enhanced-types';

interface EnhancedProjectFormProps {
  existingProject: ProjectProfile; // Made non-optional as workspace loads it
  onComplete?: (project: ProjectProfile) => void; // Make onComplete optional
  compact?: boolean; // Add compact prop
}

// Define options for ButtonSelect components
const assetTypeOptions = [ "Multifamily", "Office", "Retail", "Industrial", "Hospitality", "Land", "Mixed-Use", "Self-Storage", "Data Center", "Medical Office", "Senior Housing", "Student Housing", "Other" ];
const projectPhaseOptions: ProjectPhase[] = [ 'Acquisition', 'Refinance', 'Construction', 'Bridge', 'Development', 'Value-Add', 'Other' ];
const capitalTypeOptions = [ "Senior Debt", "Mezzanine", "Preferred Equity", "Common Equity", "JV Equity", "Other" ];
const interestRateTypeOptions: InterestRateType[] = [ 'Not Specified', 'Fixed', 'Floating' ];
const recourseOptions: RecoursePreference[] = [ 'Flexible', 'Full Recourse', 'Partial Recourse', 'Non-Recourse' ];
const exitStrategyOptions: ExitStrategy[] = [ 'Undecided', 'Sale', 'Refinance', 'Long-Term Hold' ];
const stateOptions = [ // Keep states for Select component
    { value: '', label: 'Select a state...' },
    { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' }, { value: 'AZ', label: 'Arizona' }, { value: 'AR', label: 'Arkansas' }, { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' }, { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' }, { value: 'FL', label: 'Florida' }, { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' }, { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' }, { value: 'IA', label: 'Iowa' },
    { value: 'KS', label: 'Kansas' }, { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' }, { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' }, { value: 'MI', label: 'Michigan' }, { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' }, { value: 'MO', label: 'Missouri' },
    { value: 'MT', label: 'Montana' }, { value: 'NE', label: 'Nebraska' }, { value: 'NV', label: 'Nevada' }, { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' }, { value: 'NC', label: 'North Carolina' }, { value: 'ND', label: 'North Dakota' }, { value: 'OH', label: 'Ohio' },
    { value: 'OK', label: 'Oklahoma' }, { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' }, { value: 'RI', label: 'Rhode Island' }, { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' }, { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' }, { value: 'VT', label: 'Vermont' },
    { value: 'VA', label: 'Virginia' }, { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' }, { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' },
    { value: 'DC', label: 'District of Columbia' },
];


export const EnhancedProjectForm: React.FC<EnhancedProjectFormProps> = ({
  existingProject,
  onComplete
}) => {
  const router = useRouter();
  const { updateProject, setProjectChanges, autoSaveProject } = useProjects(); // Use updateProject
  const { showNotification } = useUI();

  // Form state initialized from existingProject prop
  const [formData, setFormData] = useState<ProjectProfile>(existingProject);
  const [formSaved, setFormSaved] = useState(false); // State for save button feedback


  // Update local form state if the existingProject prop changes externally
  useEffect(() => {
    setFormData(existingProject);
  }, [existingProject]);

  // Handle form field changes
  const handleInputChange = (field: keyof ProjectProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setProjectChanges(true); // Indicate unsaved changes
  };

  // Handle form submission (manual save via button)
  const handleFormSubmit = async () => {
    try {
        setFormSaved(true); // Indicate loading/saving
        // Ensure auto-save triggers first if there are pending changes
        await autoSaveProject();

        // Optionally call updateProject again for a final explicit save if needed,
        // but autoSaveProject should handle persisting the latest formData state.
        // const updatedProject = await updateProject(formData.id, formData, true); // Manual flag true

        // Let's rely on auto-save for now and just provide feedback
        showNotification({ type: 'success', message: 'Project changes saved.' });

        if (onComplete) {
            // Pass the current formData state which reflects the latest changes
            onComplete(formData);
        }

    } catch (error) {
        console.error('Error saving project:', error);
        showNotification({ type: 'error', message: 'Failed to save project.' });
    } finally {
         // Reset saved indicator after a short delay
        setTimeout(() => setFormSaved(false), 2000);
    }
  };


  // --- Define Steps for FormWizard ---
  const steps: Step[] = useMemo(() => [ // Use useMemo to prevent re-creation on every render
    // --- Step 1: Basic Information ---
    {
      id: 'basic-info',
      title: 'Basic Info',
      component: (
        <Card>
          <CardHeader className="pb-3 border-b">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" /> Project Information
            </h2>
          </CardHeader>
          <CardContent className="p-4 space-y-6">
            <FormGroup> <Input id="projectName" label="Project Name" value={formData.projectName || ''} onChange={(e) => handleInputChange('projectName', e.target.value)} placeholder="e.g., Riverfront Acquisition" required /> </FormGroup>
            {/* Property Address Section */}
            <div className="border-t pt-4">
                <h3 className="text-md font-medium text-gray-800 mb-3 flex items-center"><MapPin className="h-4 w-4 mr-2 text-blue-600" /> Property Address</h3>
                <FormGroup> <Input id="propertyAddressStreet" label="Street Address" value={formData.propertyAddressStreet || ''} onChange={(e) => handleInputChange('propertyAddressStreet', e.target.value)} placeholder="123 Main Street" required /> </FormGroup>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <FormGroup> <Input id="propertyAddressCity" label="City" value={formData.propertyAddressCity || ''} onChange={(e) => handleInputChange('propertyAddressCity', e.target.value)} placeholder="Anytown" required /> </FormGroup>
                    {/* State uses Select */}
                    <FormGroup> <Select id="propertyAddressState" label="State" value={formData.propertyAddressState || ''} onChange={(e) => handleInputChange('propertyAddressState', e.target.value)} options={stateOptions} required /> </FormGroup>
                    <FormGroup> <Input id="propertyAddressZip" label="ZIP Code" value={formData.propertyAddressZip || ''} onChange={(e) => handleInputChange('propertyAddressZip', e.target.value)} placeholder="12345" required /> </FormGroup>
                </div>
                <FormGroup className="mt-4"> <Input id="propertyAddressCounty" label="County" value={formData.propertyAddressCounty || ''} onChange={(e) => handleInputChange('propertyAddressCounty', e.target.value)} placeholder="e.g., Orange County" /> </FormGroup>
            </div>
             {/* Property Info Section */}
            <div className="border-t pt-4">
                 <h3 className="text-md font-medium text-gray-800 mb-3 flex items-center"><Building className="h-4 w-4 mr-2 text-blue-600" /> Property Information</h3>
                 {/* Asset Type uses ButtonSelect */}
                 <FormGroup> <ButtonSelect label="Asset Type" options={assetTypeOptions} selectedValue={formData.assetType || ''} onSelect={(value) => handleInputChange('assetType', value)} required /> </FormGroup>
                 {/* Project Phase uses ButtonSelect */}
                 <FormGroup className="mt-4"> <ButtonSelect label="Project Phase / Deal Type" options={projectPhaseOptions} selectedValue={formData.projectPhase || ''} onSelect={(value) => handleInputChange('projectPhase', value as ProjectPhase)} required /> </FormGroup>
                 {/* Project Description uses Textarea */}
                 <FormGroup className="mt-4"> <label className="block text-sm font-medium text-gray-700 mb-1"> Project Description </label> <textarea id="projectDescription" value={formData.projectDescription || ''} onChange={(e) => handleInputChange('projectDescription', e.target.value)} placeholder="Brief description of the project..." className="w-full h-24 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" required /> </FormGroup>
            </div>
          </CardContent>
        </Card>
      ),
    },
    // --- Step 2: Loan Information ---
     {
      id: 'loan-info',
      title: 'Loan Info',
      component: (
        <Card>
          <CardHeader className="pb-3 border-b"> <h2 className="text-xl font-semibold text-gray-800 flex items-center"><DollarSign className="h-5 w-5 mr-2 text-blue-600" /> Loan Request Details</h2> </CardHeader>
          <CardContent className="p-4 space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormGroup> <Input id="loanAmountRequested" type="number" label="Requested Loan Amount ($)" value={formData.loanAmountRequested?.toString() || ''} onChange={(e) => handleInputChange('loanAmountRequested', e.target.value ? Number(e.target.value) : 0)} placeholder="e.g., 10000000" required /> </FormGroup>
                 {/* Capital Type uses ButtonSelect */}
                <FormGroup> <ButtonSelect label="Capital Type" options={capitalTypeOptions} selectedValue={formData.loanType || ''} onSelect={(value) => handleInputChange('loanType', value)} required /> </FormGroup>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormGroup> <Input id="targetLtvPercent" type="number" label="Target LTV (%)" value={formData.targetLtvPercent?.toString() || ''} onChange={(e) => handleInputChange('targetLtvPercent', e.target.value ? Number(e.target.value) : 0)} placeholder="e.g., 70" required /> </FormGroup>
                <FormGroup> <Input id="targetLtcPercent" type="number" label="Target LTC (%) (Construction/Dev)" value={formData.targetLtcPercent?.toString() || ''} onChange={(e) => handleInputChange('targetLtcPercent', e.target.value ? Number(e.target.value) : 0)} placeholder="e.g., 80" /> </FormGroup>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormGroup> <Input id="amortizationYears" type="number" label="Amortization (Years)" value={formData.amortizationYears?.toString() || ''} onChange={(e) => handleInputChange('amortizationYears', e.target.value ? Number(e.target.value) : 0)} placeholder="e.g., 30" /> </FormGroup>
                <FormGroup> <Input id="interestOnlyPeriodMonths" type="number" label="Interest-Only Period (Months)" value={formData.interestOnlyPeriodMonths?.toString() || ''} onChange={(e) => handleInputChange('interestOnlyPeriodMonths', e.target.value ? Number(e.target.value) : 0)} placeholder="e.g., 36" /> </FormGroup>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Interest Rate Type uses ButtonSelect */}
                <FormGroup> <ButtonSelect label="Interest Rate Type" options={interestRateTypeOptions} selectedValue={formData.interestRateType || 'Not Specified'} onSelect={(value) => handleInputChange('interestRateType', value as InterestRateType)} /> </FormGroup>
                <FormGroup> <Input id="targetCloseDate" type="date" label="Target Close Date" value={formData.targetCloseDate || ''} onChange={(e) => handleInputChange('targetCloseDate', e.target.value)} /> </FormGroup>
             </div>
             {/* Recourse Preference uses ButtonSelect */}
             <FormGroup> <ButtonSelect label="Recourse Preference" options={recourseOptions} selectedValue={formData.recoursePreference || 'Flexible'} onSelect={(value) => handleInputChange('recoursePreference', value as RecoursePreference)} /> </FormGroup>
             {/* Use of Proceeds uses Textarea */}
             <FormGroup> <label className="block text-sm font-medium text-gray-700 mb-1"> Use of Proceeds </label> <textarea id="useOfProceeds" value={formData.useOfProceeds || ''} onChange={(e) => handleInputChange('useOfProceeds', e.target.value)} placeholder="Describe how the loan proceeds will be used..." className="w-full h-24 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" required /> </FormGroup>
          </CardContent>
        </Card>
      ),
    },
     // --- Step 3: Financial Information ---
     {
      id: 'financials',
      title: 'Financials',
      component: (
        <Card>
          <CardHeader className="pb-3 border-b"> <h2 className="text-xl font-semibold text-gray-800 flex items-center"><BarChart className="h-5 w-5 mr-2 text-blue-600" /> Financial Information</h2> </CardHeader>
          <CardContent className="p-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormGroup> <Input id="purchasePrice" type="number" label="Purchase Price / Current Basis ($)" value={formData.purchasePrice?.toString() || ''} onChange={(e) => handleInputChange('purchasePrice', e.target.value ? Number(e.target.value) : null)} placeholder="e.g., 15000000" /> </FormGroup>
              <FormGroup> <Input id="totalProjectCost" type="number" label="Total Project Cost ($)" value={formData.totalProjectCost?.toString() || ''} onChange={(e) => handleInputChange('totalProjectCost', e.target.value ? Number(e.target.value) : null)} placeholder="e.g., 18000000" /> </FormGroup>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormGroup> <Input id="capexBudget" type="number" label="CapEx Budget ($)" value={formData.capexBudget?.toString() || ''} onChange={(e) => handleInputChange('capexBudget', e.target.value ? Number(e.target.value) : null)} placeholder="e.g., 1500000" /> </FormGroup>
              <FormGroup> <Input id="equityCommittedPercent" type="number" label="Equity Committed (%)" value={formData.equityCommittedPercent?.toString() || ''} onChange={(e) => handleInputChange('equityCommittedPercent', e.target.value ? Number(e.target.value) : 0)} placeholder="e.g., 100" /> </FormGroup>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormGroup> <Input id="propertyNoiT12" type="number" label="Current/T12 NOI ($)" value={formData.propertyNoiT12?.toString() || ''} onChange={(e) => handleInputChange('propertyNoiT12', e.target.value ? Number(e.target.value) : null)} placeholder="e.g., 450000" /> </FormGroup>
               <FormGroup> <Input id="stabilizedNoiProjected" type="number" label="Projected Stabilized NOI ($)" value={formData.stabilizedNoiProjected?.toString() || ''} onChange={(e) => handleInputChange('stabilizedNoiProjected', e.target.value ? Number(e.target.value) : null)} placeholder="e.g., 750000" /> </FormGroup>
             </div>
             {/* Exit Strategy uses ButtonSelect */}
             <FormGroup> <ButtonSelect label="Exit Strategy" options={exitStrategyOptions} selectedValue={formData.exitStrategy || 'Undecided'} onSelect={(value) => handleInputChange('exitStrategy', value as ExitStrategy)} /> </FormGroup>
             {/* Business Plan & Market Overview use Textarea */}
             <FormGroup> <label className="block text-sm font-medium text-gray-700 mb-1"> Business Plan Summary </label> <textarea id="businessPlanSummary" value={formData.businessPlanSummary || ''} onChange={(e) => handleInputChange('businessPlanSummary', e.target.value)} placeholder="Summary of your business plan..." className="w-full h-24 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" /> </FormGroup>
             <FormGroup> <label className="block text-sm font-medium text-gray-700 mb-1"> Market Overview </label> <textarea id="marketOverviewSummary" value={formData.marketOverviewSummary || ''} onChange={(e) => handleInputChange('marketOverviewSummary', e.target.value)} placeholder="Brief overview of the market..." className="w-full h-24 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" /> </FormGroup>
          </CardContent>
        </Card>
      ),
    },
     // --- Step 4: Documents --- (Simplified view, actual upload logic TBD)
     {
      id: 'documents',
      title: 'Documents',
      component: (
        <Card>
          <CardHeader className="pb-3 border-b"> <h2 className="text-xl font-semibold text-gray-800 flex items-center"><FileQuestion className="h-5 w-5 mr-2 text-blue-600" /> Required Documents</h2> </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-md text-sm text-blue-800 flex items-start space-x-2">
                <Info size={18} className="flex-shrink-0 mt-0.5"/>
                <span>Upload relevant documents here or later via the document manager. Providing key documents now (like PFS, Rent Roll, Operating Statements) can expedite the matching process.</span>
            </div>
            {/* Simplified list - Replace with actual DocumentUpload components if needed */}
            <p className="text-gray-600">Document upload section placeholder. Common requirements:</p>
            <ul className="list-disc list-inside text-sm text-gray-500 pl-4 space-y-1">
                <li>Personal Financial Statement (PFS)</li>
                <li>Schedule of Real Estate Owned (SREO)</li>
                <li>Rent Roll (if applicable)</li>
                <li>Operating Statements (T-12 / T-3)</li>
                <li>Pro Forma / Budget</li>
                <li>Purchase Agreement (if Acquisition)</li>
            </ul>
             <Button onClick={() => router.push(`/project/documents/${formData.id}`)} variant="outline">Manage Documents</Button>
          </CardContent>
        </Card>
      ),
    },
    // --- Step 5: Review & Submit ---
     {
      id: 'review',
      title: 'Review',
      component: (
        <Card>
          <CardHeader className="pb-3 border-b"> <h2 className="text-xl font-semibold text-gray-800 flex items-center"><CheckCircle className="h-5 w-5 mr-2 text-blue-600" /> Review & Save</h2> </CardHeader>
          <CardContent className="p-4 space-y-6">
             <p className="text-gray-700">Review the information entered. Your project auto-saves, but you can manually save changes below.</p>
             {/* Add a summary display of formData if needed */}
             {/* ... Summary ... */}
             <div className="flex justify-center mt-6">
                 <Button variant="primary" onClick={handleFormSubmit} isLoading={formSaved} disabled={formSaved}>
                     {formSaved ? 'Saved!' : 'Save Changes'}
                 </Button>
             </div>
             <p className="text-center text-xs text-gray-500 mt-2">Your advisor will be notified of significant updates.</p>
          </CardContent>
        </Card>
      ),
    },
  ], [formData, formSaved, handleInputChange, handleFormSubmit, router]); // Include dependencies for useMemo

  return (
    <FormWizard
      steps={steps}
      onComplete={handleFormSubmit} // Trigger save on final step if needed
      showProgressBar={true}
      showStepIndicators={true}
      allowSkip={true} // Allow skipping optional steps
    />
  );
};