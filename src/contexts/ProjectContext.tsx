// src/contexts/ProjectContext.tsx
'use client';

import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useRef,
} from 'react';
import { StorageService } from '../services/storage/StorageService';
import { useAuth } from '../hooks/useAuth';
import { useBorrowerProfile } from '../hooks/useBorrowerProfile';
import {
  ProjectProfile,
  ProjectStatus,
  ProjectPrincipal,
  ProjectDocumentRequirement,
  ProjectMessage,
} from '../types/enhanced-types';

// Define context interface
interface ProjectContextProps {
  projects: ProjectProfile[];
  isLoading: boolean;
  activeProject: ProjectProfile | null;
  projectMessages: ProjectMessage[];
  projectPrincipals: ProjectPrincipal[];
  documentRequirements: ProjectDocumentRequirement[];
  createProject: (project: Partial<ProjectProfile>) => Promise<ProjectProfile>;
  updateProject: (
    id: string,
    updates: Partial<ProjectProfile>,
    manual?: boolean
  ) => Promise<ProjectProfile | null>;
  deleteProject: (id: string) => Promise<boolean>;
  getProject: (id: string) => ProjectProfile | null;
  setActiveProject: (project: ProjectProfile | null) => void;
  addProjectMessage: (message: string, isAdvisor?: boolean) => Promise<ProjectMessage>;
  addDocumentRequirement: (
    requirement: Partial<ProjectDocumentRequirement>
  ) => Promise<ProjectDocumentRequirement>;
  updateDocumentRequirement: (
    id: string,
    updates: Partial<ProjectDocumentRequirement>
  ) => Promise<ProjectDocumentRequirement | null>;
  assignPrincipalToProject: (
    principalId: string,
    projectRole: Partial<ProjectPrincipal>
  ) => Promise<ProjectPrincipal>;
  updateProjectPrincipal: (
    id: string,
    updates: Partial<ProjectPrincipal>
  ) => Promise<ProjectPrincipal | null>;
  removeProjectPrincipal: (id: string) => Promise<boolean>;
  updateProjectStatus: (id: string, status: ProjectStatus) => Promise<ProjectProfile | null>;
  calculateProgress: (project: ProjectProfile) => {
    borrowerProgress: number;
    projectProgress: number;
    totalProgress: number;
  };
  getCompletionStats: () => {
    totalProjects: number;
    inProgressProjects: number;
    completedProjects: number;
    averageBorrowerProgress: number;
    averageProjectProgress: number;
  };
  projectChanges: boolean;
  setProjectChanges: (hasChanges: boolean) => void;
  autoSaveProject: () => Promise<void>;
}

// Create default context values
const defaultProject: ProjectProfile = {
  id: '',
  borrowerProfileId: '',
  assignedAdvisorUserId: null,
  projectName: '',
  name: '', // legacy field
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
  targetLtvPercent: 0,
  targetLtcPercent: 0,
  amortizationYears: 0,
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
  completenessPercent: 0,
  internalAdvisorNotes: '',
  borrowerProgress: 0,
  projectProgress: 0,
  createdAt: '',
  updatedAt: '',
  // Add necessary properties to match ProjectProfile interface
  projectSections: {},
  borrowerSections: {}
};

export const ProjectContext = createContext<ProjectContextProps>({
  projects: [],
  isLoading: true,
  activeProject: null,
  projectMessages: [],
  projectPrincipals: [],
  documentRequirements: [],
  createProject: async () => defaultProject,
  updateProject: async () => null,
  deleteProject: async () => false,
  getProject: () => null,
  setActiveProject: () => {},
  addProjectMessage: async () => ({
    id: '',
    projectId: '',
    senderId: '',
    senderType: 'Borrower',
    message: '',
    isRead: false,
    createdAt: '',
  }),
  addDocumentRequirement: async () => ({
    id: '',
    projectId: '',
    requiredDocType: 'Other',
    status: 'Required',
    documentId: null,
    notes: '',
    dueDate: null,
    lastUpdated: '',
  }),
  updateDocumentRequirement: async () => null,
  assignPrincipalToProject: async () => ({
    id: '',
    projectId: '',
    principalId: '',
    roleInProject: 'Guarantor',
    guarantyDetails: null,
    isKeyPrincipal: false,
    isPrimaryContact: false,
    createdAt: '',
  }),
  updateProjectPrincipal: async () => null,
  removeProjectPrincipal: async () => false,
  updateProjectStatus: async () => null,
  calculateProgress: () => ({ borrowerProgress: 0, projectProgress: 0, totalProgress: 0 }),
  getCompletionStats: () => ({
    totalProjects: 0,
    inProgressProjects: 0,
    completedProjects: 0,
    averageBorrowerProgress: 0,
    averageProjectProgress: 0,
  }),
  projectChanges: false,
  setProjectChanges: () => {},
  autoSaveProject: async () => {},
});

