import React, { useState } from 'react';
import { MemorialForm } from '../components/forms/MemorialForm';
import { useNavigate } from 'react-router-dom';

const CreateMemorial: React.FC = () => {
  const navigate = useNavigate();

    const handleStripeCheckout = async () => {
    try {
      const token = localStorage.getItem('authToken');

      const amount = 20; 
      const response = await fetch("https://webgrave.onrender.com/api/payment/create-stripe-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Pass the auth token here too if needed
        },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) { 
        throw new Error('Failed to initiate Stripe checkout');
      }

      const { url } = await response.json();
      window.location.href = url; // Redirect to Stripe Checkout
    } catch (error: any) {
      console.error('Error initiating Stripe checkout:', error);
      alert(`Failed to initiate payment: ${error.message}`);
    }
  };

  // Helper function to convert file URLs to base64
  const fileToBase64 = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting file to base64:', error);
      throw error;
    }
  };

  const handleMemorialSubmit = async (data: any) => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Create a copy of the data for localStorage
      const localStorageData: any = { ...data };
      
      // Convert main picture to base64 for localStorage
      if (data.profileImage) {
        localStorageData.profileImage = await fileToBase64(data.profileImage);
      }
      
      // Store in localStorage
      localStorage.setItem('memorialFormData', JSON.stringify(localStorageData));
      
      // Continue with payment
      handleStripeCheckout();
      
    } catch (error: any) {
      console.error('Error creating memorial:', error);
      alert(`Failed to create memorial: ${error.message}`);
    }
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