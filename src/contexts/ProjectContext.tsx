// src/contexts/ProjectContext.tsx

'use client';

import React, { createContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { StorageService } from '../services/storage/StorageService';
import { useAuth } from '../hooks/useAuth';

// Define project interface
export interface FormField {
  id: string;
  label: string;
  type: string;
  options?: string[];
  value: string;
  required?: boolean;
  placeholder?: string;
}

export interface FormSection {
  id: string;
  title: string;
  icon: React.ReactNode | null;
  isOpen: boolean;
  fields: FormField[];
}

export interface StorableFormSection {
  id: string;
  title: string;
  isOpen: boolean;
  fields: FormField[];
  // No icon here to avoid circular references
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  borrowerProgress: number;
  projectProgress: number;
  borrowerSections: FormSection[];
  projectSections: FormSection[];
  lastAutoSave?: string;
}

export interface StorableProject {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  borrowerProgress: number;
  projectProgress: number;
  borrowerSections: StorableFormSection[];
  projectSections: StorableFormSection[];
  lastAutoSave?: string;
}

export interface CompletionStats {
  totalProjects: number;
  inProgressProjects: number;
  completedProjects: number;
  averageBorrowerProgress: number;
  averageProjectProgress: number;
}

// Define context interface
interface ProjectContextProps {
  projects: Project[];
  isLoading: boolean;
  activeProject: Project | null;
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Omit<Project, 'id'>>, manual?: boolean) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<boolean>;
  getProject: (id: string) => Project | null;
  setActiveProject: (project: Project | null) => void;
  calculateProgress: (project: Project) => { borrowerProgress: number, projectProgress: number };
  getCompletionStats: () => CompletionStats;
  projectChanges: boolean;
  setProjectChanges: (hasChanges: boolean) => void;
  autoSaveProject: () => Promise<void>;
}

// Create context with default values
export const ProjectContext = createContext<ProjectContextProps>({
  projects: [],
  isLoading: true,
  activeProject: null,
  createProject: async () => ({ 
    id: '', 
    name: '', 
    createdAt: '', 
    updatedAt: '', 
    borrowerProgress: 0, 
    projectProgress: 0, 
    borrowerSections: [], 
    projectSections: [] 
  }),
  updateProject: async () => null,
  deleteProject: async () => false,
  getProject: () => null,
  setActiveProject: () => {},
  calculateProgress: () => ({ borrowerProgress: 0, projectProgress: 0 }),
  getCompletionStats: () => ({
    totalProjects: 0,
    inProgressProjects: 0,
    completedProjects: 0,
    averageBorrowerProgress: 0,
    averageProjectProgress: 0
  }),
  projectChanges: false,
  setProjectChanges: () => {},
  autoSaveProject: async () => {},
});

interface ProjectProviderProps {
  children: ReactNode;
  storageService: StorageService;
}

// Auto-save interval in milliseconds (3 seconds)
const AUTO_SAVE_INTERVAL = 3000;

// Helper to create a storable (serializable) version of a project
const makeStorableProject = (project: Project): StorableProject => {
  return {
    id: project.id,
    name: project.name,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    borrowerProgress: project.borrowerProgress,
    projectProgress: project.projectProgress,
    lastAutoSave: project.lastAutoSave,
    // Remove React elements from sections to avoid circular references
    borrowerSections: project.borrowerSections.map(section => ({
      id: section.id,
      title: section.title,
      isOpen: section.isOpen,
      fields: section.fields,
      // Do not include icon
    })),
    projectSections: project.projectSections.map(section => ({
      id: section.id,
      title: section.title,
      isOpen: section.isOpen,
      fields: section.fields,
      // Do not include icon
    })),
  };
};

// Helper to add back icons to sections
const addIconsToProject = (project: StorableProject): Project => {
  return {
    ...project,
    borrowerSections: project.borrowerSections.map(section => ({
      ...section,
      icon: getSectionIcon(section.id),
    })),
    projectSections: project.projectSections.map(section => ({
      ...section,
      icon: getSectionIcon(section.id),
    })),
  };
};

// Helper to get section icon based on id
const getSectionIcon = (sectionId: string): React.ReactNode => {
  if (typeof window === 'undefined') return null;
  
  // These need to match the icons in the ProjectForm component
  const icons = {
    'basic-info': <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
    'experience': <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
    'financial': <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
    'project-basics': <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
    'loan-request': <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
    'project-financials': <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
  };
  
  return icons[sectionId as keyof typeof icons] || icons['project-basics'];
};

