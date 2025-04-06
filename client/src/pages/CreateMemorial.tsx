// import React, { useState } from 'react';
// import { MemorialForm } from '../components/forms/MemorialForm';
// import { useNavigate } from 'react-router-dom';

// interface PayFastData {
//   payfastUrl: string;
//   formData: { [key: string]: string }; // Object with string key-value pairs
// }

// const CreateMemorial: React.FC = () => {
//   const navigate = useNavigate();
//   const [isSubmitting, setIsSubmitting] = useState(false); // Add loading state for payment initiation
//   const [submitError, setSubmitError] = useState<string | null>(null); 

//   const submitPayFastForm = (payfastUrl: string, formData: { [key: string]: string }) => {
//     const form = document.createElement('form');
//     form.method = 'POST';
//     form.action = payfastUrl;
//     form.style.display = 'none'; // Hide the form

//     for (const key in formData) {
//       if (formData.hasOwnProperty(key)) {
//         const input = document.createElement('input');
//         input.type = 'hidden';
//         input.name = key;
//         input.value = formData[key];
//         form.appendChild(input);
//       }
//     }

//     document.body.appendChild(form);
//     form.submit();
//     // No need to remove the form immediately, submission causes navigation
//     // document.body.removeChild(form); // You might want to clean up later if needed
//   };

//   // Renamed from handleStripeCheckout
//   const initiatePayFastPayment = async () => {
//     setIsSubmitting(true);
//     setSubmitError(null);
//     try {
//       const token = localStorage.getItem('authToken');
//       if (!token) {
//         throw new Error("Authentication token not found. Please log in again.");
//       }

