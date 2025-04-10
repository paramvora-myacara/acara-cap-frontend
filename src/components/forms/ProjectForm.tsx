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
import {
  Check,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  FileText,
  User,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { ProjectProfile as Project, FormSection } from '../../types/enhanced-types';

interface ProjectFormProps {
  existingProject?: Project | null;
  onFormSaved?: (project: Project) => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  existingProject,
  onFormSaved,
}) => {
  const router = useRouter();
  const {
    createProject,
    updateProject,
    activeProject,
    setActiveProject,
    projectChanges,
    setProjectChanges,
    autoSaveProject,
  } = useProjects();
  const { showNotification } = useUI();

  const [projectName, setProjectName] = useState('');
  const [formSaved, setFormSaved] = useState(false);
  const [borrowerProgress, setBorrowerProgress] = useState(0);
  const [projectProgress, setProjectProgress] = useState(0);
  const [lastAutoSave, setLastAutoSave] = useState<string | null>(null);

  // Define your initial borrower and project sections here.
  // Replace the comment sections with your actual section definitions.
  const [borrowerSections, setBorrowerSections] = useState<FormSection[]>([
    // Example section
    {
      id: 'basic-info',
      title: 'Basic Information',
      icon: <User className="h-5 w-5" />,
      isOpen: true,
      fields: [
        {
          id: 'fullName',
          label: 'Full Legal Name',
          type: 'text',
          value: '',
          required: true,
          placeholder: 'John Doe',
        },
        {
          id: 'email',
          label: 'Email Address',
          type: 'email',
          value: '',
          required: true,
          placeholder: 'you@example.com',
        },
        // ... add more fields as needed
      ],
    },
    // ... add more borrower sections as needed
  ]);

  const [projectSections, setProjectSections] = useState<FormSection[]>([
    {
      id: 'project-basics',
      title: 'Project Information',
      icon: <FileText className="h-5 w-5" />,
      isOpen: true,
      fields: [
        {
          id: 'projectName',
          label: 'Project Name',
          type: 'text',
          value: '',
          required: true,
          placeholder: 'Riverfront Development',
        },
        {
          id: 'address',
          label: 'Property Address',
          type: 'text',
          value: '',
          required: true,
          placeholder: '123 Main St, Anytown, US',
        },
        {
          id: 'assetType',
          label: 'Asset Type',
          type: 'select',
          options: [
            'Multifamily',
            'Office',
            'Retail',
            'Industrial',
            'Hospitality',
            'Land',
            'Mixed-Use',
            'Self-Storage',
            'Data Center',
            'Medical Office',
            'Senior Housing',
            'Student Housing',
            'Other',
          ],
          value: '',
          required: true,
        },
        {
          id: 'dealType',
          label: 'Deal Type',
          type: 'select',
          options: [
            'Acquisition',
            'Refinance',
            'Construction',
            'Bridge',
            'Development',
            'Value-Add',
            'Other',
          ],
          value: '',
          required: true,
        },
      ],
    },
    // ... add more project sections as needed
  ]);

  // Helper function for adding icons back to sections.
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

  // Initialize the project if one is not provided and no active project exists.
  useEffect(() => {
    const initializeProject = async () => {
      if (!existingProject && !activeProject) {
        try {
          const existingProjects = localStorage.getItem('acara_userProjects');
          if (existingProjects) {
            try {
              const projects = JSON.parse(existingProjects);
              // Compare using projectName instead of name
              const newProject = projects.find(
                (p: any) =>
                  p.projectName === 'New Project' &&
                  p.borrowerProgress === 0 &&
                  p.projectProgress === 0
              );
              if (newProject) {
                const projectWithIcons = {
                  ...newProject,
                  borrowerSections: newProject.borrowerSections.map((section: any) => ({
                    ...section,
                    icon: getSectionIcon(section.id),
                  })),
                  projectSections: newProject.projectSections.map((section: any) => ({
                    ...section,
                    icon: getSectionIcon(section.id),
                  })),
                };
                setActiveProject(projectWithIcons);
                return;
              }
            } catch (error) {
              console.error('Error parsing existing projects:', error);
            }
          }
          // Create a new project with projectName property
          const newProject = await createProject({
            projectName: 'New Project',
            borrowerProgress: 0,
            projectProgress: 0,
            borrowerSections,
            projectSections,
          });
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
  }, [
    existingProject,
    activeProject,
    createProject,
    setActiveProject,
    borrowerSections,
    projectSections,
    showNotification,
  ]);

  // Populate form if editing an existing project.
  useEffect(() => {
    if (existingProject) {
      setProjectName(existingProject.projectName);
      setBorrowerProgress(existingProject.borrowerProgress);
      setProjectProgress(existingProject.projectProgress);
      // Assume lastAutoSave is stored in updatedAt or a similar field
      setLastAutoSave(existingProject.updatedAt || null);

      const borrowerSectionsWithIcons = existingProject.borrowerSections.map((section: any) => ({
        ...section,
        icon: getSectionIcon(section.id),
      }));
      const projectSectionsWithIcons = existingProject.projectSections.map((section: any) => ({
        ...section,
        icon: getSectionIcon(section.id),
      }));
      setBorrowerSections(borrowerSectionsWithIcons);
      setProjectSections(projectSectionsWithIcons);
      setActiveProject(existingProject);
    }
  }, [existingProject, setActiveProject]);

  // Update progress whenever form values change.
  useEffect(() => {
    const totalBorrowerFields = borrowerSections
      .flatMap((section) => section.fields)
      .filter((field) => field.required).length;
    const filledBorrowerFields = borrowerSections
      .flatMap((section) => section.fields)
      .filter((field) => field.required && field.value.trim() !== '').length;

    const newBorrowerProgress = totalBorrowerFields
      ? Math.round((filledBorrowerFields / totalBorrowerFields) * 100)
      : 0;
    setBorrowerProgress(newBorrowerProgress);

    const totalProjectFields = projectSections
      .flatMap((section) => section.fields)
      .filter((field) => field.required).length;
    const filledProjectFields = projectSections
      .flatMap((section) => section.fields)
      .filter((field) => field.required && field.value.trim() !== '').length;

    const newProjectProgress = totalProjectFields
      ? Math.round((filledProjectFields / totalProjectFields) * 100)
      : 0;
    setProjectProgress(newProjectProgress);

    const projectNameField = projectSections
      .find((section) => section.id === 'project-basics')
      ?.fields.find((field: { id: string; }) => field.id === 'projectName');
    if (projectNameField?.value) {
      setProjectName(projectNameField.value);
    }

    if (
      activeProject &&
      (newBorrowerProgress !== borrowerProgress ||
        newProjectProgress !== projectProgress ||
        projectName !== activeProject.projectName)
    ) {
      setProjectChanges(true);
    }
  }, [
    borrowerSections,
    projectSections,
    activeProject,
    projectName,
    borrowerProgress,
    projectProgress,
    setProjectChanges,
  ]);

  // Handle field changes.
  const handleBorrowerFieldChange = (sectionId: string, fieldId: string, value: string) => {
    setBorrowerSections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              fields: section.fields.map((field: { id: string; }) =>
                field.id === fieldId ? { ...field, value } : field
              ),
            }
          : section
      )
    );
    setProjectChanges(true);
  };

  const handleProjectFieldChange = (sectionId: string, fieldId: string, value: string) => {
    setProjectSections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              fields: section.fields.map((field: { id: string; }) =>
                field.id === fieldId ? { ...field, value } : field
              ),
            }
          : section
      )
    );
    if (fieldId === 'projectName') {
      setProjectName(value);
    }
    setProjectChanges(true);
  };

  const toggleBorrowerSection = (sectionId: string) => {
    setBorrowerSections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId ? { ...section, isOpen: !section.isOpen } : section
      )
    );
  };

  const toggleProjectSection = (sectionId: string) => {
    setProjectSections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId ? { ...section, isOpen: !section.isOpen } : section
      )
    );
  };

  const handleSaveProject = async () => {
    try {
      if (!activeProject) return;
      const sanitizedBorrowerSections = borrowerSections.map((section) => ({
        id: section.id,
        title: section.title,
        isOpen: section.isOpen,
        fields: section.fields,
        icon: null,
      }));
      const sanitizedProjectSections = projectSections.map((section) => ({
        id: section.id,
        title: section.title,
        isOpen: section.isOpen,
        fields: section.fields,
        icon: null,
      }));

      const updatedProject = await updateProject(
        activeProject.id,
        {
          projectName: projectName || 'Untitled Project',
          borrowerProgress,
          projectProgress,
          borrowerSections: sanitizedBorrowerSections,
          projectSections: sanitizedProjectSections,
        },
        true // manual save indicator
      );

      if (updatedProject) {
        showNotification({
          type: 'success',
          message: 'Project saved successfully',
        });
        setLastAutoSave(updatedProject.updatedAt || null);
        setFormSaved(true);
        setTimeout(() => {
          setFormSaved(false);
        }, 3000);
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

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAdvisorMessage = () => {
    const assetType =
      projectSections.find((section) => section.id === 'project-basics')
        ?.fields.find((field: { id: string; }) => field.id === 'assetType')?.value || '';
    const dealType =
      projectSections.find((section) => section.id === 'project-basics')
        ?.fields.find((field: { id: string; }) => field.id === 'dealType')?.value || '';
    const capitalType =
      projectSections.find((section) => section.id === 'loan-request')
        ?.fields.find((field: { id: string; }) => field.id === 'capitalType')?.value || '';

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
            options={
              field.options?.map((option: string) => ({ value: option, label: option })) || []
            }
            placeholder={field.placeholder || 'Select...'}
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
              <div className="text-sm font-medium text-blue-600">{borrowerProgress}% Complete</div>
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
                    aria-label={section.isOpen ? 'Collapse section' : 'Expand section'}
                  >
                    {section.isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </button>
                </div>
                {section.isOpen && (
                  <div className="p-4 space-y-4">
                    {section.fields.map((field: { id: React.Key | null | undefined; }) => (
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
              <div className="text-sm font-medium text-blue-600">{projectProgress}% Complete</div>
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
                    aria-label={section.isOpen ? 'Collapse section' : 'Expand section'}
                  >
                    {section.isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </button>
                </div>
                {section.isOpen && (
                  <div className="p-4 space-y-4">
                    {section.fields.map((field: { id: React.Key | null | undefined; }) => (
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