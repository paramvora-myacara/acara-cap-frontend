// src/app/project/documents/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '../../../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/Button';
import { RoleBasedRoute } from '../../../../components/auth/RoleBasedRoute';
import { useProjects } from '../../../../hooks/useProjects';
import { useUI } from '../../../../hooks/useUI';
import { GlobalToast } from '../../../../components/ui/GlobalToast';
import { LoadingOverlay } from '../../../../components/ui/LoadingOverlay';
import { ChevronLeft, Upload, FileText, Check, X, AlertTriangle } from 'lucide-react';
import { DocumentUpload } from '../../../../components/ui/DocumentUpload';
import { Document, DocumentCategory } from '../../../../types/enhanced-types';

interface UploadedDocument {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  documentType: DocumentCategory | string;
  projectId: string;
  uploadedAt: string;
  uploaderUserId: string;
}

export default function ProjectDocumentsPage() {
  const router = useRouter();
  const params = useParams();
  const { getProject, isLoading, documentRequirements, updateDocumentRequirement } = useProjects();
  const { showNotification, setLoading } = useUI();
  
  const [project, setProject] = useState<any>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  
  // Update loading state
  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);
  
  // Load project and documents
  useEffect(() => {
    const loadData = async () => {
      const projectId = params?.id as string;
      
      if (!projectId) {
        router.push('/dashboard');
        return;
      }
      
      // Get project
      const project = getProject(projectId);
      if (project) {
        setProject(project);
        
        // Get uploaded documents
        const savedDocs = localStorage.getItem('acara_documents');
        if (savedDocs) {
          try {
            const allDocs = JSON.parse(savedDocs) as UploadedDocument[];
            const projectDocs = allDocs.filter(doc => doc.projectId === projectId);
            setUploadedDocuments(projectDocs);
            
            // Update document requirements status based on uploaded documents
            for (const doc of projectDocs) {
              const requirement = documentRequirements.find(req => 
                req.requiredDocType === doc.documentType && req.projectId === projectId
              );
              
              if (requirement && requirement.status === 'Required') {
                await updateDocumentRequirement(requirement.id, {
                  status: 'Uploaded',
                  documentId: doc.id,
                  lastUpdated: new Date().toISOString()
                });
              }
            }
          } catch (error) {
            console.error('Error parsing uploaded documents:', error);
          }
        }
      } else {
        showNotification({
          type: 'error',
          message: 'Project not found',
        });
        router.push('/dashboard');
      }
    };
    
    loadData();
  }, [params, router, getProject, documentRequirements, updateDocumentRequirement, showNotification]);
  
  // Get document status label and color
  const getDocumentStatusInfo = (status: string) => {
    switch (status) {
      case 'Approved':
        return { color: 'bg-green-100 text-green-800', icon: <Check size={16} className="mr-1" /> };
      case 'Rejected':
        return { color: 'bg-red-100 text-red-800', icon: <X size={16} className="mr-1" /> };
      case 'Uploaded':
        return { color: 'bg-blue-100 text-blue-800', icon: <Upload size={16} className="mr-1" /> };
      case 'In Review':
        return { color: 'bg-amber-100 text-amber-800', icon: <FileText size={16} className="mr-1" /> };
      case 'Required':
        return { color: 'bg-gray-100 text-gray-800', icon: <AlertTriangle size={16} className="mr-1" /> };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: <FileText size={16} className="mr-1" /> };
    }
  };
  
  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Handle document upload
  const handleDocumentUpload = (file: File, documentType: string) => {
    // Update the document requirement status
    const requirement = documentRequirements.find(req => 
      req.requiredDocType === documentType && req.projectId === project.id
    );
    
    if (requirement) {
      updateDocumentRequirement(requirement.id, {
        status: 'Uploaded',
        lastUpdated: new Date().toISOString()
      });
    }
    
    // Refresh the list of uploaded documents
    const savedDocs = localStorage.getItem('acara_documents');
    if (savedDocs) {
      try {
        const allDocs = JSON.parse(savedDocs) as UploadedDocument[];
        const projectDocs = allDocs.filter(doc => doc.projectId === project.id);
        setUploadedDocuments(projectDocs);
      } catch (error) {
        console.error('Error parsing uploaded documents:', error);
      }
    }
    
    showNotification({
      type: 'success',
      message: `${documentType} uploaded successfully`,
    });
  };
  
  if (!project) {
    return (
      <RoleBasedRoute roles={['borrower']}>
        <DashboardLayout title="Project Documents">
          <LoadingOverlay />
          <GlobalToast />
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Project not found</h2>
            <p className="text-gray-600 mb-6">The project you're looking for doesn't exist or has been removed.</p>
            <Button 
              variant="outline"
              leftIcon={<ChevronLeft size={16} />}
              onClick={() => router.push('/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
        </DashboardLayout>
      </RoleBasedRoute>
    );
  }

  return (
    <RoleBasedRoute roles={['borrower']}>
      <DashboardLayout title={`Documents - ${project.projectName}`}>
        <LoadingOverlay />
        <GlobalToast />
        
        <div className="mb-6">
          <Button 
            variant="outline"
            leftIcon={<ChevronLeft size={16} />}
            onClick={() => router.push(`/project/${project.id}`)}
          >
            Back to Project
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Required Documents */}
          <Card className="shadow-md lg:col-span-2">
            <CardHeader className="pb-3 border-b bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Required Documents
              </h2>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-6">
                {documentRequirements.length > 0 ? (
                  documentRequirements.map(doc => {
                    const statusInfo = getDocumentStatusInfo(doc.status);
                    // Find if document is already uploaded
                    const uploadedDoc = uploadedDocuments.find(
                      uDoc => uDoc.documentType === doc.requiredDocType
                    );
                    
                    return (
                      <div key={doc.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium text-gray-800">{doc.requiredDocType}</h3>
                            <p className="text-sm text-gray-500">{doc.notes}</p>
                          </div>
                          <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            {statusInfo.icon}
                            {doc.status}
                          </div>
                        </div>
                        
                        {uploadedDoc ? (
                          <div className="bg-gray-50 p-3 rounded mt-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <FileText size={18} className="text-gray-500 mr-2" />
                                <div>
                                  <p className="text-sm font-medium text-gray-700">{uploadedDoc.fileName}</p>
                                  <p className="text-xs text-gray-500">
                                    {formatFileSize(uploadedDoc.fileSize)} • Uploaded {formatDate(uploadedDoc.uploadedAt)}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  showNotification({
                                    type: 'info',
                                    message: 'This is a demo - document would normally be downloaded here',
                                  });
                                }}
                              >
                                Download
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <DocumentUpload
                            label=""
                            description=""
                            documentType={doc.requiredDocType}
                            projectId={project.id}
                            onUpload={handleDocumentUpload}
                          />
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No document requirements yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Upload Additional Documents */}
          <Card className="shadow-md lg:col-span-1">
            <CardHeader className="pb-3 border-b bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <Upload className="h-5 w-5 mr-2 text-blue-600" />
                Upload Additional Documents
              </h2>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-6">
                <p className="text-gray-600 mb-4">
                  Upload additional documents that may be helpful for your project but aren't in the required list.
                </p>
                
                <DocumentUpload
                  label="Tax Returns"
                  description="Recent tax returns for principals"
                  documentType="Tax Returns"
                  projectId={project.id}
                  onUpload={handleDocumentUpload}
                />
                
                <DocumentUpload
                  label="Entity Documents"
                  description="Operating agreement, articles of incorporation, etc."
                  documentType="Entity Docs"
                  projectId={project.id}
                  onUpload={handleDocumentUpload}
                />
                
                <DocumentUpload
                  label="Market Study"
                  description="Third-party market study or analysis"
                  documentType="Market Study"
                  projectId={project.id}
                  onUpload={handleDocumentUpload}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* All Uploaded Documents */}
          <Card className="shadow-md lg:col-span-3">
            <CardHeader className="pb-3 border-b bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                All Uploaded Documents
              </h2>
            </CardHeader>
            <CardContent className="p-0">
              {uploadedDocuments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {uploadedDocuments.map((doc) => {
                        const requirement = documentRequirements.find(
                          req => req.requiredDocType === doc.documentType && req.projectId === project.id
                        );
                        const status = requirement?.status || 'Uploaded';
                        const statusInfo = getDocumentStatusInfo(status);
                        
                        return (
                          <tr key={doc.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <FileText className="h-5 w-5 text-gray-400 mr-2" />
                                <span className="text-sm font-medium text-gray-900">{doc.fileName}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {doc.documentType}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatFileSize(doc.fileSize)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(doc.uploadedAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                {statusInfo.icon}
                                {status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                className="text-blue-600 hover:text-blue-900"
                                onClick={() => {
                                  showNotification({
                                    type: 'info',
                                    message: 'This is a demo - document would normally be downloaded here',
                                  });
                                }}
                              >
                                Download
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No documents uploaded yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </RoleBasedRoute>
  );
}