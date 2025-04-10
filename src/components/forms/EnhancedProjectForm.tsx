// src/components/forms/EnhancedProjectForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FormWizard, Step } from '../ui/FormWizard';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Form, FormGroup } from '../ui/Form';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { MultiSelect } from '../ui/MultiSelect';
import { DocumentUpload } from '../ui/DocumentUpload';
import { useProjects } from '../../hooks/useProjects';
import { useBorrowerProfile } from '../../hooks/useBorrowerProfile';
import { useUI } from '../../hooks/useUI';
import { 
  FileText, 
  MapPin, 
  Building, 
  DollarSign, 
  Clock, 
  CheckCircle,
  FileQuestion,
  CalendarClock,
  BarChart
} from 'lucide-react';
import { 
  ProjectProfile,
  ProjectDocumentRequirement,
  ProjectStatus, 
  ProjectPhase,
  InterestRateType,
  RecoursePreference,
  ExitStrategy
} from '../../types/enhanced-types';

interface EnhancedProjectFormProps {
  existingProject?: ProjectProfile | null;
  onComplete?: (project: ProjectProfile) => void;
}

export const EnhancedProjectForm: React.FC<EnhancedProjectFormProps> = ({ 
  existingProject,
  onComplete
}) => {
  const router = useRouter();
  const { 
    createProject, 
    updateProject, 
    activeProject,
    setActiveProject,
    addDocumentRequirement,
    projectChanges,
    setProjectChanges
  } = useProjects();
  const { borrowerProfile } = useBorrowerProfile();
  const { showNotification } = useUI();
  
  // Project form state
  const [formData, setFormData] = useState<Partial<ProjectProfile>>({
    projectName: '',
    propertyAddressStreet: '',
    propertyAddressCity: '',
    propertyAddressState: '',
    propertyAddressCounty: '',
    propertyAddressZip: '',
    assetType: '',
    projectDescription: '',
    projectPhase: 'Acquisition',
    loanAmountRequested: 0,
    loanType: '',
    targetLtvPercent: 70,
    targetLtcPercent: 80,
    amortizationYears: 30,
    interestOnlyPeriodMonths: 0,
    interestRateType: 'Not Specified',
    targetCloseDate: '',
    useOfProceeds: '',
    recoursePreference: 'Flexible',
    purchasePrice: null,
    totalProjectCost: null,
    capexBudget: null,
    propertyNoiT12: null,
    stabilizedNoiProjected: null,
    exitStrategy: 'Undecided',
    businessPlanSummary: '',
    marketOverviewSummary: '',
    equityCommittedPercent: 0,
    projectStatus: 'Draft',
  });
  
  // Document requirements state
  const [documentRequirements, setDocumentRequirements] = useState<Partial<ProjectDocumentRequirement>[]>([
    { requiredDocType: 'PFS', status: 'Required', notes: 'Personal Financial Statement' },
    { requiredDocType: 'Rent Roll', status: 'Required', notes: 'Current rent roll' },
    { requiredDocType: 'Financials', status: 'Required', notes: 'Operating statements' },
  ]);
  
  const [formSaved, setFormSaved] = useState(false);
  
  // Initialize form with existing project data if available
  useEffect(() => {
    if (existingProject) {
      setFormData({
        projectName: existingProject.projectName,
        propertyAddressStreet: existingProject.propertyAddressStreet,
        propertyAddressCity: existingProject.propertyAddressCity,
        propertyAddressState: existingProject.propertyAddressState,
        propertyAddressCounty: existingProject.propertyAddressCounty,
        propertyAddressZip: existingProject.propertyAddressZip,
        assetType: existingProject.assetType,
        projectDescription: existingProject.projectDescription,
        projectPhase: existingProject.projectPhase,
        loanAmountRequested: existingProject.loanAmountRequested,
        loanType: existingProject.loanType,
        targetLtvPercent: existingProject.targetLtvPercent,
        targetLtcPercent: existingProject.targetLtcPercent,
        amortizationYears: existingProject.amortizationYears,
        interestOnlyPeriodMonths: existingProject.interestOnlyPeriodMonths,
        interestRateType: existingProject.interestRateType,
        targetCloseDate: existingProject.targetCloseDate,
        useOfProceeds: existingProject.useOfProceeds,
        recoursePreference: existingProject.recoursePreference,
        purchasePrice: existingProject.purchasePrice,
        totalProjectCost: existingProject.totalProjectCost,
        capexBudget: existingProject.capexBudget,
        propertyNoiT12: existingProject.propertyNoiT12,
        stabilizedNoiProjected: existingProject.stabilizedNoiProjected,
        exitStrategy: existingProject.exitStrategy,
        businessPlanSummary: existingProject.businessPlanSummary,
        marketOverviewSummary: existingProject.marketOverviewSummary,
        equityCommittedPercent: existingProject.equityCommittedPercent,
        projectStatus: existingProject.projectStatus,
      });
    } else {
      // Check if we have saved lender match criteria from the lender matching page
      const lastFormDataStr = localStorage.getItem('lastFormData');
      if (lastFormDataStr) {
        try {
          const lastFormData = JSON.parse(lastFormDataStr);
          
          // Pre-fill asset type
          if (lastFormData.asset_types && lastFormData.asset_types.length > 0) {
            setFormData(prev => ({
              ...prev,
              assetType: lastFormData.asset_types[0]
            }));
          }
          
          // Pre-fill deal type / project phase
          if (lastFormData.deal_types && lastFormData.deal_types.length > 0) {
            setFormData(prev => ({
              ...prev,
              projectPhase: lastFormData.deal_types[0] as ProjectPhase
            }));
          }
          
          // Pre-fill loan type / capital type
          if (lastFormData.capital_types && lastFormData.capital_types.length > 0) {
            setFormData(prev => ({
              ...prev,
              loanType: lastFormData.capital_types[0]
            }));
          }
        } catch (error) {
          console.error('Error parsing last form data:', error);
        }
      }
    }
  }, [existingProject]);
  
  // Handle form field changes
  const handleInputChange = (field: keyof ProjectProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setProjectChanges(true);
  };
  
  // Handle form submission
  const handleFormSubmit = async () => {
    try {
      if (!borrowerProfile) {
        showNotification({
          type: 'error',
          message: 'Please complete your borrower profile first',
        });
        router.push('/profile');
        return;
      }
      
      if (existingProject) {
        // Update existing project
        const updatedProject = await updateProject(existingProject.id, formData, true);
        
        if (updatedProject) {
          showNotification({
            type: 'success',
            message: 'Project updated successfully',
          });
          
          setFormSaved(true);
          setTimeout(() => setFormSaved(false), 3000);
          
          if (onComplete) {
            onComplete(updatedProject);
          }
        }
      } else {
        // Create new project
        const newProject = await createProject({
          ...formData,
          borrowerProfileId: borrowerProfile.id,
          projectStatus: 'Info Gathering', // Start as Info Gathering when created
        });
        
        showNotification({
          type: 'success',
          message: 'Project created successfully',
        });
        
        // Add document requirements for the new project
        for (const req of documentRequirements) {
          await addDocumentRequirement({
            ...req,
            projectId: newProject.id,
          });
        }
        
        setFormSaved(true);
        setTimeout(() => setFormSaved(false), 3000);
        
        if (onComplete) {
          onComplete(newProject);
        }
      }
    } catch (error) {
      console.error('Error saving project:', error);
      showNotification({
        type: 'error',
        message: 'Failed to save project. Please try again.',
      });
    }
  };

  // Steps for the form wizard
  const steps: Step[] = [
    {
      id: 'basic-info',
      title: 'Basic Information',
      component: (
        <Card>
          <CardHeader className="pb-3 border-b">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Project Information
            </h2>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-6">
              <FormGroup>
                <Input
                  id="projectName"
                  label="Project Name"
                  value={formData.projectName || ''}
                  onChange={(e) => handleInputChange('projectName', e.target.value)}
                  placeholder="e.g., Riverfront Acquisition"
                  required
                />
              </FormGroup>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-md font-medium text-gray-800 mb-3 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                  Property Address
                </h3>
                
                <FormGroup>
                  <Input
                    id="propertyAddressStreet"
                    label="Street Address"
                    value={formData.propertyAddressStreet || ''}
                    onChange={(e) => handleInputChange('propertyAddressStreet', e.target.value)}
                    placeholder="123 Main Street"
                    required
                  />
                </FormGroup>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <FormGroup>
                    <Input
                      id="propertyAddressCity"
                      label="City"
                      value={formData.propertyAddressCity || ''}
                      onChange={(e) => handleInputChange('propertyAddressCity', e.target.value)}
                      placeholder="Anytown"
                      required
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <Select
                      id="propertyAddressState"
                      label="State"
                      value={formData.propertyAddressState || ''}
                      onChange={(e) => handleInputChange('propertyAddressState', e.target.value)}
                      options={[
                        { value: '', label: 'Select a state' },
                        { value: 'AL', label: 'Alabama' },
                        { value: 'AK', label: 'Alaska' },
                        { value: 'AZ', label: 'Arizona' },
                        { value: 'AR', label: 'Arkansas' },
                        { value: 'CA', label: 'California' },
                        { value: 'CO', label: 'Colorado' },
                        { value: 'CT', label: 'Connecticut' },
                        { value: 'DE', label: 'Delaware' },
                        { value: 'FL', label: 'Florida' },
                        { value: 'GA', label: 'Georgia' },
                        { value: 'HI', label: 'Hawaii' },
                        { value: 'ID', label: 'Idaho' },
                        { value: 'IL', label: 'Illinois' },
                        { value: 'IN', label: 'Indiana' },
                        { value: 'IA', label: 'Iowa' },
                        { value: 'KS', label: 'Kansas' },
                        { value: 'KY', label: 'Kentucky' },
                        { value: 'LA', label: 'Louisiana' },
                        { value: 'ME', label: 'Maine' },
                        { value: 'MD', label: 'Maryland' },
                        { value: 'MA', label: 'Massachusetts' },
                        { value: 'MI', label: 'Michigan' },
                        { value: 'MN', label: 'Minnesota' },
                        { value: 'MS', label: 'Mississippi' },
                        { value: 'MO', label: 'Missouri' },
                        { value: 'MT', label: 'Montana' },
                        { value: 'NE', label: 'Nebraska' },
                        { value: 'NV', label: 'Nevada' },
                        { value: 'NH', label: 'New Hampshire' },
                        { value: 'NJ', label: 'New Jersey' },
                        { value: 'NM', label: 'New Mexico' },
                        { value: 'NY', label: 'New York' },
                        { value: 'NC', label: 'North Carolina' },
                        { value: 'ND', label: 'North Dakota' },
                        { value: 'OH', label: 'Ohio' },
                        { value: 'OK', label: 'Oklahoma' },
                        { value: 'OR', label: 'Oregon' },
                        { value: 'PA', label: 'Pennsylvania' },
                        { value: 'RI', label: 'Rhode Island' },
                        { value: 'SC', label: 'South Carolina' },
                        { value: 'SD', label: 'South Dakota' },
                        { value: 'TN', label: 'Tennessee' },
                        { value: 'TX', label: 'Texas' },
                        { value: 'UT', label: 'Utah' },
                        { value: 'VT', label: 'Vermont' },
                        { value: 'VA', label: 'Virginia' },
                        { value: 'WA', label: 'Washington' },
                        { value: 'WV', label: 'West Virginia' },
                        { value: 'WI', label: 'Wisconsin' },
                        { value: 'WY', label: 'Wyoming' },
                        { value: 'DC', label: 'District of Columbia' },
                      ]}
                      required
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <Input
                      id="propertyAddressZip"
                      label="ZIP Code"
                      value={formData.propertyAddressZip || ''}
                      onChange={(e) => handleInputChange('propertyAddressZip', e.target.value)}
                      placeholder="12345"
                      required
                    />
                  </FormGroup>
                </div>
                
                <FormGroup className="mt-4">
                  <Input
                    id="propertyAddressCounty"
                    label="County"
                    value={formData.propertyAddressCounty || ''}
                    onChange={(e) => handleInputChange('propertyAddressCounty', e.target.value)}
                    placeholder="e.g., Orange County"
                  />
                </FormGroup>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-md font-medium text-gray-800 mb-3 flex items-center">
                  <Building className="h-4 w-4 mr-2 text-blue-600" />
                  Property Information
                </h3>
                
                <FormGroup>
                  <Select
                    id="assetType"
                    label="Asset Type"
                    value={formData.assetType || ''}
                    onChange={(e) => handleInputChange('assetType', e.target.value)}
                    options={[
                      { value: '', label: 'Select an asset type' },
                      { value: 'Multifamily', label: 'Multifamily' },
                      { value: 'Office', label: 'Office' },
                      { value: 'Retail', label: 'Retail' },
                      { value: 'Industrial', label: 'Industrial' },
                      { value: 'Hospitality', label: 'Hospitality' },
                      { value: 'Land', label: 'Land' },
                      { value: 'Mixed-Use', label: 'Mixed-Use' },
                      { value: 'Self-Storage', label: 'Self-Storage' },
                      { value: 'Data Center', label: 'Data Center' },
                      { value: 'Medical Office', label: 'Medical Office' },
                      { value: 'Senior Housing', label: 'Senior Housing' },
                      { value: 'Student Housing', label: 'Student Housing' },
                      { value: 'Other', label: 'Other' },
                    ]}
                    required
                  />
                </FormGroup>
                
                <FormGroup className="mt-4">
                  <Select
                    id="projectPhase"
                    label="Project Phase/Deal Type"
                    value={formData.projectPhase || 'Acquisition'}
                    onChange={(e) => handleInputChange('projectPhase', e.target.value as ProjectPhase)}
                    options={[
                      { value: 'Acquisition', label: 'Acquisition' },
                      { value: 'Refinance', label: 'Refinance' },
                      { value: 'Construction', label: 'Construction' },
                      { value: 'Bridge', label: 'Bridge' },
                      { value: 'Development', label: 'Development' },
                      { value: 'Value-Add', label: 'Value-Add' },
                      { value: 'Other', label: 'Other' },
                    ]}
                    required
                  />
                </FormGroup>
                
                <FormGroup className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Description
                  </label>
                  <textarea
                    id="projectDescription"
                    value={formData.projectDescription || ''}
                    onChange={(e) => handleInputChange('projectDescription', e.target.value)}
                    placeholder="Brief description of the project..."
                    className="w-full h-24 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </FormGroup>
              </div>
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      id: 'loan-info',
      title: 'Loan Information',
      component: (
        <Card>
          <CardHeader className="pb-3 border-b">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
              Loan Request Details
            </h2>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormGroup>
                  <Input
                    id="loanAmountRequested"
                    type="number"
                    label="Requested Loan Amount ($)"
                    value={formData.loanAmountRequested?.toString() || '0'}
                    onChange={(e) => handleInputChange('loanAmountRequested', Number(e.target.value))}
                    placeholder="e.g., 10000000"
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <Select
                    id="loanType"
                    label="Capital Type"
                    value={formData.loanType || ''}
                    onChange={(e) => handleInputChange('loanType', e.target.value)}
                    options={[
                      { value: '', label: 'Select capital type' },
                      { value: 'Senior Debt', label: 'Senior Debt' },
                      { value: 'Mezzanine', label: 'Mezzanine' },
                      { value: 'Preferred Equity', label: 'Preferred Equity' },
                      { value: 'Common Equity', label: 'Common Equity' },
                      { value: 'JV Equity', label: 'JV Equity' },
                      { value: 'Other', label: 'Other' },
                    ]}
                    required
                  />
                </FormGroup>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormGroup>
                  <Input
                    id="targetLtvPercent"
                    type="number"
                    label="Target LTV (%)"
                    value={formData.targetLtvPercent?.toString() || '70'}
                    onChange={(e) => handleInputChange('targetLtvPercent', Number(e.target.value))}
                    placeholder="e.g., 70"
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <Input
                    id="targetLtcPercent"
                    type="number"
                    label="Target LTC (%) - For construction/development"
                    value={formData.targetLtcPercent?.toString() || '80'}
                    onChange={(e) => handleInputChange('targetLtcPercent', Number(e.target.value))}
                    placeholder="e.g., 80"
                  />
                </FormGroup>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormGroup>
                  <Input
                    id="amortizationYears"
                    type="number"
                    label="Amortization (Years)"
                    value={formData.amortizationYears?.toString() || '30'}
                    onChange={(e) => handleInputChange('amortizationYears', Number(e.target.value))}
                    placeholder="e.g., 30"
                  />
                </FormGroup>
                
                <FormGroup>
                  <Input
                    id="interestOnlyPeriodMonths"
                    type="number"
                    label="Interest-Only Period (Months)"
                    value={formData.interestOnlyPeriodMonths?.toString() || '0'}
                    onChange={(e) => handleInputChange('interestOnlyPeriodMonths', Number(e.target.value))}
                    placeholder="e.g., 36"
                  />
                </FormGroup>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormGroup>
                  <Select
                    id="interestRateType"
                    label="Interest Rate Type"
                    value={formData.interestRateType || 'Not Specified'}
                    onChange={(e) => handleInputChange('interestRateType', e.target.value as InterestRateType)}
                    options={[
                      { value: 'Not Specified', label: 'Not Specified' },
                      { value: 'Fixed', label: 'Fixed' },
                      { value: 'Floating', label: 'Floating' },
                    ]}
                  />
                </FormGroup>
                
                <FormGroup>
                  <Input
                    id="targetCloseDate"
                    type="date"
                    label="Target Close Date"
                    value={formData.targetCloseDate || ''}
                    onChange={(e) => handleInputChange('targetCloseDate', e.target.value)}
                  />
                </FormGroup>
              </div>
              
              <FormGroup>
                <Select
                  id="recoursePreference"
                  label="Recourse Preference"
                  value={formData.recoursePreference || 'Flexible'}
                  onChange={(e) => handleInputChange('recoursePreference', e.target.value as RecoursePreference)}
                  options={[
                    { value: 'Flexible', label: 'Flexible' },
                    { value: 'Full Recourse', label: 'Full Recourse' },
                    { value: 'Partial Recourse', label: 'Partial Recourse' },
                    { value: 'Non-Recourse', label: 'Non-Recourse' },
                  ]}
                />
              </FormGroup>
              
              <FormGroup>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Use of Proceeds
                </label>
                <textarea
                  id="useOfProceeds"
                  value={formData.useOfProceeds || ''}
                  onChange={(e) => handleInputChange('useOfProceeds', e.target.value)}
                  placeholder="Describe how the loan proceeds will be used..."
                  className="w-full h-24 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </FormGroup>
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      id: 'financials',
      title: 'Financial Information',
      component: (
        <Card>
          <CardHeader className="pb-3 border-b">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <BarChart className="h-5 w-5 mr-2 text-blue-600" />
              Financial Information
            </h2>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormGroup>
                  <Input
                    id="purchasePrice"
                    type="number"
                    label="Purchase Price / Current Basis ($)"
                    value={formData.purchasePrice?.toString() || ''}
                    onChange={(e) => handleInputChange('purchasePrice', e.target.value ? Number(e.target.value) : null)}
                    placeholder="e.g., 15000000"
                  />
                </FormGroup>
                
                <FormGroup>
                  <Input
                    id="totalProjectCost"
                    type="number"
                    label="Total Project Cost ($)"
                    value={formData.totalProjectCost?.toString() || ''}
                    onChange={(e) => handleInputChange('totalProjectCost', e.target.value ? Number(e.target.value) : null)}
                    placeholder="e.g., 18000000"
                  />
                </FormGroup>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormGroup>
                  <Input
                    id="capexBudget"
                    type="number"
                    label="CapEx Budget ($)"
                    value={formData.capexBudget?.toString() || ''}
                    onChange={(e) => handleInputChange('capexBudget', e.target.value ? Number(e.target.value) : null)}
                    placeholder="e.g., 1500000"
                  />
                </FormGroup>
                
                <FormGroup>
                  <Input
                    id="equityCommittedPercent"
                    type="number"
                    label="Equity Committed (%)"
                    value={formData.equityCommittedPercent?.toString() || '0'}
                    onChange={(e) => handleInputChange('equityCommittedPercent', Number(e.target.value))}
                    placeholder="e.g., 100"
                  />
                </FormGroup>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormGroup>
                  <Input
                    id="propertyNoiT12"
                    type="number"
                    label="Current/T12 NOI ($)"
                    value={formData.propertyNoiT12?.toString() || ''}
                    onChange={(e) => handleInputChange('propertyNoiT12', e.target.value ? Number(e.target.value) : null)}
                    placeholder="e.g., 450000"
                  />
                </FormGroup>
                
                <FormGroup>
                  <Input
                    id="stabilizedNoiProjected"
                    type="number"
                    label="Projected Stabilized NOI ($)"
                    value={formData.stabilizedNoiProjected?.toString() || ''}
                    onChange={(e) => handleInputChange('stabilizedNoiProjected', e.target.value ? Number(e.target.value) : null)}
                    placeholder="e.g., 750000"
                  />
                </FormGroup>
              </div>
              
              <FormGroup>
                <Select
                  id="exitStrategy"
                  label="Exit Strategy"
                  value={formData.exitStrategy || 'Undecided'}
                  onChange={(e) => handleInputChange('exitStrategy', e.target.value as ExitStrategy)}
                  options={[
                    { value: 'Undecided', label: 'Undecided' },
                    { value: 'Sale', label: 'Sale' },
                    { value: 'Refinance', label: 'Refinance' },
                    { value: 'Long-Term Hold', label: 'Long-Term Hold' },
                  ]}
                />
              </FormGroup>
              
              <FormGroup>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Plan Summary
                </label>
                <textarea
                  id="businessPlanSummary"
                  value={formData.businessPlanSummary || ''}
                  onChange={(e) => handleInputChange('businessPlanSummary', e.target.value)}
                  placeholder="Summary of your business plan for this property..."
                  className="w-full h-24 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </FormGroup>
              
              <FormGroup>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Market Overview
                </label>
                <textarea
                  id="marketOverviewSummary"
                  value={formData.marketOverviewSummary || ''}
                  onChange={(e) => handleInputChange('marketOverviewSummary', e.target.value)}
                  placeholder="Brief overview of the market where the property is located..."
                  className="w-full h-24 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </FormGroup>
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      id: 'documents',
      title: 'Required Documents',
      component: (
        <Card>
          <CardHeader className="pb-3 border-b">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <FileQuestion className="h-5 w-5 mr-2 text-blue-600" />
              Required Documents
            </h2>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-6">
              <p className="text-gray-600 mb-4">
                The following documents are typically required to evaluate your loan request. You can upload them now or later.
              </p>
              
              <div className="space-y-6">
                <DocumentUpload
                  label="Personal Financial Statement (PFS)"
                  description="Current personal financial statement for all key principals"
                  documentType="PFS"
                  projectId={existingProject?.id}
                  onUpload={() => {
                    showNotification({
                      type: 'success',
                      message: 'Document uploaded successfully',
                    });
                  }}
                />
                
                <DocumentUpload
                  label="Rent Roll"
                  description="Current rent roll for the property"
                  documentType="Rent Roll"
                  projectId={existingProject?.id}
                  onUpload={() => {
                    showNotification({
                      type: 'success',
                      message: 'Document uploaded successfully',
                    });
                  }}
                />
                
                <DocumentUpload
                  label="Operating Statements"
                  description="Historical and/or projected operating statements"
                  documentType="Financials"
                  projectId={existingProject?.id}
                  onUpload={() => {
                    showNotification({
                      type: 'success',
                      message: 'Document uploaded successfully',
                    });
                  }}
                />
                
                <DocumentUpload
                  label="Pro Forma"
                  description="Projected financial model for the property"
                  documentType="Pro Forma"
                  projectId={existingProject?.id}
                  onUpload={() => {
                    showNotification({
                      type: 'success',
                      message: 'Document uploaded successfully',
                    });
                  }}
                />
                
                {formData.projectPhase === 'Acquisition' && (
                  <DocumentUpload
                    label="Purchase Agreement"
                    description="Executed purchase agreement or letter of intent"
                    documentType="Purchase Agreement"
                    projectId={existingProject?.id}
                    onUpload={() => {
                      showNotification({
                        type: 'success',
                        message: 'Document uploaded successfully',
                      });
                    }}
                  />
                )}
                
                {['Construction', 'Development'].includes(formData.projectPhase || '') && (
                  <>
                    <DocumentUpload
                      label="Plans & Specifications"
                      description="Architectural plans and specifications"
                      documentType="Plans"
                      projectId={existingProject?.id}
                      onUpload={() => {
                        showNotification({
                          type: 'success',
                          message: 'Document uploaded successfully',
                        });
                      }}
                    />
                    
                    <DocumentUpload
                      label="Construction Budget"
                      description="Detailed construction budget"
                      documentType="Budget"
                      projectId={existingProject?.id}
                      onUpload={() => {
                        showNotification({
                          type: 'success',
                          message: 'Document uploaded successfully',
                        });
                      }}
                    />
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      id: 'timeline',
      title: 'Timeline & Next Steps',
      component: (
        <Card>
          <CardHeader className="pb-3 border-b">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <CalendarClock className="h-5 w-5 mr-2 text-blue-600" />
              Timeline & Next Steps
            </h2>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="text-lg font-medium text-blue-800 mb-2">What happens next?</h3>
                <ol className="list-decimal ml-5 space-y-2 text-blue-800">
                  <li>Your dedicated capital advisor will review your project details</li>
                  <li>The advisor may request additional information if needed</li>
                  <li>We'll curate a list of lenders that match your project criteria</li>
                  <li>Your advisor will introduce you to selected lenders</li>
                  <li>You'll receive term sheets and your advisor will help you evaluate them</li>
                </ol>
              </div>
              
              <div className="flex items-center p-4 bg-amber-50 rounded-lg border border-amber-100">
                <Clock className="h-8 w-8 text-amber-600 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-amber-800">Timeline Expectations</h3>
                  <p className="text-amber-700 text-sm mt-1">
                    The typical timeline from submission to lender introductions is 3-5 business days,
                    depending on the completeness of your information.
                  </p>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-800 mb-2">Target Closing Timeline</h3>
                <p className="text-gray-600 mb-4">
                  When do you hope to close on this financing?
                </p>
                <FormGroup>
                  <Input
                    id="targetCloseDate"
                    type="date"
                    label="Target Close Date"
                    value={formData.targetCloseDate || ''}
                    onChange={(e) => handleInputChange('targetCloseDate', e.target.value)}
                  />
                </FormGroup>
              </div>
              
              <div className="flex justify-center mt-6">
                <Button
                  variant="primary"
                  onClick={handleFormSubmit}
                  isLoading={formSaved}
                >
                  {existingProject ? (formSaved ? 'Saved!' : 'Update Project') : (formSaved ? 'Saved!' : 'Submit Project')}
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