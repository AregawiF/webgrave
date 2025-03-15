import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
            const memorialData = localStorage.getItem('memorialFormData');
            console.log('memorialData:', memorialData);
            localStorage.removeItem('memorialFormData');

            const response = await fetch('http://localhost:5000/api/memorials', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              },
              body: memorialData
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Failed to create memorial');
            }

            const memorial = await response.json();
            
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

  if (errorMessage) {
    return (
      <div className='text-center mt-16'>
        <h1>Payment Verification Failed</h1>
        <p>{errorMessage}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Processing Payment...</h1>
      <p>Please wait, you will be redirected shortly.</p>
    </div>
  );
};

export default PaymentSuccess;