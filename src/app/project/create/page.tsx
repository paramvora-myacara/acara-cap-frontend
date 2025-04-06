// src/app/project/create/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../../../components/layout/DashboardLayout';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import Typography from '../../../../components/common/Typography';
import { Save, ChevronDown, ChevronUp, MessageSquare, FileText, User, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardFooter } from '../../../../components/ui/card';

interface FormSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  fields: Array<{
    id: string;
    label: string;
    type: string;
    options?: string[];
    value: string;
    required?: boolean;
    placeholder?: string;
  }>;
}

export default function CreateProjectPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [projectName, setProjectName] = useState('');
  const [formSaved, setFormSaved] = useState(false);
  const [borrowerProgress, setBorrowerProgress] = useState(0);
  const [projectProgress, setProjectProgress] = useState(0);
  
  // Borrower resume sections
  const [borrowerSections, setBorrowerSections] = useState<FormSection[]>([
    {
      id: 'basic-info',
      title: 'Basic Information',
      icon: <User className="h-5 w-5" />,
      isOpen: true,
      fields: [
        { id: 'fullName', label: 'Full Legal Name', type: 'text', value: '', required: true, placeholder: 'John Doe' },
        { id: 'email', label: 'Email Address', type: 'email', value: '', required: true, placeholder: 'you@example.com' },
        { id: 'phone', label: 'Phone Number', type: 'tel', value: '', required: true, placeholder: '(123) 456-7890' },
        { id: 'companyName', label: 'Company Name', type: 'text', value: '', required: true, placeholder: 'Acme Properties LLC' },
        { id: 'entityType', label: 'Entity Type', type: 'select', options: ['LLC', 'LP', 'Corporation', 'Individual', 'Other'], value: '', required: true },
      ]
    },
    {
      id: 'experience',
      title: 'Experience & Track Record',
      icon: <CheckCircle className="h-5 w-5" />,
      isOpen: false,
      fields: [
        { id: 'yearsExperience', label: 'Years of Experience', type: 'number', value: '', required: true, placeholder: '5' },
        { id: 'assetClassesExperience', label: 'Asset Classes Experience', type: 'select', options: ['Multifamily', 'Office', 'Retail', 'Industrial', 'Hospitality', 'Mixed-Use', 'Other'], value: '', required: true },
        { id: 'totalDeals', label: 'Total Deals Completed', type: 'number', value: '', required: false, placeholder: '10' },
        { id: 'totalValue', label: 'Total Value of Past Deals ($)', type: 'number', value: '', required: false, placeholder: '5000000' },
      ]
    },
    {
      id: 'financial',
      title: 'Financial Information',
      icon: <FileText className="h-5 w-5" />,
      isOpen: false,
      fields: [
        { id: 'netWorth', label: 'Net Worth ($)', type: 'number', value: '', required: false, placeholder: '2000000' },
        { id: 'liquidity', label: 'Available Liquidity ($)', type: 'number', value: '', required: true, placeholder: '500000' },
        { id: 'creditScore', label: 'Credit Score', type: 'number', value: '', required: false, placeholder: '750' },
      ]
    }
  ]);
  
  // Project resume sections
  const [projectSections, setProjectSections] = useState<FormSection[]>([
    {
      id: 'project-basics',
      title: 'Project Information',
      icon: <FileText className="h-5 w-5" />,
      isOpen: true,
      fields: [
        { id: 'projectName', label: 'Project Name', type: 'text', value: '', required: true, placeholder: 'Riverfront Development' },
        { id: 'address', label: 'Property Address', type: 'text', value: '', required: true, placeholder: '123 Main St, Anytown, US' },
        { id: 'assetType', label: 'Asset Type', type: 'select', options: ['Multifamily', 'Office', 'Retail', 'Industrial', 'Hospitality', 'Land', 'Mixed-Use', 'Self-Storage', 'Data Center', 'Medical Office', 'Senior Housing', 'Student Housing', 'Other'], value: '', required: true },
        { id: 'dealType', label: 'Deal Type', type: 'select', options: ['Acquisition', 'Refinance', 'Construction', 'Bridge', 'Development', 'Value-Add', 'Other'], value: '', required: true },
      ]
    },
    {
      id: 'loan-request',
      title: 'Loan Request',
      icon: <FileText className="h-5 w-5" />,
      isOpen: false,
      fields: [
        { id: 'loanAmount', label: 'Requested Loan Amount ($)', type: 'number', value: '', required: true, placeholder: '10000000' },
        { id: 'capitalType', label: 'Capital Type', type: 'select', options: ['Senior Debt', 'Mezzanine', 'Preferred Equity', 'Common Equity', 'JV Equity', 'Other'], value: '', required: true },
        { id: 'closeDate', label: 'Target Close Date', type: 'date', value: '', required: false },
        { id: 'loanTerm', label: 'Desired Loan Term (Years)', type: 'number', value: '', required: false, placeholder: '5' },
      ]
    },
    {
      id: 'project-financials',
      title: 'Project Financials',
      icon: <FileText className="h-5 w-5" />,
      isOpen: false,
      fields: [
        { id: 'purchasePrice', label: 'Purchase Price / Current Basis ($)', type: 'number', value: '', required: false, placeholder: '15000000' },
        { id: 'totalProjectCost', label: 'Total Project Cost ($)', type: 'number', value: '', required: false, placeholder: '18000000' },
        { id: 'noi', label: 'Stabilized NOI ($)', type: 'number', value: '', required: false, placeholder: '1200000' },
        { id: 'exitStrategy', label: 'Exit Strategy', type: 'select', options: ['Sale', 'Refinance', 'Long-term Hold'], value: '', required: false },
      ]
    }
  ]);

  // Load data from localStorage
  useEffect(() => {
    // Get user email
    const email = localStorage.getItem('userEmail');
    if (email) {
      setUserEmail(email);
      
      // Update the email field in the borrower form
      setBorrowerSections(prev => {
        const newSections = [...prev];
        const basicInfoSection = newSections.find(section => section.id === 'basic-info');
        if (basicInfoSection) {
          const emailField = basicInfoSection.fields.find(field => field.id === 'email');
          if (emailField) {
            emailField.value = email;
          }
        }
        return newSections;
      });
    }

    // Get last form data from the lender selection page
    const lastFormDataStr = localStorage.getItem('lastFormData');
    if (lastFormDataStr) {
      try {
        const lastFormData = JSON.parse(lastFormDataStr);
        
        // Pre-fill asset type
        if (lastFormData.asset_types && lastFormData.asset_types.length > 0) {
          setProjectSections(prev => {
            const newSections = [...prev];
            const basicSection = newSections.find(section => section.id === 'project-basics');
            if (basicSection) {
              const assetTypeField = basicSection.fields.find(field => field.id === 'assetType');
              if (assetTypeField) {
                assetTypeField.value = lastFormData.asset_types[0];
              }
            }
            return newSections;
          });
        }
        
        // Pre-fill deal type
        if (lastFormData.deal_types && lastFormData.deal_types.length > 0) {
          setProjectSections(prev => {
            const newSections = [...prev];
            const basicSection = newSections.find(section => section.id === 'project-basics');
            if (basicSection) {
              const dealTypeField = basicSection.fields.find(field => field.id === 'dealType');
              if (dealTypeField) {
                dealTypeField.value = lastFormData.deal_types[0];
              }
            }
            return newSections;
          });
        }
        
        // Pre-fill capital type
        if (lastFormData.capital_types && lastFormData.capital_types.length > 0) {
          setProjectSections(prev => {
            const newSections = [...prev];
            const loanSection = newSections.find(section => section.id === 'loan-request');
            if (loanSection) {
              const capitalTypeField = loanSection.fields.find(field => field.id === 'capitalType');
              if (capitalTypeField) {
                capitalTypeField.value = lastFormData.capital_types[0];
              }
            }
            return newSections;
          });
        }
      } catch (error) {
        console.error('Error parsing last form data:', error);
      }
    }
  }, []);

  // Calculate progress whenever form values change
  useEffect(() => {
    // Calculate borrower progress
    const totalBorrowerFields = borrowerSections.flatMap(section => section.fields).filter(field => field.required).length;
    const filledBorrowerFields = borrowerSections.flatMap(section => section.fields)
      .filter(field => field.required && field.value.trim() !== '').length;
    
    const newBorrowerProgress = totalBorrowerFields ? Math.round((filledBorrowerFields / totalBorrowerFields) * 100) : 0;
    setBorrowerProgress(newBorrowerProgress);

    // Calculate project progress
    const totalProjectFields = projectSections.flatMap(section => section.fields).filter(field => field.required).length;
    const filledProjectFields = projectSections.flatMap(section => section.fields)
      .filter(field => field.required && field.value.trim() !== '').length;
    
    const newProjectProgress = totalProjectFields ? Math.round((filledProjectFields / totalProjectFields) * 100) : 0;
    setProjectProgress(newProjectProgress);
  }, [borrowerSections, projectSections]);

  // Handle form field changes
  const handleBorrowerFieldChange = (sectionId: string, fieldId: string, value: string) => {
    setBorrowerSections(prevSections => {
      return prevSections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            fields: section.fields.map(field => {
              if (field.id === fieldId) {
                return { ...field, value };
              }
              return field;
            })
          };
        }
        return section;
      });
    });
  };

  const handleProjectFieldChange = (sectionId: string, fieldId: string, value: string) => {
    setProjectSections(prevSections => {
      return prevSections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            fields: section.fields.map(field => {
              if (field.id === fieldId) {
                return { ...field, value };
              }
              return field;
            })
          };
        }
        return section;
      });
    });

    // Update project name if that's the field being changed
    if (fieldId === 'projectName') {
      setProjectName(value);
    }
  };

  // Toggle section visibility
  const toggleBorrowerSection = (sectionId: string) => {
    setBorrowerSections(prevSections => {
      return prevSections.map(section => {
        if (section.id === sectionId) {
          return { ...section, isOpen: !section.isOpen };
        }
        return section;
      });
    });
  };

  const toggleProjectSection = (sectionId: string) => {
    setProjectSections(prevSections => {
      return prevSections.map(section => {
        if (section.id === sectionId) {
          return { ...section, isOpen: !section.isOpen };
        }
        return section;
      });
    });
  };

  // Save project
  const handleSaveProject = () => {
    // Get project name from fields if not set directly
    let finalProjectName = projectName;
    if (!finalProjectName) {
      const projectNameField = projectSections
        .find(section => section.id === 'project-basics')
        ?.fields.find(field => field.id === 'projectName');
      
      finalProjectName = projectNameField?.value || 'Untitled Project';
    }
    
    // Create a sanitized version of the sections without React elements
    const sanitizedBorrowerSections = borrowerSections.map(section => ({
      ...section,
      icon: null, // Remove React element
      fields: section.fields.map(field => ({
        ...field
      }))
    }));
    
    const sanitizedProjectSections = projectSections.map(section => ({
      ...section,
      icon: null, // Remove React element
      fields: section.fields.map(field => ({
        ...field
      }))
    }));
    
    // Create project object with sanitized data
    const project = {
      id: Date.now().toString(),
      name: finalProjectName,
      createdAt: new Date().toISOString(),
      borrowerProgress,
      projectProgress,
      borrowerSections: sanitizedBorrowerSections,
      projectSections: sanitizedProjectSections,
    };
    
    // Get existing projects or create new array
    const existingProjectsStr = localStorage.getItem('userProjects');
    const existingProjects = existingProjectsStr ? JSON.parse(existingProjectsStr) : [];
    
    // Add new project
    const updatedProjects = [...existingProjects, project];
    
    // Save updated projects
    localStorage.setItem('userProjects', JSON.stringify(updatedProjects));
    
    // Show saved confirmation
    setFormSaved(true);
    
    // Reset after 3 seconds
    setTimeout(() => {
      setFormSaved(false);
    }, 3000);
    
    // Navigate to dashboard
    router.push('/dashboard');
  };

  // Get personalized message based on form data
  const getAdvisorMessage = () => {
    // Get asset type from project form
    const assetType = projectSections
      .find(section => section.id === 'project-basics')
      ?.fields.find(field => field.id === 'assetType')?.value || '';
    
    // Get deal type from project form
    const dealType = projectSections
      .find(section => section.id === 'project-basics')
      ?.fields.find(field => field.id === 'dealType')?.value || '';

    // Get capital type from loan request
    const capitalType = projectSections
      .find(section => section.id === 'loan-request')
      ?.fields.find(field => field.id === 'capitalType')?.value || '';

    // Create personalized message based on selected options
    if (assetType && dealType && capitalType) {
      return `Hello! I'm Sarah, your dedicated Capital Markets Advisor at ACARA-Cap. 
      I see you're looking for ${capitalType} financing for a ${assetType} ${dealType} project. 
      That's great! Based on your project details, I've already identified several well-matched lenders. 
      To get the best matches and terms, please complete your Borrower and Project Resumes. 
      I'm here to help every step of the way, so feel free to ask any questions.`;
    } else if (assetType && dealType) {
      return `Hello! I'm Sarah, your dedicated Capital Markets Advisor at ACARA-Cap. 
      I see you're working on a ${assetType} ${dealType} project. I'm excited to help you 
      find the perfect financing solution. Please complete your Borrower and Project Resumes 
      so we can match you with the ideal capital providers. Let me know if you have any questions!`;
    } else {
      return `Hello! I'm Sarah, your dedicated Capital Markets Advisor at ACARA-Cap. 
      I'm here to help you find the ideal financing for your commercial real estate project. 
      Please complete your Borrower and Project Resumes so we can match you with suitable lenders. 
      Don't hesitate to reach out if you have any questions or need assistance.`;
    }
  };

  return (
    <DashboardLayout title="Create New Project">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Borrower Resume */}
        <div className="lg:col-span-1">
          <Card className="shadow-md">
            <CardHeader className="pb-3 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Borrower Resume
                </h2>
                <div className="text-sm font-medium text-blue-600">
                  {borrowerProgress}% Complete
                </div>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                <div 
                  className="h-full rounded-full bg-blue-600 transition-all duration-300 ease-in-out" 
                  style={{ width: `${borrowerProgress}%` }}
                />
              </div>
            </CardHeader>
            
            <CardContent className="px-4 py-3">
              {borrowerSections.map((section) => (
                <div key={section.id} className="mb-4 border rounded-md overflow-hidden">
                  <div 
                    className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer"
                    onClick={() => toggleBorrowerSection(section.id)}
                  >
                    <div className="flex items-center">
                      <span className="mr-2 text-blue-600">{section.icon}</span>
                      <h3 className="font-medium text-gray-800">{section.title}</h3>
                    </div>
                    <button className="text-gray-500 hover:text-gray-700">
                      {section.isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  {section.isOpen && (
                    <div className="p-4 space-y-4">
                      {section.fields.map((field) => (
                        <div key={field.id} className="space-y-1">
                          <label htmlFor={`borrower-${section.id}-${field.id}`} className="block text-sm font-medium text-gray-700">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                          </label>
                          
                          {field.type === 'select' ? (
                            <select
                              id={`borrower-${section.id}-${field.id}`}
                              value={field.value}
                              onChange={(e) => handleBorrowerFieldChange(section.id, field.id, e.target.value)}
                              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required={field.required}
                            >
                              <option value="">Select...</option>
                              {field.options?.map((option) => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          ) : field.type === 'textarea' ? (
                            <textarea
                              id={`borrower-${section.id}-${field.id}`}
                              value={field.value}
                              onChange={(e) => handleBorrowerFieldChange(section.id, field.id, e.target.value)}
                              placeholder={field.placeholder}
                              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required={field.required}
                              rows={4}
                            />
                          ) : (
                            <Input
                              id={`borrower-${section.id}-${field.id}`}
                              type={field.type}
                              value={field.value}
                              onChange={(e) => handleBorrowerFieldChange(section.id, field.id, e.target.value)}
                              placeholder={field.placeholder}
                              required={field.required}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        
        {/* Project Resume */}
        <div className="lg:col-span-1">
          <Card className="shadow-md">
            <CardHeader className="pb-3 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Project Resume
                </h2>
                <div className="text-sm font-medium text-blue-600">
                  {projectProgress}% Complete
                </div>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                <div 
                  className="h-full rounded-full bg-blue-600 transition-all duration-300 ease-in-out" 
                  style={{ width: `${projectProgress}%` }}
                />
              </div>
            </CardHeader>
            
            <CardContent className="px-4 py-3">
              {projectSections.map((section) => (
                <div key={section.id} className="mb-4 border rounded-md overflow-hidden">
                  <div 
                    className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer"
                    onClick={() => toggleProjectSection(section.id)}
                  >
                    <div className="flex items-center">
                      <span className="mr-2 text-blue-600">{section.icon}</span>
                      <h3 className="font-medium text-gray-800">{section.title}</h3>
                    </div>
                    <button className="text-gray-500 hover:text-gray-700">
                      {section.isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  {section.isOpen && (
                    <div className="p-4 space-y-4">
                      {section.fields.map((field) => (
                        <div key={field.id} className="space-y-1">
                          <label htmlFor={`project-${section.id}-${field.id}`} className="block text-sm font-medium text-gray-700">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                          </label>
                          
                          {field.type === 'select' ? (
                            <select
                              id={`project-${section.id}-${field.id}`}
                              value={field.value}
                              onChange={(e) => handleProjectFieldChange(section.id, field.id, e.target.value)}
                              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required={field.required}
                            >
                              <option value="">Select...</option>
                              {field.options?.map((option) => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          ) : field.type === 'textarea' ? (
                            <textarea
                              id={`project-${section.id}-${field.id}`}
                              value={field.value}
                              onChange={(e) => handleProjectFieldChange(section.id, field.id, e.target.value)}
                              placeholder={field.placeholder}
                              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required={field.required}
                              rows={4}
                            />
                          ) : (
                            <Input
                              id={`project-${section.id}-${field.id}`}
                              type={field.type}
                              value={field.value}
                              onChange={(e) => handleProjectFieldChange(section.id, field.id, e.target.value)}
                              placeholder={field.placeholder}
                              required={field.required}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        
        {/* Message Board */}
        <div className="lg:col-span-1">
          <Card className="shadow-md h-full">
            <CardHeader className="pb-3 border-b">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                Project Message Board
              </h2>
            </CardHeader>
            
            <CardContent className="px-4 py-5">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                <div className="flex items-start mb-3">
                  <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold mr-3">
                    SA
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Sarah Adams</h4>
                    <p className="text-xs text-gray-500">Capital Markets Advisor • Just now</p>
                  </div>
                </div>
                <div className="text-gray-700 text-sm pl-14">
                  <p className="whitespace-pre-line">{getAdvisorMessage()}</p>
                </div>
              </div>
              
              <div className="text-center text-gray-500 text-sm p-4 border-t border-gray-100 mt-4">
                <p>Complete your project details to continue the conversation with your advisor.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end">
        <Button
          className="flex items-center bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-md"
          onClick={handleSaveProject}
        >
          <Save className="h-5 w-5 mr-2" />
          Save Project
          {formSaved && <span className="ml-2 text-green-200">✓</span>}
        </Button>
      </div>
    </DashboardLayout>
  );
}