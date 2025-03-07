import React, { useState } from 'react';
import { AccountForm } from '../components/forms/AccountForm';
import { MemorialForm } from '../components/forms/MemorialForm';

// Type definitions
interface AccountFormData {
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

interface MemorialFormData {
  deceased: {
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    dateOfDeath?: string;
    biography?: string;
  };
  photos?: string[];
  videos?: string[];
}

const CreateMemorial: React.FC = () => {
  const [step, setStep] = useState<'account' | 'memorial'>('account');
  const [accountData, setAccountData] = useState<AccountFormData | null>(null);

  const handleAccountSubmit = (data: AccountFormData) => {
    setAccountData(data);
    setStep('memorial');
  };

  const handleMemorialSubmit = async (data: MemorialFormData) => {
    try {
      const token = localStorage.getItem('authToken');
      
      // First, create the memorial
      const memorialResponse = await fetch('http://localhost:5000/api/memorials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...data,
          creator: accountData?.email // Link memorial to user
        })
      });

      if (!memorialResponse.ok) {
        throw new Error(`Failed to create memorial: ${memorialResponse.statusText}`);
      }

      const memorial = await memorialResponse.json();

      // Optionally, show success message or redirect
      alert('Memorial created successfully!');
      
      // Navigate to the new memorial's details page
      window.location.href = `/memorial/${memorial._id}`;

    } catch (error) {
      console.error('Error creating memorial:', error);
      alert(`Failed to create memorial: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1">
        <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
            {step === 'account' ? (
              <AccountForm onSubmit={handleAccountSubmit} />
            ) : (
              <MemorialForm onSubmit={handleMemorialSubmit} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMemorial;