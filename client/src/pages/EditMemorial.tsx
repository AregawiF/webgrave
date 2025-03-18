import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, X } from 'lucide-react';

interface Memorial {
  _id: string;
  deceased: {
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    dateOfDeath?: string;
    biography?: string;
  };
  photos: string[];
  videos: string[];
}

const EditMemorial: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [memorial, setMemorial] = useState<Memorial | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMemorialDetails = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`https://webgrave.onrender.com/api/memorials/${id}`, {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!memorial) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://webgrave.onrender.com/api/memorials/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(memorial)
      });

      if (!response.ok) {
        throw new Error('Failed to update memorial');
      }

      navigate(`/memorial/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating the memorial');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setMemorial(prev => {
      if (!prev) return null;

      // Handle nested properties
      if (name.startsWith('deceased.')) {
        return {
          ...prev,
          deceased: {
            ...prev.deceased,
            [name.split('.')[1]]: value
          }
        };
      }

      return {
        ...prev,
        [name]: value
      };
    });
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Memorial</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Deceased Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="deceased.firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                id="deceased.firstName"
                name="deceased.firstName"
                value={memorial.deceased.firstName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                required
              />
            </div>
            
            <div>
              <label htmlFor="deceased.lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                id="deceased.lastName"
                name="deceased.lastName"
                value={memorial.deceased.lastName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                required
              />
            </div>
            
            <div>
              <label htmlFor="deceased.dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                id="deceased.dateOfBirth"
                name="deceased.dateOfBirth"
                value={memorial.deceased.dateOfBirth || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
            
            <div>
              <label htmlFor="deceased.dateOfDeath" className="block text-sm font-medium text-gray-700 mb-2">
                Date of Death
              </label>
              <input
                type="date"
                id="deceased.dateOfDeath"
                name="deceased.dateOfDeath"
                value={memorial.deceased.dateOfDeath || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <label htmlFor="deceased.biography" className="block text-sm font-medium text-gray-700 mb-2">
              Biography
            </label>
            <textarea
              id="deceased.biography"
              name="deceased.biography"
              value={memorial.deceased.biography || ''}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              placeholder="Share a brief life story..."
            />
          </div>
        </div>

        {/* Media Upload Section (to be implemented) */}
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Photos and Videos</h2>
          <p className="text-gray-600">Media upload functionality coming soon...</p>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(`/memorial/${id}`)}
            className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
          >
            <X className="mr-2 h-5 w-5" /> Cancel
          </button>
          
          <button
            type="submit"
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            <Save className="mr-2 h-5 w-5" /> Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditMemorial;
