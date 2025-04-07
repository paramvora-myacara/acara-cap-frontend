// src/contexts/ProjectContext.tsx

'use client';

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { StorageService } from '../services/storage/StorageService';

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

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  borrowerProgress: number;
  projectProgress: number;
  borrowerSections: FormSection[];
  projectSections: FormSection[];
}

// Define context interface
interface ProjectContextProps {
  projects: Project[];
  isLoading: boolean;
  activeProject: Project | null;
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Omit<Project, 'id'>>) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<boolean>;
  getProject: (id: string) => Project | null;
  setActiveProject: (project: Project | null) => void;
  calculateProgress: (project: Project) => { borrowerProgress: number, projectProgress: number };
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
});

interface ProjectProviderProps {
  children: ReactNode;
  storageService: StorageService;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ 
  children, 
  storageService 
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load projects from storage on mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const storedProjects = await storageService.getItem<Project[]>('userProjects');
        if (storedProjects) {
          setProjects(storedProjects);
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
        await storageService.setItem('userProjects', projects);
      } catch (error) {
        console.error('Failed to save projects:', error);
      }
    };

    if (!isLoading && projects.length > 0) {
      saveProjects();
    }
  }, [projects, isLoading, storageService]);

  // Calculate progress for a project
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

  // Create a new project
  const createProject = useCallback(async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newProject: Project = {
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
      ...projectData,
    };

    setProjects(prevProjects => [...prevProjects, newProject]);
    return newProject;
  }, []);

  // Update an existing project
  const updateProject = useCallback(async (id: string, updates: Partial<Omit<Project, 'id'>>) => {
    const projectIndex = projects.findIndex(p => p.id === id);
    if (projectIndex === -1) return null;

    const updatedProject: Project = {
      ...projects[projectIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

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

  return (
    <ProjectContext.Provider value={{
      projects,
      isLoading,
      activeProject,
      createProject,
      updateProject,
      deleteProject,
      getProject,
      setActiveProject,
      calculateProgress,
    }}>
      {children}
    </ProjectContext.Provider>
  );
};