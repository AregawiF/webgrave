import React, { useState } from 'react';
import { MemorialForm } from '../components/forms/MemorialForm';
import { useNavigate } from 'react-router-dom';

const CreateMemorial: React.FC = () => {
  const navigate = useNavigate();

  const handleMemorialSubmit = async (data: any) => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Create FormData object for multipart/form-data submission (required for file uploads)
      const formData = new FormData();
      
      // Add the main picture - required by backend
      if (data.profileImage) {
        const mainPictureFile = await fetch(data.profileImage).then(r => r.blob());
        formData.append('mainPicture', mainPictureFile, 'profile.jpg');
      }
      
      // Add basic memorial information
      formData.append('fullName', data.name);
      formData.append('birthDate', data.birthDate);
      formData.append('placeOfBirth', data.birthPlace);
      formData.append('deathDate', data.deathDate);
      formData.append('biography', data.description);
      
      // Service information
      if (data.serviceDate) formData.append('serviceDate', data.serviceDate);
      if (data.serviceLocation) formData.append('serviceLocation', data.serviceLocation);
      if (data.serviceDetails) formData.append('serviceDetails', data.serviceDetails);

      // Identity information - required by backend
      formData.append('identityType', data.identityType || 'national_id');
      formData.append('identityNumber', data.identityNumber || '00000000');
      formData.append('nationality', data.nationality || 'Unknown');
      
      // Optional fields
      if (data.nickname) formData.append('nickName', data.nickname);
      if (data.maidenName) formData.append('maidenName', data.maidenName);
      if (data.religion) formData.append('religion', data.religion);
      if (data.favoriteQuote) formData.append('favoriteQuote', data.favoriteQuote);
      
      // Boolean fields
      formData.append('birthdayReminder', String(data.enableBirthDateReminder));
      formData.append('militaryService', String(!!data.militaryService));
      formData.append('enableDigitalFlowers', String(data.enableDigitalFlowers));
      formData.append('isPublic', String(data.isPublic));
      
      // Array fields - must be stringified for backend
      if (data.languages && data.languages.length) {
        formData.append('languagesSpoken', JSON.stringify(data.languages));
      }
      
      // Education - must be stringified arrays of objects
      if (data.education && data.education.length) {
        formData.append('education', JSON.stringify(data.education));
      }
      
      // Family members - must be stringified arrays of objects
      if (data.familyMembers && data.familyMembers.length) {
        formData.append('familyMembers', JSON.stringify(data.familyMembers));
      }
      
      // Cause of death - must be structured as an object
      const causeOfDeath = {
        primaryCause: data.causeOfDeath,
        majorEvent: data.disasterType ? mapDisasterTypeToBackend(data.disasterType) : 'not_related'
      };
      formData.append('causeOfDeath', JSON.stringify(causeOfDeath));

      const user = localStorage.getItem('user'); // Get stored user data as a string

      if (user) {
        const parsedUser = JSON.parse(user); // Parse it to an object
        if (parsedUser.email) {
          formData.append('createdBy', parsedUser.email); // Append email if it exists
        } else {
          console.error("User email not found in local storage.");
        }
      } else {
        console.error("User not found in local storage.");
      }


      // Handle additional media files
      if (data.mediaFiles && data.mediaFiles.length) {
        // Process each media file (download from object URL and append to form)
        for (let i = 0; i < data.mediaFiles.length; i++) {
          const file = data.mediaFiles[i];
          const mediaFile = await fetch(file.url).then(r => r.blob());
          formData.append('additionalMedia', mediaFile, `media_${i}.${file.type === 'image' ? 'jpg' : 'mp4'}`);
        }
      }

      console.log("submitted data", formData);
      // Make the API request
      const response = await fetch('http://localhost:5000/api/memorials', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create memorial');
      }

      const memorial = await response.json();
      
      // Navigate to the new memorial's details page
      // navigate(`/memorial/${memorial._id}`);
      navigate('my-memorials');
    } catch (error: any) {
      console.error('Error creating memorial:', error);
      alert(`Failed to create memorial: ${error.message}`);
    }
  };
  
  // Helper function to map frontend disaster types to backend enum values
  const mapDisasterTypeToBackend = (disasterType: string): string => {
    const mapping: {[key: string]: string} = {
      'war': 'war_conflict',
      'natural': 'natural_disaster',
      'pandemic': 'pandemic_disease',
      'accident': 'major_accident'
    };
    return mapping[disasterType] || 'not_related';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1">
        <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
            <MemorialForm onSubmit={handleMemorialSubmit} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMemorial;