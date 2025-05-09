// src/app/advisor/dashboard/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RoleBasedRoute } from '../../../components/auth/RoleBasedRoute';
import { useAuth } from '../../../hooks/useAuth';
import { useUI } from '../../../hooks/useUI';
import { GlobalToast } from '../../../components/ui/GlobalToast';
import { LoadingOverlay } from '../../../components/ui/LoadingOverlay';
import { Card, CardContent, CardHeader, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/Button';
import { LogOut, ChevronLeft } from 'lucide-react';

import { 
  Users, 
  FileText, 
  MessageSquare, 
  PieChart, 
  Calendar,
  ArrowRight,
  Clock,
  Zap,
  CheckCircle,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { getAdvisors, getAdvisorById } from '../../../../lib/enhancedMockApiService';
import { Advisor, ProjectProfile, ProjectMessage, ProjectStatus } from '../../../types/enhanced-types';

export default function AdvisorDashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { showNotification, setLoading } = useUI();
  
  const [advisor, setAdvisor] = useState<Advisor | null>(null);
  const [activeProjects, setActiveProjects] = useState<ProjectProfile[]>([]);
  const [recentMessages, setRecentMessages] = useState<ProjectMessage[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Status counts for dashboard metrics
  const [statusCounts, setStatusCounts] = useState({
    infoGathering: 0,
    advisorReview: 0,
    matchesCurated: 0,
    introductionsSent: 0,
    termSheetReceived: 0,
    closed: 0,
    withdrawn: 0,
    stalled: 0,
  });
  
  useEffect(() => {
    const loadAdvisorData = async () => {
      if (!user || user.role !== 'advisor') return;
      
      try {
        setIsLoadingData(true);
        setLoading(true);
        
        // Get advisor profile
        const advisorProfile = await getAdvisorById(user.email);
        if (advisorProfile) {
          setAdvisor(advisorProfile);
        }
        
        // Get projects assigned to this advisor
        const allProjects = localStorage.getItem('acara_projects');
        if (allProjects) {
          const projects = JSON.parse(allProjects) as ProjectProfile[];
          const assignedProjects = projects.filter(p => p.assignedAdvisorUserId === user.email);
          setActiveProjects(assignedProjects);
          
          // Calculate status counts
          const counts = {
            infoGathering: 0,
            advisorReview: 0,
            matchesCurated: 0,
            introductionsSent: 0,
            termSheetReceived: 0,
            closed: 0,
            withdrawn: 0,
            stalled: 0,
          };
          
          assignedProjects.forEach(project => {
            switch (project.projectStatus) {
              case 'Info Gathering':
                counts.infoGathering++;
                break;
              case 'Advisor Review':
                counts.advisorReview++;
                break;
              case 'Matches Curated':
                counts.matchesCurated++;
                break;
              case 'Introductions Sent':
                counts.introductionsSent++;
                break;
              case 'Term Sheet Received':
                counts.termSheetReceived++;
                break;
              case 'Closed':
                counts.closed++;
                break;
              case 'Withdrawn':
                counts.withdrawn++;
                break;
              case 'Stalled':
                counts.stalled++;
                break;
              default:
                break;
            }
          });
          
          setStatusCounts(counts);
        }
        
        // Get recent messages
        const allMessages = localStorage.getItem('acara_projectMessages');
        if (allMessages) {
          const messages = JSON.parse(allMessages) as ProjectMessage[];
          
          // Get messages for assigned projects
          if (activeProjects.length > 0) {
            const projectIds = activeProjects.map(p => p.id);
            const relevantMessages = messages
              .filter(m => projectIds.includes(m.projectId))
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 5); // Get 5 most recent
            
            setRecentMessages(relevantMessages);
          }
        }
      } catch (error) {
        console.error('Error loading advisor data:', error);
        showNotification({
          type: 'error',
          message: 'Failed to load advisor dashboard data',
        });
      } finally {
        setIsLoadingData(false);
        setLoading(false);
      }
    };
    
    loadAdvisorData();
  }, [user, setLoading, showNotification]);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'Draft':
        return 'text-gray-600 bg-gray-100';
      case 'Info Gathering':
        return 'text-blue-600 bg-blue-50';
      case 'Advisor Review':
        return 'text-amber-600 bg-amber-50';
      case 'Matches Curated':
        return 'text-purple-600 bg-purple-50';
      case 'Introductions Sent':
        return 'text-indigo-600 bg-indigo-50';
      case 'Term Sheet Received':
        return 'text-teal-600 bg-teal-50';
      case 'Closed':
        return 'text-green-600 bg-green-50';
      case 'Withdrawn':
        return 'text-red-600 bg-red-50';
      case 'Stalled':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };
  
  const getStatusIcon = (status: ProjectStatus) => {
    switch (status) {
      case 'Closed':
        return <CheckCircle className="h-5 w-5" />;
      case 'Withdrawn':
      case 'Stalled':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Zap className="h-5 w-5" />;
    }
  };
  
  return (
    <RoleBasedRoute roles={['advisor', 'admin']}>
      <div className="flex h-screen bg-gray-50">
        <LoadingOverlay />
        <GlobalToast />
        
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-blue-800">Advisor Portal</h1>
            {advisor && (
              <p className="text-sm text-gray-500 mt-1">{advisor.name}</p>
            )}
          </div>
          
          <nav className="mt-6 px-4">
            <div className="space-y-1">
              <a href="#" className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md">
                <PieChart className="mr-3 h-5 w-5" />
                Dashboard
              </a>
              <a href="#" className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-700">
                <Users className="mr-3 h-5 w-5" />
                My Borrowers
              </a>
              <a href="#" className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-700">
                <FileText className="mr-3 h-5 w-5" />
                Projects
              </a>
              <a href="#" className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-700">
                <MessageSquare className="mr-3 h-5 w-5" />
                Messages
              </a>
              <a href="#" className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-700">
                <Calendar className="mr-3 h-5 w-5" />
                Calendar
              </a>
            </div>
          </nav>
        </div>
        
        {/* Main content */}
        <div className="flex-1 overflow-auto">
            <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
                <div className="flex space-x-3">
                    <Button 
                    variant="outline"
                    leftIcon={<ChevronLeft size={16} />}
                    onClick={() => router.push('/')}
                    >
                    Back to Home
                    </Button>
                    <Button 
                    variant="outline"
                    leftIcon={<LogOut size={16} />}
                    onClick={async () => {
                        try {
                        await logout();
                        showNotification({
                            type: 'success',
                            message: 'You have been successfully signed out',
                        });
                        router.push('/');
                        } catch (error) {
                        console.error('Failed to sign out:', error);
                        showNotification({
                            type: 'error',
                            message: 'Failed to sign out. Please try again.',
                        });
                        }
                    }}
                    >
                    Sign Out
                    </Button>
                </div>
            </header>
          
          <main className="p-6">
            {/* Dashboard greeting */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <h2 className="text-xl font-semibold mb-2">
                Welcome back, {advisor?.name || 'Advisor'}
              </h2>
              <p className="text-gray-600">
                You have {activeProjects.length} active projects and {statusCounts.advisorReview} projects pending your review.
              </p>
            </div>
            
            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 shadow-sm border-blue-100">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Info Gathering</p>
                      <h3 className="text-3xl font-bold text-gray-900 mt-1">{statusCounts.infoGathering}</h3>
                    </div>
                    <div className="bg-blue-200 p-3 rounded-lg">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 shadow-sm border-amber-100">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-amber-600">Pending Review</p>
                      <h3 className="text-3xl font-bold text-gray-900 mt-1">{statusCounts.advisorReview}</h3>
                    </div>
                    <div className="bg-amber-200 p-3 rounded-lg">
                      <Zap className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 shadow-sm border-purple-100">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Matches Curated</p>
                      <h3 className="text-3xl font-bold text-gray-900 mt-1">{statusCounts.matchesCurated}</h3>
                    </div>
                    <div className="bg-purple-200 p-3 rounded-lg">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-green-100 shadow-sm border-green-100">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-green-600">Term Sheets</p>
                      <h3 className="text-3xl font-bold text-gray-900 mt-1">{statusCounts.termSheetReceived}</h3>
                    </div>
                    <div className="bg-green-200 p-3 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Projects */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Your Active Projects</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/advisor/projects')}
                >
                  View All Projects
                </Button>
              </div>
              
              {activeProjects.length > 0 ? (
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Borrower</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {activeProjects.map((project) => (
                          <tr key={project.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer" onClick={() => router.push(`/advisor/project/${project.id}`)}>
                                {project.projectName}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{project.borrowerProfileId.split('_')[0]}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-700">{project.assetType}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-700">
                                ${project.loanAmountRequested.toLocaleString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.projectStatus)}`}>
                                {getStatusIcon(project.projectStatus)}
                                <span className="ml-1">{project.projectStatus}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(project.updatedAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => router.push(`/advisor/project/${project.id}`)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                  <p className="text-gray-500">No active projects found</p>
                </div>
              )}
            </div>
            
            {/* Recent Messages */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Recent Messages</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/advisor/messages')}
                >
                  View All Messages
                </Button>
              </div>
              
              {recentMessages.length > 0 ? (
                <div className="space-y-4">
                  {recentMessages.map(message => {
                    const project = activeProjects.find(p => p.id === message.projectId);
                    return (
                      <Card key={message.id} className="shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex items-start">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${message.senderType === 'Advisor' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                              {message.senderType === 'Advisor' ? 'A' : 'B'}
                            </div>
                            <div className="ml-3 flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900">
                                  {message.senderType} {message.senderType === 'Borrower' && '('}
                                  {message.senderType === 'Borrower' && project?.projectName}
                                  {message.senderType === 'Borrower' && ')'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(message.createdAt).toLocaleString()}
                                </p>
                              </div>
                              <p className="mt-1 text-sm text-gray-700">
                                {message.message.length > 120 
                                  ? `${message.message.substring(0, 120)}...` 
                                  : message.message}
                              </p>
                              <div className="mt-2 flex justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => router.push(`/advisor/project/${message.projectId}`)}
                                >
                                  Go to Project
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                  <p className="text-gray-500">No recent messages</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </RoleBasedRoute>
  );
}