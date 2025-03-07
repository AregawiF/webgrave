import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Edit, Trash2, QrCode, Heart, Calendar, 
  Globe, Flag, Book, Medal, Users, 
  CreditCard, Briefcase, GraduationCap 
} from 'lucide-react';
import QRCode from 'qrcode.react';

interface MediaFile {
  type: 'image' | 'video' | 'document';
  url: string;
  caption: string;
}

interface Memorial {
  _id: string;
  creator: string;
  deceased: {
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    dateOfDeath?: string;
    biography?: string;
  };
  photos: MediaFile[];
  videos: MediaFile[];
  qrCode: string;
  status: 'active' | 'inactive';
  totalTributes: number;
}

const MemorialDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [memorial, setMemorial] = useState<Memorial | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'media' | 'tributes'>('overview');

  // Check if current user is the memorial creator
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isCreator = memorial?.creator === currentUser._id;

  useEffect(() => {
    const fetchMemorialDetails = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`http://localhost:5000/api/memorials/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch memorial details');
        }

        const data = await response.json();
        setMemorial(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemorialDetails();
  }, [id]);

  const handleEdit = () => {
    navigate(`/edit-memorial/${id}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this memorial? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/memorials/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete memorial');
      }

      navigate('/find-memorials');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the memorial');
    }
  };

  const handleToggleStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/memorials/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: memorial?.status === 'active' ? 'inactive' : 'active' 
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update memorial status');
      }

      const updatedMemorial = await response.json();
      setMemorial(updatedMemorial);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating memorial status');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-red-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-red-500">{error}</p>
          <button 
            onClick={() => navigate('/find-memorials')} 
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg"
          >
            Back to Memorials
          </button>
        </div>
      </div>
    );
  }

  if (!memorial) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Memorial Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            {memorial.deceased.firstName} {memorial.deceased.lastName}
          </h1>
          <div className="flex items-center space-x-4 mt-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              memorial.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {memorial.status === 'active' ? 'Active' : 'Inactive'}
            </span>
            {memorial.deceased.dateOfBirth && memorial.deceased.dateOfDeath && (
              <div className="flex items-center text-gray-600">
                <Calendar className="mr-2 h-5 w-5" />
                <span>{memorial.deceased.dateOfBirth} - {memorial.deceased.dateOfDeath}</span>
              </div>
            )}
          </div>
        </div>

        {/* Creator Actions */}
        {isCreator && (
          <div className="flex space-x-4">
            <button 
              onClick={handleEdit}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              <Edit className="mr-2 h-5 w-5" /> Edit Memorial
            </button>
            <button 
              onClick={handleToggleStatus}
              className={`flex items-center px-4 py-2 rounded-lg transition ${
                memorial.status === 'active'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {memorial.status === 'active' ? 'Deactivate' : 'Activate'}
            </button>
            <button 
              onClick={handleDelete}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <Trash2 className="mr-2 h-5 w-5" /> Delete
            </button>
          </div>
        )}
      </div>

      {/* QR Code Section */}
      <div className="bg-white shadow-lg rounded-xl p-6 mb-8 flex items-center">
        <div className="mr-6">
          <QRCode
            value={`https://webgrave.com/memorial/${memorial._id}`}
            size={128}
            level="H"
            includeMargin={true}
          />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Memorial QR Code</h3>
          <p className="text-gray-600">
            Scan this code to quickly access {memorial.deceased.firstName}'s memorial page.
            Share this with friends and family to help them remember and honor their life.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        {['overview', 'media', 'tributes'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 font-medium ${
              activeTab === tab 
                ? 'border-b-2 border-primary-600 text-primary-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {memorial.deceased.biography && (
            <div className="bg-white shadow-lg rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Life Story</h3>
              <p className="text-gray-600 leading-relaxed">
                {memorial.deceased.biography}
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'media' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {memorial.photos.map((photo, index) => (
            <div key={index} className="bg-white shadow-lg rounded-xl overflow-hidden">
              <img 
                src={photo.url} 
                alt={photo.caption} 
                className="w-full h-64 object-cover"
              />
              {photo.caption && (
                <div className="p-4 bg-gray-50">
                  <p className="text-gray-600 text-sm">{photo.caption}</p>
                </div>
              )}
            </div>
          ))}
          {memorial.videos.map((video, index) => (
            <div key={index} className="bg-white shadow-lg rounded-xl overflow-hidden">
              <video 
                src={video.url} 
                controls 
                className="w-full h-64 object-cover"
              />
              {video.caption && (
                <div className="p-4 bg-gray-50">
                  <p className="text-gray-600 text-sm">{video.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'tributes' && (
        <div className="space-y-6">
          <div className="bg-white shadow-lg rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Digital Flowers</h3>
              <div className="flex items-center text-primary-600">
                <Heart className="mr-2 h-6 w-6" />
                <span className="text-2xl font-bold">${memorial.totalTributes}</span>
              </div>
            </div>
            <p className="text-gray-600">
              Digital flowers help support the memorial and honor the memory of {memorial.deceased.firstName}.
              <button 
                onClick={() => navigate(`/send-flowers/${memorial._id}`)}
                className="ml-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                Send Flowers
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemorialDetailsPage;