//       const amount = 20; // Define your amount - ideally fetch from config or backend
//       const response = await fetch("https://webgrave.onrender.com/api/payments/create-payfast-payment", { 
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${token}`
//         },
//         body: JSON.stringify({
//           amount: amount,
//           // Optional: Pass item name/description if you want dynamic values
//           // itemName: "WebGrave Memorial Creation",
//           // itemDescription: `Payment for creating a new memorial`,
//          }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Failed to initiate PayFast payment process');
//       }

//       const { payfastUrl, formData }: PayFastData = await response.json(); // <-- Updated response handling

//       if (!payfastUrl || !formData) {
//          throw new Error('Received invalid data from payment server.');
//       }

//       // Use the helper function to redirect via form submission
//       submitPayFastForm(payfastUrl, formData);

//       // If submission starts, we don't need to set isSubmitting back to false
//       // as the page will navigate away.

//     } catch (error: any) {
//       console.error('Error initiating PayFast payment:', error);
//       setSubmitError(`Failed to start payment: ${error.message}`);
//       setIsSubmitting(false); // Re-enable button on error
//     }
//   };

//   //   const handleStripeCheckout = async () => {
//   //   try {
//   //     const token = localStorage.getItem('authToken');

//   //     const amount = 20; 
//   //     const response = await fetch("https://webgrave.onrender.com/api/payment/create-yoco-payment", {
//   //       method: "POST",
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //         "Authorization": `Bearer ${token}` // Pass the auth token here too if needed
//   //       },
//   //       body: JSON.stringify({ amount }),
//   //     });

//   //     if (!response.ok) { 
//   //       throw new Error('Failed to initiate Stripe checkout');
//   //     }

//   //     const { url } = await response.json();
//   //     window.location.href = url; // Redirect to Stripe Checkout
//   //   } catch (error: any) {
//   //     console.error('Error initiating Stripe checkout:', error);
//   //     alert(`Failed to initiate payment: ${error.message}`);
//   //   }
//   // };



//   // Helper function to convert file URLs to base64
//   const fileToBase64 = async (url: string): Promise<string> => {
//     try {
//       const response = await fetch(url);
//       const blob = await response.blob();
      
//       return new Promise((resolve, reject) => {
//         const reader = new FileReader();
//         reader.onloadend = () => resolve(reader.result as string);
//         reader.onerror = reject;
//         reader.readAsDataURL(blob);
//       });
//     } catch (error) {
//       console.error('Error converting file to base64:', error);
//       throw error;
//     }
//   };

//   const handleMemorialSubmit = async (data: any) => {
//     try {
//       const token = localStorage.getItem('authToken');
      
//       // Create a copy of the data for localStorage
//       const localStorageData: any = { ...data };
      
//       // Convert main picture to base64 for localStorage
//       if (data.profileImage) {
//         localStorageData.profileImage = await fileToBase64(data.profileImage);
//       }
      
//       // Store in localStorage
//       localStorage.setItem('memorialFormData', JSON.stringify(localStorageData));
      
//       // Continue with payment
//       handleStripeCheckout();
      
//     } catch (error: any) {
//       console.error('Error creating memorial:', error);
//       alert(`Failed to create memorial: ${error.message}`);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col">
//       <div className="flex-1">
//         <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
//           <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
//             <MemorialForm onSubmit={handleMemorialSubmit} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CreateMemorial;

import React, { useState } from 'react';
import { MemorialForm } from '../components/forms/MemorialForm'; // Assuming MemorialFormData type is exported
import { useNavigate } from 'react-router-dom';

// Define the expected response structure from create-payfast-payment
interface PayFastData {
  payfastUrl: string;
  formData: { [key: string]: string }; // Object with string key-value pairs
}

const CreateMemorial: React.FC = () => {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null); // Add error state

  const submitPayFastForm = (payfastUrl: string, formData: { [key: string]: string }) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = payfastUrl;
    form.style.display = 'none'; // Hide the form

    for (const key in formData) {
      if (formData.hasOwnProperty(key)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = formData[key];
        form.appendChild(input);
      }
    }

    document.body.appendChild(form);
    form.submit();
  };

  // Renamed from handleStripeCheckout
  const initiatePayFastPayment = async () => {
    setSubmitError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      const amount = 20; // Define your amount - ideally fetch from config or backend
      const response = await fetch("https://webgrave.onrender.com/api/payments/create-payfast-payment", { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: amount,
          orderType: 'memorial_creation',
          memorialId: ''
         }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initiate PayFast payment process');
      }

      const { payfastUrl, formData }: PayFastData = await response.json(); // <-- Updated response handling

      if (!payfastUrl || !formData) {
         throw new Error('Received invalid data from payment server.');
      }

      // Use the helper function to redirect via form submission
      submitPayFastForm(payfastUrl, formData);

      // If submission starts, we don't need to set isSubmitting back to false
      // as the page will navigate away.

    } catch (error: any) {
      console.error('Error initiating PayFast payment:', error);
      setSubmitError(`Failed to start payment: ${error.message}`);
    }
  };

  // Helper function to convert file URLs (Blob URLs) to base64
  const fileToBase64 = async (url: string): Promise<string> => {
    try {
      // Check if it's already a base64 string
      if (url.startsWith('data:')) {
         return url;
      }
      // Assume it's a Blob URL or similar fetchable resource
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image for conversion: ${response.statusText}`);
      }
      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting file to base64:', error);
      throw error; // Re-throw to be caught by handleMemorialSubmit
    }
  };

  // Renamed data type for clarity
  const handleMemorialSubmit = async (data: any) => {
    setSubmitError(null);
    try {
      // Authentication check should ideally happen before showing the form,
      // but double-checking here is fine.
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      // Create a copy of the data for localStorage
      // Use 'any' for flexibility or create a specific LocalStorageMemorialData type
      const localStorageData: any = { ...data };

      // Convert main picture URL (likely a Blob URL from file input) to base64 for localStorage
      if (data.profileImage && typeof data.profileImage === 'string') {
          localStorageData.profileImage = await fileToBase64(data.profileImage);
      } else {
          // Handle cases where profileImage might not be set or not a string URL
          localStorageData.profileImage = null; // Or handle as needed
      }

      // Store the potentially large data in localStorage
      localStorage.setItem('memorialFormData', JSON.stringify(localStorageData));

      // Now, initiate the payment process
      await initiatePayFastPayment(); // Call the updated function

    } catch (error: any) {
      console.error('Error processing memorial data or initiating payment:', error);
      setSubmitError(`Failed to proceed: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1">
        <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
            {/* Pass loading and error states to the form if it can display them */}
            <MemorialForm
              onSubmit={handleMemorialSubmit}
            />
             {/* Display error message near the submit button area */}
             {submitError && (
               <p className="mt-4 text-center text-red-600">{submitError}</p>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMemorial;