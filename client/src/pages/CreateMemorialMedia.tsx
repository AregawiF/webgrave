import { Upload, X } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const CreateMemorialMedia = () => {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [formData, setFormData] = useState({ mediaFiles: [] });
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).map(file => ({
        type: file.type.startsWith('image/') ? 'image' : 
              file.type.startsWith('video/') ? 'video' : 'document',
        url: URL.createObjectURL(file),
        caption: ''
      }));
      
      setMediaFiles(prev => [...prev, ...newFiles]);
      setFormData(prev => ({ ...prev, mediaFiles: [...prev.mediaFiles, ...newFiles] }));
    }
  };

  const removeFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({ ...prev, mediaFiles: prev.mediaFiles.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    const formData = new FormData();
    for (const [index, file] of mediaFiles.entries()) {
        const blob = await fetch(file.url).then(res => res.blob());
        formData.append("additionalMedia", blob, `media-${index}`);
    }

    try {
        const response = await fetch(`http://localhost:5000/api/memorials/media/${id}`, {
            method: 'PUT',
            body: formData,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        if (!response.ok) {
            const errordata = await response.json();
            throw new Error(errordata.message || 'Failed to add media files');
        } else {
            window.alert('Media files added successfully');
            navigate(`/memorial/${id}`);
        }
        
    } catch (err: any) {
        window.alert(err.message || 'An unknown error occurred');
    } finally {
        setLoading(false);
    }

  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
        <div className="max-w-2xl w-full bg-white shadow-md rounded-lg p-6">

        <button 
          onClick={() => navigate(`/memorial/${id}`)}
          className="text-primary-500 cursor-pointer"
        >
          ← Go to Memorial
        </button>
        <form onSubmit={handleSubmit} className="space-y-8">
        <div>
            <h2 className="text-2xl font-bold text-gray-900">Upload Additional Media</h2>
            <p className="mt-2 text-sm text-gray-600">
            Please upload any additional media files you would like to include.
            </p>
        </div>

        <div className="space-y-4">
            <ul className="space-y-2">
            {mediaFiles.map((file, index) => (
                <li key={index} className="flex items-center">
                <span className="flex-1 text-sm text-gray-600">
                    {file.type === 'image' ? '🖼️ Image' : file.type === 'video' ? '🎥 Video' : '📄 Document'} 
                </span>
                <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="ml-2 text-red-600 hover:text-red-800"
                >
                    Remove
                </button>
                </li>
            ))}
            </ul>
        </div>

        <div className="space-y-4">
            <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Additional Media</h3>
            <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-50 text-primary-700 hover:bg-primary-600 hover:text-white">
                <Upload className="mr-2 h-4 w-4" />
                Add Files
                <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
                />
            </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {formData.mediaFiles.map((file, index) => (
                <div key={index} className="relative group">
                {file.type === 'video' ? (
                    <video
                    src={file.url}
                    controls
                    className="h-32 w-full object-cover rounded-lg"
                    />
                    ) : file.type === 'image' ? (
                        <img
                    src={file.url}
                    alt="Memorial media"
                    className="h-32 w-full object-cover rounded-lg"
                    />
                    ) : (
                        <div className="h-32 w-full flex items-center justify-center bg-gray-100 rounded-lg">
                    <span className="text-gray-500">Document</span>
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                    <X className="h-4 w-4" />
                </button>
                </div>
            ))}
            </div>
        </div>

        <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
            Submit Media
        </button>
        </form>
        </div>
    </div>
  );
};

export default CreateMemorialMedia;