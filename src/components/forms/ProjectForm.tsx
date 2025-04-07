// src/components/forms/ProjectForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProjects } from '../../hooks/useProjects';
import { useUI } from '../../hooks/useUI';
import { Card, CardContent, CardHeader, CardFooter } from '../../components/ui/card';
import { Form, FormGroup } from '../../components/ui/Form';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Check, ChevronDown, ChevronUp, MessageSquare, FileText, User, CheckCircle, Clock } from 'lucide-react';
import { Project, FormSection } from '../../contexts/ProjectContext';

interface ProjectFormProps {
  existingProject?: Project | null;
  onFormSaved?: (project: Project) => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ 
  existingProject,
  onFormSaved
}) => {
  const router = useRouter();
  const { 
    createProject, 
    updateProject, 
    activeProject, 
    setActiveProject, 
    projectChanges,
    setProjectChanges,
    autoSaveProject
  } = useProjects();
  const { showNotification } = useUI();
  
  const [projectName, setProjectName] = useState('');
  const [formSaved, setFormSaved] = useState(false);
  const [borrowerProgress, setBorrowerProgress] = useState(0);
  const [projectProgress, setProjectProgress] = useState(0);
  const [lastAutoSave, setLastAutoSave] = useState<string | null>(null);
  
  // Initialize borrower sections
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
  
  // Initialize project sections
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

  

  useEffect(() => {
    const initializeProject = async () => {
      if (!existingProject && !activeProject) {
        try {
          // Check if a project was already created in this session
          // and avoid creating another one if it exists
          const existingProjects = localStorage.getItem('acara_userProjects');
          if (existingProjects) {
            // Parse the projects to see if we already have an active one
            try {
              const projects = JSON.parse(existingProjects);
              
              // If there are projects, check if any are already "New Project"
              const newProject = projects.find((p: any) => 
                p.name === "New Project" && 
                p.borrowerProgress === 0 && 
                p.projectProgress === 0
              );
              
              // If we found a new project, just use that instead of creating a new one
              if (newProject) {
                // Add back React elements to the sections
                const projectWithIcons = {
                  ...newProject,
                  borrowerSections: newProject.borrowerSections.map((section: any) => ({
                    ...section,
                    icon: getSectionIcon(section.id),
                  })),
                  projectSections: newProject.projectSections.map((section: any) => ({
                    ...section,
                    icon: getSectionIcon(section.id),
                  }))
                };
                
                setActiveProject(projectWithIcons);
                return;
              }
            } catch (error) {
              console.error('Error parsing existing projects:', error);
            }
          }
          
          // If no existing project was found or there was an error, create a new one
          const newProject = await createProject({
            name: "New Project",
            borrowerProgress: 0,
            projectProgress: 0,
            borrowerSections,
            projectSections,
          });
          
          // Set as active project
          setActiveProject(newProject);
          showNotification({
            type: 'info',
            message: 'New project created. Will be saved automatically as you work.',
          });
        } catch (error) {
          console.error('Error creating project:', error);
          showNotification({
            type: 'error',
            message: 'Failed to create project. Please try again.',
          });
        }
      }
    };
    
    initializeProject();
  }, [existingProject, activeProject, createProject, setActiveProject, borrowerSections, projectSections, showNotification]);
  
  useEffect(() => {
    const initializeProject = async () => {
      if (!existingProject && !activeProject) {
        try {
          // Check if a project was already created in this session
          // and avoid creating another one if it exists
          const existingProjects = localStorage.getItem('acara_userProjects');
          if (existingProjects) {
            // Parse the projects to see if we already have an active one
            try {
              const projects = JSON.parse(existingProjects);
              
              // If there are projects, check if any are already "New Project"
              const newProject = projects.find((p: any) => 
                p.name === "New Project" && 
                p.borrowerProgress === 0 && 
                p.projectProgress === 0
              );
              
              // If we found a new project, just use that instead of creating a new one
              if (newProject) {
                // Add back React elements to the sections
                const projectWithIcons = {
                  ...newProject,
                  borrowerSections: newProject.borrowerSections.map((section: any) => ({
                    ...section,
                    icon: getSectionIcon(section.id),
                  })),
                  projectSections: newProject.projectSections.map((section: any) => ({
                    ...section,
                    icon: getSectionIcon(section.id),
                  }))
                };
                
                setActiveProject(projectWithIcons);
                return;
              }
            } catch (error) {
              console.error('Error parsing existing projects:', error);
            }
          }
          
          // If no existing project was found or there was an error, create a new one
          const newProject = await createProject({
            name: "New Project",
            borrowerProgress: 0,
            projectProgress: 0,
            borrowerSections,
            projectSections,
          });
          
          // Set as active project
          setActiveProject(newProject);
          showNotification({
            type: 'info',
            message: 'New project created. Will be saved automatically as you work.',
          });
        } catch (error) {
          console.error('Error creating project:', error);
          showNotification({
            type: 'error',
            message: 'Failed to create project. Please try again.',
          });
        }
      }
    };
    
    initializeProject();
  }, [existingProject, activeProject, createProject, setActiveProject, borrowerSections, projectSections, showNotification]);

  // Populate form if editing an existing project
  useEffect(() => {
    if (existingProject) {
      setProjectName(existingProject.name);
      setBorrowerProgress(existingProject.borrowerProgress);
      setProjectProgress(existingProject.projectProgress);
      setLastAutoSave(existingProject.lastAutoSave || null);
      
      // Convert icon objects to React elements for borrower sections
      const borrowerSectionsWithIcons = existingProject.borrowerSections.map(section => ({
        ...section,
        icon: getSectionIcon(section.id),
      }));
      
      // Convert icon objects to React elements for project sections
      const projectSectionsWithIcons = existingProject.projectSections.map(section => ({
        ...section,
        icon: getSectionIcon(section.id),
      }));
      
      setBorrowerSections(borrowerSectionsWithIcons);
      setProjectSections(projectSectionsWithIcons);
      
      // Set as active project
      setActiveProject(existingProject);
    }
  }, [existingProject, setActiveProject]);

  // Load initial data from LastFormData if available and creating a new project
  useEffect(() => {
    if (!existingProject) {
      // Get user email from auth context or localStorage
      const email = localStorage.getItem('acara_user') 
        ? JSON.parse(localStorage.getItem('acara_user') || '').email 
        : '';
      
      if (email) {
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

          // Set project changes flag to trigger auto-save
          setProjectChanges(true);
        } catch (error) {
          console.error('Error parsing last form data:', error);
        }
      }
    }
  }, [existingProject, setProjectChanges]);

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

    // Update project name if available
    const projectNameField = projectSections
      .find(section => section.id === 'project-basics')
      ?.fields.find(field => field.id === 'projectName');
    
    if (projectNameField?.value) {
      setProjectName(projectNameField.value);
    }

    // If we have an active project and form values have changed, update it
    if (activeProject && (
      newBorrowerProgress !== borrowerProgress || 
      newProjectProgress !== projectProgress ||
      projectName !== activeProject.name
    )) {
      // Set changes flag to trigger auto-save
      setProjectChanges(true);
    }
  }, [borrowerSections, projectSections, activeProject, projectName, borrowerProgress, projectProgress, setProjectChanges]);

  // And add the helper function for adding icons back to sections
  const getSectionIcon = (sectionId: string): React.ReactNode => {
    switch (sectionId) {
      case 'basic-info':
        return <User className="h-5 w-5" />;
      case 'experience':
        return <CheckCircle className="h-5 w-5" />;
      case 'project-basics':
      case 'loan-request':
      case 'project-financials':
      case 'financial':
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

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

    // Signal that we have changes to save
    setProjectChanges(true);
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
    
    // Signal that we have changes to save
    setProjectChanges(true);
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

  // Manual save project - for "Save" button
  const handleSaveProject = async () => {
    try {
      if (!activeProject) return;
      
      // Create sanitized versions of the sections without React elements
      const sanitizedBorrowerSections = borrowerSections.map(section => ({
        id: section.id,
        title: section.title,
        isOpen: section.isOpen,
        fields: section.fields,
        icon: null // Remove React element
      }));
      
      const sanitizedProjectSections = projectSections.map(section => ({
        id: section.id,
        title: section.title,
        isOpen: section.isOpen,
        fields: section.fields,
        icon: null // Remove React element
      }));

      // Update the project
      const updatedProject = await updateProject(activeProject.id, {
        name: projectName || "Untitled Project",
        borrowerProgress,
        projectProgress,
        borrowerSections: sanitizedBorrowerSections,
        projectSections: sanitizedProjectSections,
      }, true); // True indicates manual save
      
      if (updatedProject) {
        showNotification({
          type: 'success',
          message: 'Project saved successfully',
        });
        
        // Update last auto-save timestamp
        setLastAutoSave(updatedProject.lastAutoSave || null);
        
        // Show saved confirmation
        setFormSaved(true);
        
        // Reset after 3 seconds
        setTimeout(() => {
          setFormSaved(false);
        }, 3000);
        
        // Call the onFormSaved callback if provided
        if (onFormSaved) {
          onFormSaved(updatedProject);
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

  // Format a date string to a readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  // Helper to render form field based on type
  const renderField = (section: FormSection, field: any, sectionType: 'borrower' | 'project') => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { value } = e.target;
      if (sectionType === 'borrower') {
        handleBorrowerFieldChange(section.id, field.id, value);
      } else {
        handleProjectFieldChange(section.id, field.id, value);
      }
    };

    const id = `${sectionType}-${section.id}-${field.id}`;

    switch (field.type) {
      case 'select':
        return (
          <Select
            id={id}
            value={field.value}
            onChange={handleChange}
            options={field.options?.map((option: string) => ({ value: option, label: option })) || []}
            placeholder={field.placeholder || "Select..."}
            label={field.label}
            error={field.error}
            helperText={field.helperText}
          />
        );
      case 'textarea':
        return (
          <textarea
            id={id}
            value={field.value}
            onChange={(e) => {
              if (sectionType === 'borrower') {
                handleBorrowerFieldChange(section.id, field.id, e.target.value);
              } else {
                handleProjectFieldChange(section.id, field.id, e.target.value);
              }
            }}
            placeholder={field.placeholder}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={field.required}
            rows={4}
          />
        );
      default:
        return (
          <Input
            id={id}
            type={field.type}
            value={field.value}
            onChange={handleChange}
            placeholder={field.placeholder}
            label={field.label}
            error={field.error}
            helperText={field.helperText}
            required={field.required}
          />
        );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Auto-save status indicator */}
      {lastAutoSave && (
        <div className="lg:col-span-3 flex items-center justify-end text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          <span>Last saved: {formatDate(lastAutoSave)}</span>
          {projectChanges && (
            <span className="ml-2 text-amber-500">(Unsaved changes)</span>
          )}
        </div>
      )}
      
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
                  <button 
                    type="button"
                    className="text-gray-500 hover:text-gray-700"
                    aria-label={section.isOpen ? "Collapse section" : "Expand section"}
                  >
                    {section.isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </button>
                </div>
                
                {section.isOpen && (
                  <div className="p-4 space-y-4">
                    {section.fields.map((field) => (
                      <div key={field.id} className="space-y-1">
                        {renderField(section, field, 'borrower')}
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
                  <button 
                    type="button"
                    className="text-gray-500 hover:text-gray-700"
                    aria-label={section.isOpen ? "Collapse section" : "Expand section"}
                  >
                    {section.isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </button>
                </div>
                
                {section.isOpen && (
                  <div className="p-4 space-y-4">
                    {section.fields.map((field) => (
                      <div key={field.id} className="space-y-1">
                        {renderField(section, field, 'project')}
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
      
      <div className="mt-6 flex items-center justify-between lg:col-span-3">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <span className="text-sm text-gray-600">Auto-saving enabled</span>
        </div>
        
        <Button
          variant="primary"
          leftIcon={<Check className="h-5 w-5" />}
          onClick={handleSaveProject}
          isLoading={formSaved}
        >
          {formSaved ? 'Saved!' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};