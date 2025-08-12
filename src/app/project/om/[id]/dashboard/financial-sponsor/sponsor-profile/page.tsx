'use client';

import { financialDetails } from '@/services/mockOMData';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, Award, TrendingUp, Phone, Mail, DollarSign } from 'lucide-react';

export default function SponsorProfilePage() {
  const formatCurrency = (amount: string) => {
    return amount; // Already formatted in the data
  };

  const getIRRColor = (irr: string) => {
    const irrNum = parseFloat(irr);
    if (irrNum >= 25) return 'bg-green-100 text-green-800';
    if (irrNum >= 20) return 'bg-blue-100 text-blue-800';
    if (irrNum >= 15) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Sponsor Profile</h1>
        <p className="text-gray-600 mt-2">Comprehensive overview of the development sponsor</p>
      </div>

      {/* Company Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <Building2 className="h-5 w-5 text-blue-500 mr-2" />
              <h3 className="text-lg font-semibold">Founded</h3>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{financialDetails.sponsorProfile.yearFounded}</p>
            <p className="text-sm text-gray-500 mt-1">Years in business</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-green-500 mr-2" />
              <h3 className="text-lg font-semibold">Total Developed</h3>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{financialDetails.sponsorProfile.totalDeveloped}</p>
            <p className="text-sm text-gray-500 mt-1">Cumulative value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-purple-500 mr-2" />
              <h3 className="text-lg font-semibold">Total Units</h3>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">{financialDetails.sponsorProfile.totalUnits.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">Units delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-orange-500 mr-2" />
              <h3 className="text-lg font-semibold">Active Projects</h3>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">{financialDetails.sponsorProfile.activeProjects}</p>
            <p className="text-sm text-gray-500 mt-1">Current developments</p>
          </CardContent>
        </Card>
      </div>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Company Information</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Company Details</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Company Name</p>
                  <p className="font-medium text-gray-900">{financialDetails.sponsorProfile.firmName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Year Founded</p>
                  <p className="font-medium text-gray-900">{financialDetails.sponsorProfile.yearFounded}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Development Value</p>
                  <p className="font-medium text-gray-900">{financialDetails.sponsorProfile.totalDeveloped}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Units Delivered</p>
                  <p className="font-medium text-gray-900">{financialDetails.sponsorProfile.totalUnits.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Projects</p>
                  <p className="font-medium text-gray-900">{financialDetails.sponsorProfile.activeProjects}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Available upon request</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Available upon request</span>
                </div>
                <div className="pt-4">
                  <p className="text-sm text-gray-500">For detailed contact information and references, please contact the deal team.</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Principal Team */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Principal Team</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {financialDetails.sponsorProfile.principals.map((principal, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{principal.name}</h4>
                    <p className="text-sm text-gray-500">{principal.role}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Experience</span>
                    <Badge variant="outline">{principal.experience}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Track Record */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Track Record</h3>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Project</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Year</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Units</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">IRR</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Performance</th>
                </tr>
              </thead>
              <tbody>
                {financialDetails.sponsorProfile.trackRecord.map((project, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <p className="font-medium text-gray-900">{project.project}</p>
                    </td>
                    <td className="py-4 px-4 text-gray-900">{project.year}</td>
                    <td className="py-4 px-4 text-gray-900">{project.units}</td>
                    <td className="py-4 px-4">
                      <Badge className={getIRRColor(project.irr)}>
                        {project.irr}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        {parseFloat(project.irr) >= 25 ? (
                          <Badge className="bg-green-100 text-green-800">Exceptional</Badge>
                        ) : parseFloat(project.irr) >= 20 ? (
                          <Badge className="bg-blue-100 text-blue-800">Strong</Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* References */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">References</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {financialDetails.sponsorProfile.references.map((reference, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                    <Building2 className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{reference.firm}</h4>
                    <p className="text-sm text-gray-500">Lending Partner</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p>{reference.contact}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Company Strengths */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Company Strengths</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Development Expertise</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">•</span>
                  {financialDetails.sponsorProfile.totalUnits.toLocaleString()} units delivered
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">•</span>
                  {financialDetails.sponsorProfile.yearFounded} years of experience
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">•</span>
                  Proven track record across multiple projects
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Financial Performance</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="text-blue-500 mr-2">•</span>
                  Strong IRR performance (18-26%)
                </li>
                <li className="flex items-center">
                  <span className="text-blue-500 mr-2">•</span>
                  {financialDetails.sponsorProfile.totalDeveloped} total development value
                </li>
                <li className="flex items-center">
                  <span className="text-blue-500 mr-2">•</span>
                  Consistent project delivery
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Market Position</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="text-purple-500 mr-2">•</span>
                  Established lender relationships
                </li>
                <li className="flex items-center">
                  <span className="text-purple-500 mr-2">•</span>
                  Strong local market knowledge
                </li>
                <li className="flex items-center">
                  <span className="text-purple-500 mr-2">•</span>
                  Reputation for quality execution
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 