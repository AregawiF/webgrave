import React, { useState } from 'react';
import { AccountForm } from '../components/forms/AccountForm';
import { MemorialForm } from '../components/forms/MemorialForm';

export function CreateMemorial() {
  const [step, setStep] = useState<'account' | 'memorial'>('account');
  const [accountData, setAccountData] = useState<AccountFormData | null>(null);

  const handleAccountSubmit = (data: AccountFormData) => {
    setAccountData(data);
    setStep('memorial');
  };

  const handleMemorialSubmit = (data: MemorialFormData) => {
    // Here you would typically:
    // 1. Create the user account
    // 2. Process the payment
    // 3. Create the memorial
    console.log('Account:', accountData);
    console.log('Memorial:', data);
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
}