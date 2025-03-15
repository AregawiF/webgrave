import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Convert base64 string to Blob for file upload
  const base64ToBlob = async (base64String: string): Promise<Blob> => {
    // Extract the base64 data part (remove data:image/jpeg;base64, etc.)
    const parts = base64String.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    
    return new Blob([uInt8Array], { type: contentType });
  };

  useEffect(() => {
    if (sessionId) {
      const verifyPayment = async () => {
        try {
          const token = localStorage.getItem('authToken');
          const response = await fetch('http://localhost:5000/api/payment/verifyPayment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ sessionId }) // Send sessionId 
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to verify payment');
          }

          const data = await response.json();

          if (data.success) {
            // Get memorial data from localStorage
            const storedMemorialData = localStorage.getItem('memorialFormData');

            if (!storedMemorialData) {
              throw new Error('No memorial data found in localStorage.');
            }

            const memorialData = JSON.parse(storedMemorialData);
            const formData = new FormData();

            // Convert base64 profile image to Blob
            if (memorialData.profileImage) {
              const profileImageBlob = await base64ToBlob(memorialData.profileImage);
              formData.append('mainPicture', profileImageBlob, 'profile.jpg');
            }

            // Convert base64 media files to Blobs
            if (memorialData.mediaFiles && memorialData.mediaFiles.length > 0) {
              for (let i = 0; i < memorialData.mediaFiles.length; i++) {
                const mediaFile = memorialData.mediaFiles[i];
                const mediaBlob = await base64ToBlob(mediaFile.url);
                formData.append('additionalMedia', mediaBlob, `media_${i}.${mediaFile.type === 'image' ? 'jpg' : 'mp4'}`);
              }
            }

            // Add basic memorial information
            formData.append('fullName', memorialData.name);
            formData.append('birthDate', memorialData.birthDate);
            formData.append('placeOfBirth', memorialData.birthPlace);
            formData.append('deathDate', memorialData.deathDate);
            formData.append('biography', memorialData.description);
            
            // Service information
            if (memorialData.serviceDate) formData.append('serviceDate', memorialData.serviceDate);
            if (memorialData.serviceLocation) formData.append('serviceLocation', memorialData.serviceLocation);
            if (memorialData.serviceDetails) formData.append('serviceDetails', memorialData.serviceDetails);

            // Identity information
            formData.append('identityType', memorialData.identityType || 'national_id');
            formData.append('identityNumber', memorialData.identityNumber || '00000000');
            formData.append('nationality', memorialData.nationality || 'Unknown');
            
            // Optional fields
            if (memorialData.nickname) formData.append('nickName', memorialData.nickname);
            if (memorialData.maidenName) formData.append('maidenName', memorialData.maidenName);
            if (memorialData.religion) formData.append('religion', memorialData.religion);
            if (memorialData.favoriteQuote) formData.append('favoriteQuote', memorialData.favoriteQuote);
            
            // Boolean fields
            formData.append('birthdayReminder', String(memorialData.enableBirthDateReminder));
            formData.append('militaryService', String(!!memorialData.militaryService));
            formData.append('enableDigitalFlowers', String(memorialData.enableDigitalFlowers));
            formData.append('isPublic', String(memorialData.isPublic));
            
            // Array fields - must be stringified for backend
            if (memorialData.languages && memorialData.languages.length) {
              formData.append('languagesSpoken', JSON.stringify(memorialData.languages));
            }
            
            // Education - must be stringified arrays of objects
            if (memorialData.education && memorialData.education.length) {
              formData.append('education', JSON.stringify(memorialData.education));
            }
            
            // Family members - must be stringified arrays of objects
            if (memorialData.familyMembers && memorialData.familyMembers.length) {
              formData.append('familyMembers', JSON.stringify(memorialData.familyMembers));
            }
            
            // Cause of death - must be structured as an object
            const causeOfDeath = {
              primaryCause: memorialData.causeOfDeath,
              majorEvent: memorialData.disasterType ? mapDisasterTypeToBackend(memorialData.disasterType) : 'not_related'
            };
            formData.append('causeOfDeath', JSON.stringify(causeOfDeath));

            // Make the request to create the memorial
            const createResponse = await fetch('http://localhost:5000/api/memorials', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              },
              body: formData
            });

            if (!createResponse.ok) {
              const errorData = await createResponse.json();
              throw new Error(errorData.message || 'Failed to create memorial');
            }

            const memorial = await createResponse.json();
            
            // Clean up localStorage
            localStorage.removeItem('memorialFormData');
            
            // Navigate to the new memorial's details page
            navigate(`/memorial/${memorial._id}`);
          } else {
            setErrorMessage(data.message || 'Payment verification failed.');
          }
        } catch (error: any) {
          console.error('Error verifying payment and creating memorial:', error);
          setErrorMessage(error.message || 'An error occurred during payment verification.');
        }
      };

      verifyPayment();
    } else {
      setErrorMessage('Session ID not found.');
    }
  }, [sessionId, navigate]);

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

  if (errorMessage) {
    return (
      <div className='text-center mt-16'>
        <h1>Payment Verification Failed</h1>
        <p>{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className='text-center mt-16'>
      <h1 className='text-2xl font-bold mb-4'>Processing Payment...</h1>
      <p>Please wait, you will be redirected shortly.</p>
    </div>
  );
};

export default PaymentSuccess;