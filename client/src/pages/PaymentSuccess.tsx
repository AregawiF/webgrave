import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'; // Import useLocation if not already

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation(); // Needed for getting the full search string robustly

  // --- Updated to read 'order_id' from PayFast return URL ---
  const orderId = searchParams.get('order_id');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 5;
  const RETRY_DELAY = 3000; // Increased delay slightly for ITN

  // Convert base64 string back to Blob for file upload
  const base64ToBlob = (base64String: string, sliceSize = 512): Blob => {
    try {
        // Ensure the base64 string has the prefix
        let base64Data = base64String;
        let contentType = '';
        if (base64String.includes(';base64,')) {
            const parts = base64String.split(';base64,');
            contentType = parts[0].split(':')[1] || ''; // Handle case with no content type
            base64Data = parts[1];
        } else {
            console.warn("Base64 string did not contain expected data URI prefix. Assuming default content type.");
            // Attempt to guess content type or default (e.g., 'application/octet-stream')
             if (base64Data.charAt(0) === '/') contentType = 'image/jpeg';
             else if (base64Data.charAt(0) === 'i') contentType = 'image/png';
             // Add more checks or a default
             else contentType = 'application/octet-stream';
        }


      const byteCharacters = window.atob(base64Data);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }

      return new Blob(byteArrays, { type: contentType });

    } catch (error) {
        console.error("Error decoding base64 string:", error);
        // Return a dummy/empty blob or throw error, depending on desired handling
        throw new Error("Failed to convert image data.");
    }
  };


  const verifyPaymentAndCreateMemorial = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        // Redirect to login or show appropriate message
        setErrorMessage('Authentication error. Please log in and try again.');
        setIsProcessing(false);
        // Optionally navigate('/login');
        return; // Stop execution
      }

      // --- Updated check for orderId ---
      if (!orderId) {
        throw new Error('Payment identifier (order ID) not found in URL. Cannot verify payment.');
      }
      // --- End Update ---

      console.log(`Verifying payment for order ID: ${orderId}`); // Debug log

      // --- Updated fetch call for verification ---
      const verifyResponse = await fetch('https://webgrave.onrender.com/api/payments/verify-payment', { // <-- Corrected endpoint name potentially
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId: orderId }) // <-- Send orderId instead of checkoutId
      });
      // --- End Update ---

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
         // Don't retry immediately on explicit failure from backend, unless it's a server error (5xx)
         if (verifyResponse.status < 500 && verifyData.status !== 'pending' && verifyData.status !== 'unpaid') {
            throw new Error(verifyData.message || 'Payment verification failed.');
         }
         // Handle potentially pending status or server errors with retry
         console.warn(`Verification attempt ${retryCount + 1} failed or pending: ${verifyData.message || verifyResponse.statusText}`);
         // Proceed to retry logic below if applicable
      }

      if (verifyData.success && verifyData.status === 'paid') {
        console.log('Payment verified successfully. Proceeding to create memorial.');
        // Get memorial data from localStorage
        const storedMemorialData = localStorage.getItem('memorialFormData');

        if (!storedMemorialData) {
          // This is a critical error state - payment succeeded but data lost
          throw new Error('Memorial data not found after successful payment. Please contact support.');
        }

        const memorialData = JSON.parse(storedMemorialData);
        const formData = new FormData();

        // Convert base64 profile image back to Blob
        if (memorialData.profileImage && typeof memorialData.profileImage === 'string') {
            try {
                const profileImageBlob = base64ToBlob(memorialData.profileImage);
                // Determine a filename (can be generic or based on user/memorial name if available)
                const filename = `profile_${memorialData.name?.replace(/\s+/g, '_') || Date.now()}.jpg`; // Example filename
                formData.append('mainPicture', profileImageBlob, filename);
            } catch (blobError) {
                 console.error("Failed to process stored image data:", blobError);
                 // Decide how to proceed: continue without image or throw error?
                 // For now, we'll log and continue without the image.
                 // throw new Error("Failed to process stored image data.");
            }
        }

        // --- Append other memorial data (same as before) ---
        formData.append('fullName', memorialData.name || 'N/A');
        formData.append('birthDate', memorialData.birthDate || ''); // Ensure dates are valid strings
        formData.append('placeOfBirth', memorialData.birthPlace || '');
        formData.append('deathDate', memorialData.deathDate || ''); // Ensure dates are valid strings
        formData.append('biography', memorialData.description || '');
        if (memorialData.serviceDate) formData.append('serviceDate', memorialData.serviceDate);
        if (memorialData.serviceLocation) formData.append('serviceLocation', memorialData.serviceLocation);
        if (memorialData.serviceDetails) formData.append('serviceDetails', memorialData.serviceDetails);
        formData.append('identityType', memorialData.identityType || 'national_id');
        formData.append('identityNumber', memorialData.identityNumber || '00000000');
        formData.append('nationality', memorialData.nationality || 'Unknown');
        if (memorialData.nickname) formData.append('nickName', memorialData.nickname);
        if (memorialData.maidenName) formData.append('maidenName', memorialData.maidenName);
        if (memorialData.religion) formData.append('religion', memorialData.religion);
        if (memorialData.favoriteQuote) formData.append('favoriteQuote', memorialData.favoriteQuote);
        formData.append('birthdayReminder', String(memorialData.enableBirthDateReminder || false));
        formData.append('militaryService', String(!!memorialData.militaryService));
        formData.append('enableDigitalFlowers', String(memorialData.enableDigitalFlowers || false));
        formData.append('isPublic', String(memorialData.isPublic ?? true)); // Default to public if undefined
        if (memorialData.languages && Array.isArray(memorialData.languages) && memorialData.languages.length) {
          formData.append('languagesSpoken', JSON.stringify(memorialData.languages));
        } else {
          formData.append('languagesSpoken', JSON.stringify([])); // Send empty array if not present/valid
        }
        if (memorialData.education && Array.isArray(memorialData.education) && memorialData.education.length) {
          formData.append('education', JSON.stringify(memorialData.education));
         } else {
          formData.append('education', JSON.stringify([]));
         }
        if (memorialData.familyMembers && Array.isArray(memorialData.familyMembers) && memorialData.familyMembers.length) {
          formData.append('familyMembers', JSON.stringify(memorialData.familyMembers));
        } else {
           formData.append('familyMembers', JSON.stringify([]));
        }
        const causeOfDeath = {
          primaryCause: memorialData.causeOfDeath || 'Unknown',
          majorEvent: memorialData.disasterType ? mapDisasterTypeToBackend(memorialData.disasterType) : 'not_related'
        };
        formData.append('causeOfDeath', JSON.stringify(causeOfDeath));
        // --- End appending other memorial data ---


        // Make the request to create the memorial
        const createResponse = await fetch('https://webgrave.onrender.com/api/memorials', {
          method: 'POST',
          headers: {
            // Content-Type is set automatically by browser for FormData
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!createResponse.ok) {
          const errorData = await createResponse.json();
          // Even if memorial creation fails, payment was successful. Log appropriately.
          console.error("Payment successful, but failed to create memorial:", errorData);
          throw new Error(errorData.message || 'Payment succeeded, but failed to save memorial details. Please contact support.');
        }

        const memorial = await createResponse.json();
        console.log("Memorial created successfully:", memorial);

        // Clean up localStorage *only* after successful memorial creation
        localStorage.removeItem('memorialFormData');

        setIsProcessing(false);
        setErrorMessage(null); // Clear any previous transient errors
        // Navigate to the next step, passing the new memorial's ID
        navigate(`/add-memorial-media/${memorial._id}`); // Adjust if memorial data structure is different

      } else {
        // Handle non-successful verification (e.g., status is 'failed', 'pending', 'unpaid', or verifyData.success is false)
        if (retryCount < MAX_RETRIES) {
          console.log(`Payment status is '${verifyData.status || 'unknown'}'. Retrying verification (${retryCount + 1}/${MAX_RETRIES})...`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            verifyPaymentAndCreateMemorial(); // Retry the combined function
          }, RETRY_DELAY * (retryCount + 1)); // Optional: Exponential backoff
        } else {
          console.error('Payment verification timed out or failed after multiple retries. Final Status:', verifyData.status);
          throw new Error(verifyData.message || 'Payment could not be confirmed after several attempts. Please check your PayFast account or contact support.');
        }
      }
    } catch (error: any) {
      console.error('Error during payment verification or memorial creation:', error);
      setErrorMessage(error.message || 'An unexpected error occurred.');
      setIsProcessing(false);
       // Clean up localStorage only if the error is *not* related to lost data before creation attempt
      if (!error.message.includes('Memorial data not found')) {
          // Keep data if creation failed, user might want to retry later (manual process needed)
          // localStorage.removeItem('memorialFormData'); // Consider *not* removing on failure
      }
    }
  }

  useEffect(() => {
    console.log("PaymentSuccess mounted. Location search:", location.search); // Debug log
    // Initiate the process when the component mounts
    verifyPaymentAndCreateMemorial();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Helper function (keep as is)
  const mapDisasterTypeToBackend = (disasterType: string): string => {
    const mapping: { [key: string]: string } = {
      'war': 'war_conflict',
      'natural': 'natural_disaster',
      'pandemic': 'pandemic_disease',
      'accident': 'major_accident'
    };
    return mapping[disasterType] || 'not_related';
  };


  // --- UI Rendering (mostly unchanged, shows processing or error) ---
   if (errorMessage) {
    return (
      <div className='text-center mt-16 p-4'>
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 border border-red-200">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Process Incomplete</h1>
          <p className="text-gray-700 mb-4">{errorMessage}</p>
          {/* Provide relevant actions based on the error */}
          <button
            onClick={() => navigate('/my-memorials')} // Or navigate to contact page
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
          >
            Go to My Memorials
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='text-center mt-16 p-4'>
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        {isProcessing ? (
           <>
            <h1 className='text-2xl font-bold mb-4'>Processing Your Request...</h1>
            <p className="mb-4 text-gray-600">Verifying payment and creating your memorial. Please wait...</p>
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            {retryCount > 0 && <p className="text-sm text-gray-500">Verification attempt {retryCount + 1}...</p>}
          </>
        ) : (
          // This state might only flash briefly before navigation, or not be shown if navigation is immediate
          <>
            <h1 className='text-2xl font-bold text-green-600 mb-4'>Success!</h1>
            <p className="text-gray-700 mb-4">Payment confirmed and memorial created. Redirecting...</p>
             {/* You could show a success checkmark here */}
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;



// import { useEffect, useState } from 'react';
// import { useNavigate, useSearchParams } from 'react-router-dom';

// const PaymentSuccess = () => {
//   const [searchParams] = useSearchParams();
//   const checkoutId = searchParams.get('session_id')?.replace('{CHECKOUT_SESSION_ID}', '');

//   const navigate = useNavigate();
//   const [errorMessage, setErrorMessage] = useState<string | null>(null);
//   const [isProcessing, setIsProcessing] = useState(true);
//   const [retryCount, setRetryCount] = useState(0);
//   const MAX_RETRIES = 5;
//   const RETRY_DELAY = 2000; // 2 sec

//   // Convert base64 string to Blob for file upload
//   const base64ToBlob = async (base64String: string): Promise<Blob> => {
//     // Extract the base64 data part (remove data:image/jpeg;base64, etc.)
//     const parts = base64String.split(';base64,');
//     const contentType = parts[0].split(':')[1];
//     const raw = window.atob(parts[1]);
//     const rawLength = raw.length;
//     const uInt8Array = new Uint8Array(rawLength);

//     for (let i = 0; i < rawLength; ++i) {
//       uInt8Array[i] = raw.charCodeAt(i);
//     }

//     return new Blob([uInt8Array], { type: contentType });
//   };


//   const verifyPayment = async () => {
//     try {
//       const token = localStorage.getItem('authToken');
//       if (!token) {
//         throw new Error('Authentication token not found');
//       }

//       if (!checkoutId) {
//         throw new Error('No checkout ID found in URL');
//       }

//       const response = await fetch('https://webgrave.onrender.com/api/payment/verifyPayment', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify({ checkoutId }) 
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || 'Failed to verify payment');
//       }

//       if (data.success) {
//         // Get memorial data from localStorage
//         const storedMemorialData = localStorage.getItem('memorialFormData');

//         if (!storedMemorialData) {
//           throw new Error('No memorial data found in localStorage.');
//         }

//         const memorialData = JSON.parse(storedMemorialData);
//         const formData = new FormData();

//         // Convert base64 profile image to Blob
//         if (memorialData.profileImage) {
//           const profileImageBlob = await base64ToBlob(memorialData.profileImage);
//           formData.append('mainPicture', profileImageBlob, 'profile.jpg');
//         }

//         // Add basic memorial information
//         formData.append('fullName', memorialData.name);
//         formData.append('birthDate', memorialData.birthDate);
//         formData.append('placeOfBirth', memorialData.birthPlace);
//         formData.append('deathDate', memorialData.deathDate);
//         formData.append('biography', memorialData.description);

//         // Service information
//         if (memorialData.serviceDate) formData.append('serviceDate', memorialData.serviceDate);
//         if (memorialData.serviceLocation) formData.append('serviceLocation', memorialData.serviceLocation);
//         if (memorialData.serviceDetails) formData.append('serviceDetails', memorialData.serviceDetails);

//         // Identity information
//         formData.append('identityType', memorialData.identityType || 'national_id');
//         formData.append('identityNumber', memorialData.identityNumber || '00000000');
//         formData.append('nationality', memorialData.nationality || 'Unknown');

//         // Optional fields
//         if (memorialData.nickname) formData.append('nickName', memorialData.nickname);
//         if (memorialData.maidenName) formData.append('maidenName', memorialData.maidenName);
//         if (memorialData.religion) formData.append('religion', memorialData.religion);
//         if (memorialData.favoriteQuote) formData.append('favoriteQuote', memorialData.favoriteQuote);

//         // Boolean fields
//         formData.append('birthdayReminder', String(memorialData.enableBirthDateReminder));
//         formData.append('militaryService', String(!!memorialData.militaryService));
//         formData.append('enableDigitalFlowers', String(memorialData.enableDigitalFlowers));
//         formData.append('isPublic', String(memorialData.isPublic));

//         // Array fields - must be stringified for backend
//         if (memorialData.languages && memorialData.languages.length) {
//           formData.append('languagesSpoken', JSON.stringify(memorialData.languages));
//         }

//         // Education - must be stringified arrays of objects
//         if (memorialData.education && memorialData.education.length) {
//           formData.append('education', JSON.stringify(memorialData.education));
//         }

//         // Family members - must be stringified arrays of objects
//         if (memorialData.familyMembers && memorialData.familyMembers.length) {
//           formData.append('familyMembers', JSON.stringify(memorialData.familyMembers));
//         }

//         // Cause of death - must be structured as an object
//         const causeOfDeath = {
//           primaryCause: memorialData.causeOfDeath,
//           majorEvent: memorialData.disasterType ? mapDisasterTypeToBackend(memorialData.disasterType) : 'not_related'
//         };
//         formData.append('causeOfDeath', JSON.stringify(causeOfDeath));

//         // Make the request to create the memorial
//         const createResponse = await fetch('https://webgrave.onrender.com/api/memorials', {
//           method: 'POST',
//           headers: {
//             'Authorization': `Bearer ${token}`
//           },
//           body: formData
//         });

//         if (!createResponse.ok) {
//           const errorData = await createResponse.json();
//           throw new Error(errorData.message || 'Failed to create memorial');
//         }

//         const memorial = await createResponse.json();

//         setIsProcessing(false);
//         navigate(`/add-memorial-media/${memorial._id}`);
//       } else {
//         if (retryCount < MAX_RETRIES) {
//           setTimeout(() => {
//             setRetryCount(prev => prev + 1);
//             verifyPayment();
//           }, RETRY_DELAY);
//         } else {
//           setErrorMessage('Payment was not successful. Please try again.');
//           console.log(data.message);
//           throw new Error('Payment verification timeout. Please contact support.');
//         }
        
//       }
//     } catch (error: any) {
//       console.error('Error verifying payment and creating memorial:', error);
//       setErrorMessage(error.message || 'An error occurred during payment verification.');
//       setIsProcessing(false);
//     }
//   }

//   useEffect(() => {
//     verifyPayment();

//   }, []);

//   // Helper function to map frontend disaster types to backend enum values
//   const mapDisasterTypeToBackend = (disasterType: string): string => {
//     const mapping: { [key: string]: string } = {
//       'war': 'war_conflict',
//       'natural': 'natural_disaster',
//       'pandemic': 'pandemic_disease',
//       'accident': 'major_accident'
//     };
//     return mapping[disasterType] || 'not_related';
//   };

//   if (errorMessage) {
//     return (
//       <div className='text-center mt-16 p-4'>
//         <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
//           <h1 className="text-2xl font-bold text-red-600 mb-4">Payment Verification Failed</h1>
//           <p className="text-gray-700 mb-4">{errorMessage}</p>
//           <button
//             onClick={() => navigate('/my-memorials')}
//             className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
//           >
//             View My Memorials
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className='text-center mt-16 p-4'>
//       <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
//         <h1 className='text-2xl font-bold mb-4'>{isProcessing ? 'Processing Payment...' : 'Payment Successful'}</h1>
//         {isProcessing ? (
//           <div>
//             <p className="mb-4">Please wait, you will be redirected shortly.</p>
//             <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
//           </div>
//         ) : (
//           <div>
//             <p className="text-green-600 mb-4">Your memorial has been created successfully!</p>
//             <button
//               onClick={() => navigate('/my-memorials')}
//               className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
//             >
//               View My Memorials
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PaymentSuccess;