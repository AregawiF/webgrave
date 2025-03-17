import React, { useEffect, useState } from 'react';
import { Search, Scan, Filter } from 'lucide-react';
import { AdvancedSearch } from '../components/AdvancedSearch';
import { Link, useNavigate } from 'react-router-dom';
import AdminPanel from './AdminPanel';

interface Memorial {
  id: string;
  name: string;
  birthYear: string;
  deathYear: string;
  profileImage: string;
  birthDate: string;
  deathDate: string;
  description: string;
  isPublic: boolean;
  mediaFiles: { 
    type: 'image' | 'video' | 'document';
    url: string;
    caption: string;
  }[];
  enableDigitalFlowers: boolean;
  suggestedDonationAmount: number;
  // New fields
  causeOfDeath?: string;
  disasterType?: string;
  disasterName?: string;
  disasterDate?: string;
  nationality?: string;
  religion?: string;
  identityNumber?: string;
  identityType?: string;
}

export default function FindMemorial() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemorial, setSelectedMemorial] = useState<Memorial | null>(null);
  const [memorials, setMemorials] = useState([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMemorials = async () => {
      const response = await fetch('http://localhost:5000/api/memorials', {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log('error fetching memorials', errorData);
        return;
      }

      const data = await response.json();
      console.log('Api response:', data);
      setMemorials(data.memorials);
      setLoading(false);
    };

    fetchMemorials();
  }, []);

  const filteredMemorials = searchQuery.toLowerCase() === 'admin pages'
    ? []
    : memorials.filter(memorial => {
        if (searchCriteria) {
          return Object.entries(searchCriteria).every(([key, value]) => {
            if (!value) return true;
            switch (key) {
              case 'name':
                return memorial.fullName.toLowerCase().includes(value.toString().toLowerCase());
              case 'birthDate':
                return memorial.birthDate === value;
              case 'deathDate':
                return memorial.deathDate === value;
              case 'nationality':
                return memorial.nationality.toLowerCase().includes(value.toString().toLowerCase());
              case 'religion':
                return memorial.religion?.toLowerCase().includes(value.toString().toLowerCase());
              case 'primaryCause':
                return memorial.causeOfDeath?.primaryCause.toLowerCase().includes(value.toString().toLowerCase());
              case 'majorEvent':
                return memorial.causeOfDeath?.majorEvent === value;
              default:
                return true;
            }
          });
        }
        return memorial.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
               memorial._id.toLowerCase().includes(searchQuery.toLowerCase());
      });

  // Show admin panel when searching for "admin pages"
  React.useEffect(() => {
    setShowAdmin(searchQuery.toLowerCase() === 'admin pages');
  }, [searchQuery]);

  const handleAdvancedSearch = (criteria: any) => {
    setSearchCriteria(criteria);
    setShowAdvancedSearch(false);
  };

  if (showAdmin) {
    return <AdminPanel />;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const formatYear = (dateString: string) => {
    return new Date(dateString).getFullYear();
  };

  return (
    <div className="min-h-screen bg-memorial-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-10">
          {/* Search Section */}
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name "
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-search"
                />
              </div>
              <button 
                onClick={() => setShowAdvancedSearch(true)}
                className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <Filter className="h-5 w-5" />
                Advanced Search
              </button>
              <Link 
                to="/scan-code"
                className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <Scan className="h-5 w-5" />
                Scan QR Code
              </Link>
            </div>
          </div>

          {/* Memorials Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMemorials.map((memorial) => (
              <div 
                key={memorial._id}
                className="memorial-card group cursor-pointer"
                onClick={() => navigate(`/memorial/${memorial._id}`)}
                // onClick={() => setSelectedMemorial(memorial)}
              >
                <div className="aspect-w-1 aspect-h-1 relative overflow-hidden">
                  <img
                    src={memorial.mainPicture}
                    alt={memorial.fullName}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-memorial-900 mb-1 group-hover:text-indigo-600 transition-colors">
                    {memorial.fullName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {formatYear(memorial.birthDate)} - {formatYear(memorial.deathDate)}
                  </p>
                  <p className="text-gray-600 mt-2 font-mono">
                    Digital flowers: {memorial.enableDigitalFlowers ? 'Allowed' : 'Not Allowed'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {filteredMemorials.length === 0 && !showAdmin && (
            <div className="text-center py-16 bg-white rounded-xl shadow-soft">
              <p className="text-gray-500 text-lg">
                No memorials found matching your search.
              </p>
            </div>
          )}
        </div>
      </div>

      {showAdvancedSearch && (
        <AdvancedSearch
          onSearch={handleAdvancedSearch}
          onClose={() => setShowAdvancedSearch(false)}
        />
      )}
    </div>
  );
}