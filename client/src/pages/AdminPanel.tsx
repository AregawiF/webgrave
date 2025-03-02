import React, { useState } from 'react';
import { 
  Trash2, Edit, Eye, DollarSign, AlertTriangle, 
  CheckCircle, XCircle, Filter, Download, BarChart3,
  Flower2
} from 'lucide-react';

interface Memorial {
  id: string;
  name: string;
  createdAt: string;
  status: 'active' | 'pending' | 'flagged';
  revenue: number;
  lastModified: string;
  totalVisits: number;
  flowersReceived: number;
  donationsReceived: number;
  compliance: {
    hasInappropriateContent: boolean;
    lastReviewDate: string;
    reviewedBy: string;
  };
}

const SAMPLE_MEMORIALS: Memorial[] = [
  {
    id: "M001",
    name: "Sarah Johnson",
    createdAt: "2024-01-15",
    status: "active",
    revenue: 250.50,
    lastModified: "2024-03-10",
    totalVisits: 1250,
    flowersReceived: 45,
    donationsReceived: 15,
    compliance: {
      hasInappropriateContent: false,
      lastReviewDate: "2024-03-01",
      reviewedBy: "Admin1"
    }
  },
  {
    id: "M002",
    name: "Robert Smith",
    createdAt: "2024-02-01",
    status: "flagged",
    revenue: 150.75,
    lastModified: "2024-03-12",
    totalVisits: 850,
    flowersReceived: 28,
    donationsReceived: 8,
    compliance: {
      hasInappropriateContent: true,
      lastReviewDate: "2024-03-12",
      reviewedBy: "Admin2"
    }
  },
  {
    id: "M003",
    name: "Maria Garcia",
    createdAt: "2024-02-15",
    status: "pending",
    revenue: 75.25,
    lastModified: "2024-03-14",
    totalVisits: 320,
    flowersReceived: 12,
    donationsReceived: 4,
    compliance: {
      hasInappropriateContent: false,
      lastReviewDate: "2024-03-14",
      reviewedBy: "Admin1"
    }
  }
];

export function AdminPanel() {
  const [memorials] = useState<Memorial[]>(SAMPLE_MEMORIALS);
  const [selectedMemorial, setSelectedMemorial] = useState<Memorial | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'flagged'>('all');

  const totalRevenue = memorials.reduce((sum, memorial) => sum + memorial.revenue, 0);
  const totalVisits = memorials.reduce((sum, memorial) => sum + memorial.totalVisits, 0);
  const totalFlowers = memorials.reduce((sum, memorial) => sum + memorial.flowersReceived, 0);

  const filteredMemorials = filterStatus === 'all' 
    ? memorials 
    : memorials.filter(m => m.status === filterStatus);

  const handleDelete = (id: string) => {
    // Implement delete functionality
    console.log('Delete memorial:', id);
  };

  const handleEdit = (memorial: Memorial) => {
    setSelectedMemorial(memorial);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'flagged': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Memorial Administration</h1>
            <div className="flex items-center gap-4">
              <button className="btn-secondary flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Data
              </button>
              <button className="btn-primary flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Generate Report
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Total Revenue</h3>
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <p className="mt-2 text-3xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
              <p className="mt-1 text-sm text-gray-500">From all memorials</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Total Visits</h3>
                <Eye className="h-5 w-5 text-blue-500" />
              </div>
              <p className="mt-2 text-3xl font-bold text-gray-900">{totalVisits.toLocaleString()}</p>
              <p className="mt-1 text-sm text-gray-500">Across all memorials</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Digital Flowers</h3>
                <Flower2 className="h-5 w-5 text-pink-500" />
              </div>
              <p className="mt-2 text-3xl font-bold text-gray-900">{totalFlowers}</p>
              <p className="mt-1 text-sm text-gray-500">Total flowers received</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <Filter className="h-5 w-5 text-gray-400" />
            <div className="flex gap-2">
              {(['all', 'active', 'pending', 'flagged'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${filterStatus === status 
                      ? 'bg-primary-100 text-primary-800' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Memorials Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Memorial
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Compliance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Modified
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMemorials.map((memorial) => (
                  <tr key={memorial.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{memorial.name}</div>
                          <div className="text-sm text-gray-500">ID: {memorial.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(memorial.status)}`}>
                        {memorial.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${memorial.revenue.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {memorial.compliance.hasInappropriateContent ? (
                          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        )}
                        <span className="text-sm text-gray-500">
                          Last reviewed: {memorial.compliance.lastReviewDate}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {memorial.lastModified}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <button
                          onClick={() => handleEdit(memorial)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(memorial.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}