// Generate a truly unique ID
const generateUniqueId = (): string => {
  return `proj_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ 
  children, 
  storageService 
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [projectChanges, setProjectChanges] = useState(false);
  
  const { user } = useAuth();
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string | null>(null);
  const loadedProjectsRef = useRef<Set<string>>(new Set());

  // Calculate progress for a project - MOVED UP TO FIX HOISTING ISSUE
  const calculateProgress = useCallback((project: Project) => {
    // Calculate borrower progress
    const totalBorrowerFields = project.borrowerSections
      .flatMap(section => section.fields)
      .filter(field => field.required).length;
    
    const filledBorrowerFields = project.borrowerSections
      .flatMap(section => section.fields)
      .filter(field => field.required && field.value.trim() !== '').length;
    
    const borrowerProgress = totalBorrowerFields 
      ? Math.round((filledBorrowerFields / totalBorrowerFields) * 100) 
      : 0;

    // Calculate project progress
    const totalProjectFields = project.projectSections
      .flatMap(section => section.fields)
      .filter(field => field.required).length;
    
    const filledProjectFields = project.projectSections
      .flatMap(section => section.fields)
      .filter(field => field.required && field.value.trim() !== '').length;
    
    const projectProgress = totalProjectFields 
      ? Math.round((filledProjectFields / totalProjectFields) * 100) 
      : 0;

    return { borrowerProgress, projectProgress };
  }, []);

  // Auto-save the active project
  const autoSaveProject = useCallback(async () => {
    if (!activeProject || !projectChanges) return;
    
    try {
      // Create a serializable version of the project for comparison
      const storableProject = makeStorableProject(activeProject);
      const projectStateStr = JSON.stringify(storableProject);
      
      // Only save if project state has changed since last save
      if (projectStateStr !== lastSavedRef.current) {
        const now = new Date().toISOString();
        
        // Update project with current progress calculations
        const progress = calculateProgress(activeProject);
        
        const updatedProject = {
          ...activeProject,
          borrowerProgress: progress.borrowerProgress,
          projectProgress: progress.projectProgress,
          updatedAt: now,
          lastAutoSave: now
        };
        
        // Update in state
        setProjects(prevProjects => {
          return prevProjects.map(p => 
            p.id === updatedProject.id ? updatedProject : p
          );
        });
        
        // Update active project reference
        setActiveProject(updatedProject);
        
        // Keep track of what we've saved (using the serializable version)
        lastSavedRef.current = JSON.stringify(makeStorableProject(updatedProject));
        
        // Reset changes flag
        setProjectChanges(false);
        
        console.log(`Auto-saved project: ${updatedProject.name}`);
      }
    } catch (error) {
      console.error('Failed to auto-save project:', error);
    }
  }, [activeProject, projectChanges, calculateProgress]);

  // Load projects from storage on mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const storedProjects = await storageService.getItem<StorableProject[]>('userProjects');
        if (storedProjects && Array.isArray(storedProjects)) {
          // Convert stored projects to projects with icons
          const projectsWithIcons = storedProjects.map(addIconsToProject);
          
          // Track loaded project IDs to prevent duplicates
          const loadedProjects = new Set<string>();
          const uniqueProjects = projectsWithIcons.filter(project => {
            // If we've already seen this ID, filter it out
            if (loadedProjects.has(project.id)) {
              return false;
            }
            // Otherwise, add it to our set and keep it
            loadedProjects.add(project.id);
            return true;
          });
          
          setProjects(uniqueProjects);
          loadedProjectsRef.current = loadedProjects;
        }
      } catch (error) {
        console.error('Failed to load projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, [storageService]);

  // Save projects to storage whenever they change
  useEffect(() => {
    const saveProjects = async () => {
      try {
        if (projects.length === 0) return;
        
        // Convert projects to a storable format (without React elements)
        const storableProjects = projects.map(makeStorableProject);
        await storageService.setItem('userProjects', storableProjects);
      } catch (error) {
        console.error('Failed to save projects:', error);
      }
    };

    if (!isLoading && projects.length > 0) {
      saveProjects();
    }
  }, [projects, isLoading, storageService]);

  // Set up auto-save for active project
  useEffect(() => {
    // Clear any existing auto-save timer
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }

    // If there's an active project and unsaved changes, set up auto-save timer
    if (activeProject && projectChanges) {
      autoSaveTimerRef.current = setInterval(() => {
        autoSaveProject();
      }, AUTO_SAVE_INTERVAL);
    }

    // Cleanup function
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, [activeProject, projectChanges, autoSaveProject]);

  // Get stats on completion rates
  const getCompletionStats = useCallback(() => {
    const totalProjects = projects.length;
    
    if (totalProjects === 0) {
      return {
        totalProjects: 0,
        inProgressProjects: 0,
        completedProjects: 0,
        averageBorrowerProgress: 0,
        averageProjectProgress: 0
      };
    }
    
    // A project is considered "completed" if both borrower and project progress are 100%
    const completedProjects = projects.filter(
      p => p.borrowerProgress === 100 && p.projectProgress === 100
    ).length;
    
    const inProgressProjects = totalProjects - completedProjects;
    
    // Calculate average progress
    const totalBorrowerProgress = projects.reduce((sum, p) => sum + p.borrowerProgress, 0);
    const totalProjectProgress = projects.reduce((sum, p) => sum + p.projectProgress, 0);
    
    const averageBorrowerProgress = Math.round(totalBorrowerProgress / totalProjects);
    const averageProjectProgress = Math.round(totalProjectProgress / totalProjects);
    
    return {
      totalProjects,
      inProgressProjects,
      completedProjects,
      averageBorrowerProgress,
      averageProjectProgress
    };
  }, [projects]);

  // Create a new project with auto-generated name if needed
  const createProject = useCallback(async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    
    // Generate a project name if none is provided
    let projectName = projectData.name || ""; // Default to empty string to avoid undefined
    if (!projectName || projectName.trim() === '') {
      // Try to find a name from project data
      const projectNameField = projectData.projectSections
        .find(section => section.id === 'project-basics')
        ?.fields.find(field => field.id === 'projectName');
      
      // If we found a project name field with a value, use it
      if (projectNameField?.value) {
        projectName = projectNameField.value;
      } else {
        // Otherwise, generate a name based on asset type if available
        const assetTypeField = projectData.projectSections
          .find(section => section.id === 'project-basics')
          ?.fields.find(field => field.id === 'assetType');
        
        if (assetTypeField?.value) {
          projectName = `${assetTypeField.value} Project`;
        } else {
          // Default name with timestamp
          projectName = `New Project (${new Date().toLocaleString()})`;
        }
      }
    }
    
    // Create a unique ID
    let uniqueId = generateUniqueId();
    
    // Just to be extra careful, keep generating until we find a truly unique ID
    while (loadedProjectsRef.current.has(uniqueId)) {
      uniqueId = generateUniqueId();
    }
    
    // Add to our tracking set
    loadedProjectsRef.current.add(uniqueId);
    
    // Create new project with projectData properties first, then override specific ones
    const newProject: Project = {
      ...projectData,
      id: uniqueId,
      name: projectName,
      createdAt: now,
      updatedAt: now,
    };

    // Add to projects array
    setProjects(prevProjects => {
      // Double check we don't already have a project with this ID
      if (prevProjects.some(p => p.id === uniqueId)) {
        console.warn(`Prevented duplicate project: ${uniqueId}`);
        return prevProjects;
      }
      return [...prevProjects, newProject];
    });
    
    return newProject;
  }, []);

  // Update an existing project
  const updateProject = useCallback(async (id: string, updates: Partial<Omit<Project, 'id'>>, manual = false) => {
    const projectIndex = projects.findIndex(p => p.id === id);
    if (projectIndex === -1) return null;

    const now = new Date().toISOString();
    
    const updatedProject: Project = {
      ...projects[projectIndex],
      ...updates,
      updatedAt: now,
    };

    // If it's a manual save, also update lastAutoSave
    if (manual) {
      updatedProject.lastAutoSave = now;
      const storableProject = makeStorableProject(updatedProject);
      lastSavedRef.current = JSON.stringify(storableProject);
      setProjectChanges(false);
    }

    // Recalculate progress if necessary
    if (updates.borrowerSections || updates.projectSections) {
      const progress = calculateProgress(updatedProject);
      updatedProject.borrowerProgress = progress.borrowerProgress;
      updatedProject.projectProgress = progress.projectProgress;
    }

    const updatedProjects = [...projects];
    updatedProjects[projectIndex] = updatedProject;
    setProjects(updatedProjects);
    
    // Update active project if it's the one being modified
    if (activeProject?.id === id) {
      setActiveProject(updatedProject);
    }

    return updatedProject;
  }, [projects, activeProject, calculateProgress]);

  // Delete a project
  const deleteProject = useCallback(async (id: string) => {
    try {
      // Remove from our tracking set
      loadedProjectsRef.current.delete(id);
      
      setProjects(prevProjects => prevProjects.filter(p => p.id !== id));
      
      // Clear active project if it's the one being deleted
      if (activeProject?.id === id) {
        setActiveProject(null);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to delete project:', error);
      return false;
    }
  }, [activeProject]);

  // Get a project by ID
  const getProject = useCallback((id: string) => {
    return projects.find(p => p.id === id) || null;
  }, [projects]);
  
  // Set active project and reset changes flag
  const setActiveProjectWithChanges = (project: Project | null) => {
    setActiveProject(project);
    setProjectChanges(false);
    if (project) {
      const storableProject = makeStorableProject(project);
      lastSavedRef.current = JSON.stringify(storableProject);
    } else {
      lastSavedRef.current = null;
    }
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      isLoading,
      activeProject,
      createProject,
      updateProject,
      deleteProject,
      getProject,
      setActiveProject: setActiveProjectWithChanges,
      calculateProgress,
      getCompletionStats,
      projectChanges,
      setProjectChanges,
      autoSaveProject,
    }}>
      {children}
    </ProjectContext.Provider>
  );
};