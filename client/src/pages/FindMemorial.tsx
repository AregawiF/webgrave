import React, { useEffect, useState } from 'react';
import { Search, Scan, Filter } from 'lucide-react';
import { AdminPanel } from './AdminPanel';
import { AdvancedSearch } from '../components/AdvancedSearch';
import { Link, useNavigate } from 'react-router-dom';

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

const SAMPLE_MEMORIALS: Memorial[] = [
  {
    id: "M001",
    name: "Sarah Johnson",
    birthYear: "1945",
    deathYear: "2023",
    birthDate: "1945-03-15",
    deathDate: "2023-11-20",
    profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
    description: "Sarah was a beloved mother, grandmother, and friend to many. Her warm smile and gentle spirit touched countless lives. She dedicated her life to teaching and nurturing young minds, spending over 40 years as an elementary school teacher. Her passion for gardening and baking brought joy to everyone around her.",
    isPublic: true,
    mediaFiles: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=400&h=300&fit=crop',
        caption: 'Family gathering, summer 2022'
      },
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=400&h=300&fit=crop',
        caption: 'In her beloved garden'
      }
    ],
    enableDigitalFlowers: true,
    suggestedDonationAmount: 5,
    causeOfDeath: "Natural causes",
    nationality: "American",
    religion: "Christian",
    identityNumber: "SSN-XXXX-XX-1234",
    identityType: "ssn"
  },
  {
    id: "M002",
    name: "Robert Smith",
    birthYear: "1932",
    deathYear: "2022",
    birthDate: "1932-08-22",
    deathDate: "2022-12-15",
    profileImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
    description: "Robert was a decorated veteran and loving father. His strength of character and unwavering integrity served as an inspiration to all who knew him. As a community leader and small business owner, he helped shape the town he loved.",
    isPublic: true,
    mediaFiles: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1626178793926-22b28830aa30?w=400&h=300&fit=crop',
        caption: 'Military service photo, 1955'
      }
    ],
    enableDigitalFlowers: true,
    suggestedDonationAmount: 10,
    causeOfDeath: "Heart disease",
    nationality: "American",
    religion: "Protestant",
    identityNumber: "SSN-XXXX-XX-5678",
    identityType: "ssn"
  },
  {
    id: "M003",
    name: "Maria Garcia",
    birthYear: "1958",
    deathYear: "2024",
    birthDate: "1958-04-10",
    deathDate: "2024-01-05",
    profileImage: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=400&fit=crop",
    description: "Maria was the heart and soul of her family, known for her incredible cooking and infectious laughter. As a talented artist, she brought beauty into the world through her paintings and sculptures. Her legacy lives on through the countless lives she touched with her creativity and kindness.",
    isPublic: true,
    mediaFiles: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?w=400&h=300&fit=crop',
        caption: 'At her art studio'
      },
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1601935111741-ae98b2b230b0?w=400&h=300&fit=crop',
        caption: 'Family celebration, 2023'
      }
    ],
    enableDigitalFlowers: true,
    suggestedDonationAmount: 7,
    causeOfDeath: "Cancer",
    nationality: "Mexican-American",
    religion: "Catholic",
    identityNumber: "SSN-XXXX-XX-9012",
    identityType: "ssn"
  }
];

export default function FindMemorial() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemorial, setSelectedMemorial] = useState<Memorial | null>(null);
  const [memorials, setMemorials] = useState([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState<any>(null);
  const [loading, setLoading] = useState(false);
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