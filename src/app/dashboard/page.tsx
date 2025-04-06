// src/app/dashboard/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { Card, CardContent, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { PlusCircle, FileText, ArrowUpRight, Calendar, Building, Users } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  createdAt: string;
  borrowerProgress: number;
  projectProgress: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    matchedLenders: 0,
    averageProgress: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This needs to run client-side only
    if (typeof window !== 'undefined') {
      // Get projects from localStorage
      const projectsStr = localStorage.getItem('userProjects');
      
      if (projectsStr) {
        try {
          const projectsData = JSON.parse(projectsStr);
          setProjects(projectsData);
          
          // Calculate stats
          const totalProjects = projectsData.length;
          const activeProjects = totalProjects; // For demo, all projects are active
          const matchedLenders = Math.floor(Math.random() * 10) + 5; // Random number for demo
          
          const totalProgress = projectsData.reduce((sum: number, project: Project) => 
            sum + ((project.borrowerProgress + project.projectProgress) / 2), 0);
          const averageProgress = totalProjects ? Math.round(totalProgress / totalProjects) : 0;
          
          setStats({
            totalProjects,
            activeProjects,
            matchedLenders,
            averageProgress
          });
        } catch (error) {
          console.error('Error parsing projects:', error);
        }
      }
      setLoading(false);
    }
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm border-blue-100">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Projects</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.totalProjects}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 shadow-sm border-emerald-100">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-emerald-600">Active Projects</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.activeProjects}</h3>
              </div>
              <div className="bg-emerald-100 p-3 rounded-lg">
                <Building className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 shadow-sm border-violet-100">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-violet-600">Matched Lenders</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.matchedLenders}</h3>
              </div>
              <div className="bg-violet-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 shadow-sm border-amber-100">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-amber-600">Avg. Completion</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.averageProgress}%</h3>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Welcome Card */}
      {projects.length === 0 && (
        <Card className="mb-8 bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-xl">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">Welcome to ACARA-Cap!</h2>
            <p className="text-blue-100 mb-6">
              Get matched with the perfect lenders for your commercial real estate projects.
              Start by creating your first project.
            </p>
            <Button 
              className="bg-white text-blue-700 hover:bg-blue-50"
              onClick={() => router.push('/project/create')}
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Create Your First Project
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Projects Section */}
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Your Projects</h2>
        {projects.length > 0 && (
          <Button 
            className="bg-blue-600 text-white"
            onClick={() => router.push('/project/create')}
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            New Project
          </Button>
        )}
      </div>
      
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">{project.name}</h3>
                <p className="text-sm text-gray-500 mb-4 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Created on {formatDate(project.createdAt)}
                </p>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Borrower Resume</span>
                      <span className="font-medium text-blue-600">{project.borrowerProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-full rounded-full bg-blue-600" 
                        style={{ width: `${project.borrowerProgress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Project Resume</span>
                      <span className="font-medium text-blue-600">{project.projectProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-full rounded-full bg-blue-600" 
                        style={{ width: `${project.projectProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="bg-gray-50 px-6 py-4 border-t">
                <Button 
                  className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  onClick={() => router.push(`/project/${project.id}`)}
                >
                  View Project <ArrowUpRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No projects yet</h3>
          <p className="text-gray-500 mb-6">Create your first project to get started with finding lenders.</p>
          <Button 
            className="bg-blue-600 text-white"
            onClick={() => router.push('/project/create')}
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Create Project
          </Button>
        </div>
      )}
    </DashboardLayout>
  );
}