interface ProjectProviderProps {
  children: ReactNode;
  storageService: StorageService;
}

const AUTO_SAVE_INTERVAL = 3000;

const generateUniqueId = (): string => {
  return `proj_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

export const ProjectProvider: React.FC<ProjectProviderProps> = ({
  children,
  storageService,
}) => {
  const [projects, setProjects] = useState<ProjectProfile[]>([]);
  const [activeProject, setActiveProject] = useState<ProjectProfile | null>(null);
  const [projectMessages, setProjectMessages] = useState<ProjectMessage[]>([]);
  const [projectPrincipals, setProjectPrincipals] = useState<ProjectPrincipal[]>([]);
  const [documentRequirements, setDocumentRequirements] = useState<ProjectDocumentRequirement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [projectChanges, setProjectChanges] = useState(false);

  const { user } = useAuth();
  const { borrowerProfile } = useBorrowerProfile();
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string | null>(null);
  const loadedProjectsRef = useRef<Set<string>>(new Set());

  // Calculate progress for a project
  const calculateProgress = useCallback((project: ProjectProfile) => {
    const borrowerRequiredFields = [
      'projectName',
      'propertyAddressStreet',
      'propertyAddressCity',
      'propertyAddressState',
      'propertyAddressZip',
      'assetType',
    ];

    const projectRequiredFields = [
      'projectDescription',
      'projectPhase',
      'loanAmountRequested',
      'loanType',
      'targetLtvPercent',
      'targetCloseDate',
      'useOfProceeds',
      'recoursePreference',
      'exitStrategy',
      'businessPlanSummary',
    ];

    const filledBorrowerFields = borrowerRequiredFields.filter((field) => {
      const value = project[field as keyof ProjectProfile];
      return value !== null && value !== undefined && value !== '';
    }).length;

    const filledProjectFields = projectRequiredFields.filter((field) => {
      const value = project[field as keyof ProjectProfile];
      return value !== null && value !== undefined && value !== '';
    }).length;

    const borrowerProgress = Math.round((filledBorrowerFields / borrowerRequiredFields.length) * 100);
    const projectProgress = Math.round((filledProjectFields / projectRequiredFields.length) * 100);
    const totalProgress = Math.round(borrowerProgress * 0.3 + projectProgress * 0.7);

    return { borrowerProgress, projectProgress, totalProgress };
  }, []);

  // Auto-save the active project
  const autoSaveProject = useCallback(async () => {
    if (!activeProject || !projectChanges) return;
    try {
      const projectStateStr = JSON.stringify(activeProject);
      if (projectStateStr !== lastSavedRef.current) {
        const now = new Date().toISOString();
        const progress = calculateProgress(activeProject);
        const updatedProject = {
          ...activeProject,
          borrowerProgress: progress.borrowerProgress,
          projectProgress: progress.projectProgress,
          completenessPercent: progress.totalProgress,
          updatedAt: now,
        };

        setProjects((prevProjects) =>
          prevProjects.map((p) => (p.id === updatedProject.id ? updatedProject : p))
        );
        setActiveProject(updatedProject);
        lastSavedRef.current = JSON.stringify(updatedProject);
        setProjectChanges(false);
        console.log(`Auto-saved project: ${updatedProject.projectName}`);
      }
    } catch (error) {
      console.error('Failed to auto-save project:', error);
    }
  }, [activeProject, projectChanges, calculateProgress]);

  // Set up auto-save for active project
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    if (activeProject && projectChanges) {
      autoSaveTimerRef.current = setInterval(() => {
        autoSaveProject();
      }, AUTO_SAVE_INTERVAL);
    }
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, [activeProject, projectChanges, autoSaveProject]);

  // Load project data (messages, principals, requirements)
  const loadProjectData = useCallback(
    async (projectId: string) => {
      try {
        const allMessages =
          (await storageService.getItem<ProjectMessage[]>('projectMessages')) || [];
        const projectMessages = allMessages.filter((msg) => msg.projectId === projectId);
        setProjectMessages(projectMessages);

        const allProjectPrincipals =
          (await storageService.getItem<ProjectPrincipal[]>('projectPrincipals')) || [];
        const projectPrincipals = allProjectPrincipals.filter((pp) => pp.projectId === projectId);
        setProjectPrincipals(projectPrincipals);

        const allDocReqs =
          (await storageService.getItem<ProjectDocumentRequirement[]>('documentRequirements')) || [];
        const projectDocReqs = allDocReqs.filter((req) => req.projectId === projectId);
        setDocumentRequirements(projectDocReqs);
      } catch (error) {
        console.error('Failed to load project data:', error);
      }
    },
    [storageService]
  );

  // Load projects on mount or when user changes
  useEffect(() => {
    const loadProjects = async () => {
      if (!user) {
        setProjects([]);
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const storedProjects =
          (await storageService.getItem<ProjectProfile[]>('projects')) || [];
        const userProjects =
          user.role === 'advisor'
            ? storedProjects.filter((p) => p.assignedAdvisorUserId === user.email)
            : storedProjects.filter((p) =>
                borrowerProfile ? p.borrowerProfileId === borrowerProfile.id : false
              );
        const loadedProjects = new Set<string>();
        const uniqueProjects = userProjects.filter((project) => {
          if (loadedProjects.has(project.id)) return false;
          loadedProjects.add(project.id);
          return true;
        });
        setProjects(uniqueProjects);
        loadedProjectsRef.current = loadedProjects;
        if (activeProject) {
          loadProjectData(activeProject.id);
        }
      } catch (error) {
        console.error('Failed to load projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, [user, borrowerProfile, storageService, activeProject, loadProjectData]);

  // Save projects to storage when they change
  useEffect(() => {
    const saveProjects = async () => {
      try {
        if (projects.length === 0) return;
        const allProjects =
          (await storageService.getItem<ProjectProfile[]>('projects')) || [];
        const otherProjects = allProjects.filter(
          (p) => !loadedProjectsRef.current.has(p.id)
        );
        await storageService.setItem('projects', [...otherProjects, ...projects]);
      } catch (error) {
        console.error('Failed to save projects:', error);
      }
    };

    if (!isLoading && projects.length > 0) {
      saveProjects();
    }
  }, [projects, isLoading, storageService]);

  // Get completion statistics
  const getCompletionStats = useCallback(() => {
    const totalProjects = projects.length;
    if (totalProjects === 0) {
      return {
        totalProjects: 0,
        inProgressProjects: 0,
        completedProjects: 0,
        averageBorrowerProgress: 0,
        averageProjectProgress: 0,
      };
    }
    const completedProjects = projects.filter(
      (p) => p.borrowerProgress === 100 && p.projectProgress === 100
    ).length;
    const inProgressProjects = totalProjects - completedProjects;
    const totalBorrowerProgress = projects.reduce((sum, p) => sum + p.borrowerProgress, 0);
    const totalProjectProgress = projects.reduce((sum, p) => sum + p.projectProgress, 0);
    const averageBorrowerProgress = Math.round(totalBorrowerProgress / totalProjects);
    const averageProjectProgress = Math.round(totalProjectProgress / totalProjects);
    return {
      totalProjects,
      inProgressProjects,
      completedProjects,
      averageBorrowerProgress,
      averageProjectProgress,
    };
  }, [projects]);

  // These functions need to be defined before they're used by other functions (breaking the circular dependency)
  
  // Define updateProjectStatus function
  const updateProjectStatus = useCallback(async (id: string, status: ProjectStatus) => {
    const projectIndex = projects.findIndex((p) => p.id === id);
    if (projectIndex === -1) return null;
    
    const now = new Date().toISOString();
    const updatedProject: ProjectProfile = {
      ...projects[projectIndex],
      projectStatus: status,
      updatedAt: now,
    };
    
    const updatedProjects = [...projects];
    updatedProjects[projectIndex] = updatedProject;
    setProjects(updatedProjects);
    
    if (activeProject?.id === id) {
      setActiveProject(updatedProject);
      
      // We can't call addProjectMessage here directly because it would create
      // a circular dependency. Instead, we'll post status messages separately
      // when this function is called.
    }
    
    return updatedProject;
  }, [projects, activeProject]);

  // Define addProjectMessage function
  const addProjectMessage = useCallback(async (message: string, isAdvisor = false) => {
    if (!activeProject) throw new Error('No active project to add message to');
    
    const now = new Date().toISOString();
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const senderId = isAdvisor
      ? activeProject.assignedAdvisorUserId || 'advisor@acaracap.com'
      : user?.email || 'borrower@example.com';
    
    const newMessage: ProjectMessage = {
      id: messageId,
      projectId: activeProject.id,
      senderId,
      senderType: isAdvisor ? 'Advisor' : 'Borrower',
      message,
      isRead: false,
      createdAt: now,
    };
    
    setProjectMessages((prev) => [...prev, newMessage]);
    
    const allMessages = (await storageService.getItem<ProjectMessage[]>('projectMessages')) || [];
    await storageService.setItem('projectMessages', [...allMessages, newMessage]);
    
    // Check if project is in draft status and send to info gathering if needed
    if (activeProject.projectStatus === 'Draft') {
      // Call updateProjectStatus directly without waiting for the status message
      await updateProjectStatus(activeProject.id, 'Info Gathering');
      
      // Then add a separate status message
      const statusMessage: ProjectMessage = {
        id: `msg_status_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        projectId: activeProject.id,
        senderId: 'system',
        senderType: 'Advisor',
        message: "We're now gathering information about your project.",
        isRead: false,
        createdAt: now,
      };
      
      setProjectMessages((prev) => [...prev, statusMessage]);
      await storageService.setItem('projectMessages', [...allMessages, newMessage, statusMessage]);
    }
    
    return newMessage;
  }, [activeProject, user, storageService, updateProjectStatus]);

  // Function to add a status message after status changes
  const addStatusMessage = useCallback(async (projectId: string, status: ProjectStatus) => {
    const statusMessages: Record<ProjectStatus, string> = {
      Draft: 'Your project has been saved as a draft.',
      'Info Gathering': "We're now gathering information about your project.",
      'Advisor Review': 'Your project is now under review by your capital advisor.',
      'Matches Curated': "We've curated lender matches for your project.",
      'Introductions Sent': 'Introductions have been sent to matching lenders.',
      'Term Sheet Received': "Congratulations! You've received a term sheet.",
      Closed: 'Congratulations! Your project has successfully closed.',
      Withdrawn: 'Your project has been withdrawn.',
      Stalled: 'Your project is currently stalled. Please contact your advisor for assistance.',
    };
    
    if (statusMessages[status]) {
      const now = new Date().toISOString();
      const messageId = `msg_status_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      const statusMessage: ProjectMessage = {
        id: messageId,
        projectId: projectId,
        senderId: 'system',
        senderType: 'Advisor',
        message: statusMessages[status],
        isRead: false,
        createdAt: now,
      };
      
      setProjectMessages((prev) => [...prev, statusMessage]);
      
      const allMessages = (await storageService.getItem<ProjectMessage[]>('projectMessages')) || [];
      await storageService.setItem('projectMessages', [...allMessages, statusMessage]);
    }
  }, [storageService]);

  // Create a new project
  const createProject = useCallback(async (projectData: Partial<ProjectProfile>) => {
    if (!user)
      throw new Error("User must be logged in to create a project");
    if (!borrowerProfile)
      throw new Error("Borrower profile must exist to create a project");

    const now = new Date().toISOString();
    const projName = projectData.projectName || "New Project";
    let uniqueId = generateUniqueId();
    while (loadedProjectsRef.current.has(uniqueId)) {
      uniqueId = generateUniqueId();
    }
    
    // Pick a random advisor for demo purposes.
    const advisors = [
      { id: "advisor1@acaracap.com", name: "Sarah Adams" },
      { id: "advisor2@acaracap.com", name: "Michael Chen" },
      { id: "advisor3@acaracap.com", name: "Jessica Williams" },
    ];
    const randomAdvisor = advisors[Math.floor(Math.random() * advisors.length)];
    loadedProjectsRef.current.add(uniqueId);

    const newProject: ProjectProfile = {
      id: uniqueId,
      borrowerProfileId: borrowerProfile.id,
      assignedAdvisorUserId: randomAdvisor.id,
      projectName: projName,
      name: projName, // legacy field
      propertyAddressStreet: projectData.propertyAddressStreet || "",
      propertyAddressCity: projectData.propertyAddressCity || "",
      propertyAddressState: projectData.propertyAddressState || "",
      propertyAddressCounty: projectData.propertyAddressCounty || "",
      propertyAddressZip: projectData.propertyAddressZip || "",
      assetType: projectData.assetType || "",
      projectDescription: projectData.projectDescription || "",
      projectPhase: projectData.projectPhase || "Acquisition",
      loanAmountRequested: projectData.loanAmountRequested || 0,
      loanType: projectData.loanType || "",
      targetLtvPercent: projectData.targetLtvPercent || 70,
      targetLtcPercent: projectData.targetLtcPercent || 80,
      amortizationYears: projectData.amortizationYears || 30,
      interestOnlyPeriodMonths: projectData.interestOnlyPeriodMonths || 0,
      interestRateType: projectData.interestRateType || "Not Specified",
      targetCloseDate: projectData.targetCloseDate || "",
      useOfProceeds: projectData.useOfProceeds || "",
      recoursePreference: projectData.recoursePreference || "Flexible",
      purchasePrice: projectData.purchasePrice || null,
      totalProjectCost: projectData.totalProjectCost || null,
      capexBudget: projectData.capexBudget || null,
      propertyNoiT12: projectData.propertyNoiT12 || null,
      stabilizedNoiProjected: projectData.stabilizedNoiProjected || null,
      exitStrategy: projectData.exitStrategy || "Undecided",
      businessPlanSummary: projectData.businessPlanSummary || "",
      marketOverviewSummary: projectData.marketOverviewSummary || "",
      equityCommittedPercent: projectData.equityCommittedPercent || 0,
      projectStatus: "Draft",
      completenessPercent: 0,
      internalAdvisorNotes: "",
      borrowerProgress: 0,
      projectProgress: 0,
      createdAt: now,
      updatedAt: now,
      ...projectData,
      // Add these required properties to match the ProjectProfile interface
      projectSections: projectData.projectSections || {},
      borrowerSections: projectData.borrowerSections || {}
    };

    const progress = calculateProgress(newProject);
    newProject.borrowerProgress = progress.borrowerProgress;
    newProject.projectProgress = progress.projectProgress;
    newProject.completenessPercent = progress.totalProgress;

    // Update projects state
    setProjects((prevProjects) => {
      if (prevProjects.some((p) => p.id === uniqueId)) {
        console.warn(`Prevented duplicate project: ${uniqueId}`);
        return prevProjects;
      }
      return [...prevProjects, newProject];
    });

    // Set this as the active project
    setActiveProject(newProject);
    
    // Add welcome message
    if (projectData.projectStatus === 'Info Gathering') {
      // Add status message without creating circular dependency
      await addStatusMessage(newProject.id, 'Info Gathering');
    }

    return newProject;
  }, [user, borrowerProfile, calculateProgress, addStatusMessage]);

  // Update an existing project
  const updateProject = useCallback(async (id: string, updates: Partial<ProjectProfile>, manual = false) => {
    const projectIndex = projects.findIndex(p => p.id === id);
    if (projectIndex === -1) return null;

    const now = new Date().toISOString();
    const updatedProject: ProjectProfile = {
      ...projects[projectIndex],
      ...updates,
      updatedAt: now,
    };

    if (manual) {
      lastSavedRef.current = JSON.stringify(updatedProject);
      setProjectChanges(false);
    }

    const progress = calculateProgress(updatedProject);
    updatedProject.borrowerProgress = progress.borrowerProgress;
    updatedProject.projectProgress = progress.projectProgress;
    updatedProject.completenessPercent = progress.totalProgress;

    const updatedProjects = [...projects];
    updatedProjects[projectIndex] = updatedProject;
    setProjects(updatedProjects);

    if (activeProject?.id === id) {
      setActiveProject(updatedProject);
    }

    // If status was updated, add appropriate status message
    if (updates.projectStatus && updates.projectStatus !== projects[projectIndex].projectStatus) {
      await addStatusMessage(id, updates.projectStatus);
    }

    return updatedProject;
  }, [projects, activeProject, calculateProgress, addStatusMessage]);

  // Add a document requirement
  const addDocumentRequirement = useCallback(async (requirement: Partial<ProjectDocumentRequirement>) => {
    if (!requirement.projectId) {
      if (!activeProject) throw new Error('No active project to add requirement to');
      requirement.projectId = activeProject.id;
    }
    const now = new Date().toISOString();
    const reqId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newRequirement: ProjectDocumentRequirement = {
      id: reqId,
      projectId: requirement.projectId,
      requiredDocType: requirement.requiredDocType || 'Other',
      status: requirement.status || 'Required',
      documentId: requirement.documentId || null,
      notes: requirement.notes || '',
      dueDate: requirement.dueDate || null,
      lastUpdated: now,
    };
    setDocumentRequirements((prev) => [...prev, newRequirement]);
    const allRequirements =
      (await storageService.getItem<ProjectDocumentRequirement[]>('documentRequirements')) || [];
    await storageService.setItem('documentRequirements', [...allRequirements, newRequirement]);
    return newRequirement;
  }, [activeProject, storageService]);

  // Update a document requirement
  const updateDocumentRequirement = useCallback(async (id: string, updates: Partial<ProjectDocumentRequirement>) => {
    const reqIndex = documentRequirements.findIndex((req) => req.id === id);
    if (reqIndex === -1) return null;
    const now = new Date().toISOString();
    const updatedRequirement: ProjectDocumentRequirement = {
      ...documentRequirements[reqIndex],
      ...updates,
      lastUpdated: now,
    };
    const updatedRequirements = [...documentRequirements];
    updatedRequirements[reqIndex] = updatedRequirement;
    setDocumentRequirements(updatedRequirements);
    const allRequirements =
      (await storageService.getItem<ProjectDocumentRequirement[]>('documentRequirements')) || [];
    const otherRequirements = allRequirements.filter((req) => req.id !== id);
    await storageService.setItem('documentRequirements', [...otherRequirements, updatedRequirement]);
    return updatedRequirement;
  }, [documentRequirements, storageService]);

  // Assign a principal to a project
  const assignPrincipalToProject = useCallback(async (principalId: string, projectRole: Partial<ProjectPrincipal>) => {
    if (!activeProject) throw new Error('No active project to assign principal to');
    const now = new Date().toISOString();
    const rolId = `projp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newProjectPrincipal: ProjectPrincipal = {
      id: rolId,
      projectId: activeProject.id,
      principalId: principalId,
      roleInProject: projectRole.roleInProject || 'Key Principal',
      guarantyDetails: projectRole.guarantyDetails || null,
      isKeyPrincipal: projectRole.isKeyPrincipal || false,
      isPrimaryContact: projectRole.isPrimaryContact || false,
      createdAt: now,
    };
    setProjectPrincipals((prev) => [...prev, newProjectPrincipal]);
    const allProjectPrincipals =
      (await storageService.getItem<ProjectPrincipal[]>('projectPrincipals')) || [];
    await storageService.setItem('projectPrincipals', [...allProjectPrincipals, newProjectPrincipal]);
    return newProjectPrincipal;
  }, [activeProject, storageService]);

  // Update a project principal
  const updateProjectPrincipal = useCallback(async (id: string, updates: Partial<ProjectPrincipal>) => {
    const ppIndex = projectPrincipals.findIndex((pp) => pp.id === id);
    if (ppIndex === -1) return null;
    const updatedPP: ProjectPrincipal = {
      ...projectPrincipals[ppIndex],
      ...updates,
    };
    const updatedPPs = [...projectPrincipals];
    updatedPPs[ppIndex] = updatedPP;
    setProjectPrincipals(updatedPPs);
    const allPPs = (await storageService.getItem<ProjectPrincipal[]>('projectPrincipals')) || [];
    const otherPPs = allPPs.filter((pp) => pp.id !== id);
    await storageService.setItem('projectPrincipals', [...otherPPs, updatedPP]);
    return updatedPP;
  }, [projectPrincipals, storageService]);

  // Remove a project principal
  const removeProjectPrincipal = useCallback(async (id: string) => {
    try {
      setProjectPrincipals((prev) => prev.filter((pp) => pp.id !== id));
      const allPPs = (await storageService.getItem<ProjectPrincipal[]>('projectPrincipals')) || [];
      const updatedPPs = allPPs.filter((pp) => pp.id !== id);
      await storageService.setItem('projectPrincipals', updatedPPs);
      return true;
    } catch (error) {
      console.error('Failed to remove project principal:', error);
      return false;
    }
  }, [storageService]);

  // Delete a project
  const deleteProject = useCallback(async (id: string) => {
    try {
      loadedProjectsRef.current.delete(id);
      setProjects(prevProjects => prevProjects.filter(p => p.id !== id));
      if (activeProject?.id === id) {
        setActiveProject(null);
      }
      await Promise.all([
        storageService
          .getItem<ProjectMessage[]>('projectMessages')
          .then((messages) => {
            if (messages) {
              const updatedMessages = messages.filter(msg => msg.projectId !== id);
              return storageService.setItem('projectMessages', updatedMessages);
            }
          }),
        storageService
          .getItem<ProjectPrincipal[]>('projectPrincipals')
          .then((principals) => {
            if (principals) {
              const updatedPrincipals = principals.filter(pp => pp.projectId !== id);
              return storageService.setItem('projectPrincipals', updatedPrincipals);
            }
          }),
        storageService
          .getItem<ProjectDocumentRequirement[]>('documentRequirements')
          .then((reqs) => {
            if (reqs) {
              const updatedReqs = reqs.filter(req => req.projectId !== id);
              return storageService.setItem('documentRequirements', updatedReqs);
            }
          }),
      ]);
      return true;
    } catch (error) {
      console.error('Failed to delete project:', error);
      return false;
    }
  }, [activeProject, storageService]);

  // Set active project and reset changes flag
  const setActiveProjectWithChanges = useCallback((project: ProjectProfile | null) => {
    setActiveProject(project);
    setProjectChanges(false);
    if (project) {
      loadProjectData(project.id);
      lastSavedRef.current = JSON.stringify(project);
    } else {
      setProjectMessages([]);
      setProjectPrincipals([]);
      setDocumentRequirements([]);
      lastSavedRef.current = null;
    }
  }, [loadProjectData]);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        isLoading,
        activeProject,
        projectMessages,
        projectPrincipals,
        documentRequirements,
        createProject,
        updateProject,
        deleteProject,
        getProject: (id: string) => projects.find(p => p.id === id) || null,
        setActiveProject: setActiveProjectWithChanges,
        addProjectMessage,
        addDocumentRequirement,
        updateDocumentRequirement,
        assignPrincipalToProject,
        updateProjectPrincipal,
        removeProjectPrincipal,
        updateProjectStatus,
        calculateProgress,
        getCompletionStats,
        projectChanges,
        setProjectChanges,
        autoSaveProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};