import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link, useLocation } from 'react-router-dom'; // Added Link
import { CheckCircle, Loader, AlertCircle } from 'lucide-react'; // Import icons

const mapDisasterTypeToBackend = (disasterType: string): string => {
    const mapping: { [key: string]: string } = {
        'war': 'war_conflict',
        'natural': 'natural_disaster',
        'pandemic': 'pandemic_disease',
        'accident': 'major_accident'
    };
    return mapping[disasterType] || 'not_related';
};

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
        throw new Error("Failed to convert image data.");
    }
};


const PaymentSuccess: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();

    const orderId = searchParams.get('order_id'); // Get order_id from Paystack flow

    // Simplified Status State
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [newMemorialId, setNewMemorialId] = useState<string | null>(null); // To link to the created memorial

    useEffect(() => {
        console.log("PaymentSuccess mounted. Order ID:", orderId);

        const finalizeMemorialCreation = async () => {
            setStatus('processing');
            setErrorMessage(null);

            if (!orderId) {
                setErrorMessage('Payment identifier (Order ID) not found in URL.');
                setStatus('error');
                console.error("Missing order_id in URL query parameters.");
                return;
            }

            const token = localStorage.getItem('authToken');
            if (!token) {
                setErrorMessage('Authentication error. Please log in to complete the process.');
                setStatus('error');
                return;
            }

            const storedMemorialData = localStorage.getItem('memorialFormData');
            if (!storedMemorialData) {
                setErrorMessage('Temporary memorial data was not found. The creation process cannot be completed. Please try creating the memorial again or contact support.');
                setStatus('error');
                console.error("localStorage item 'memorialFormData' not found.");
                return;
            }

            try {
                const memorialData = JSON.parse(storedMemorialData);
                console.log("Retrieved memorial data:", memorialData);
                const formData = new FormData();

                // Convert base64 profile image back to Blob
                if (memorialData.profileImage && typeof memorialData.profileImage === 'string' && memorialData.profileImage.startsWith('data:')) {
                    try {
                        console.log("Converting profile image...");
                        const profileImageBlob = base64ToBlob(memorialData.profileImage);
                        const filename = `profile_${memorialData.name?.replace(/\s+/g, '_') || orderId}.jpg`; // Example filename
                        formData.append('mainPicture', profileImageBlob, filename);
                        console.log("Appended profile image.");
                    } catch (blobError: any) {
                        console.error("Failed to process stored image data:", blobError);
                        throw new Error(`Failed to process stored image data: ${blobError.message}`);
                    }
                } else {
                    console.log("No profile image data found in storage or not in expected format.");
                }



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
                formData.append('orderId', orderId); // Add orderId to the request
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

                console.log("Attempting to create memorial via API...");
                const createResponse = await fetch('http://localhost:5000/api/memorials', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                if (!createResponse.ok) {
                    let errorData;
                    try {
                        errorData = await createResponse.json();
                    } catch (jsonError) {
                        errorData = { message: `Server error (${createResponse.status}). Please contact support.` };
                    }
                    
                    console.error("API Error - Failed to create memorial:", errorData);
                    throw new Error(errorData.message || `Failed to save memorial details (Code: ${createResponse.status}).`);
                }

                const newMemorial = await createResponse.json();
                console.log("Memorial created successfully:", newMemorial);

                // If the memorial already exists, redirect to it
                if (newMemorial.message === 'Memorial already exists for this order') {
                    navigate(`/memorial/${newMemorial.memorialId}`);
                    return;
                }

                // --- Success ---
                setNewMemorialId(newMemorial._id);
                setStatus('success');

                // Clean up localStorage *only* on full success
                localStorage.removeItem('memorialFormData');
                console.log("Removed memorial form data from localStorage.");

            } catch (error: any) {
                console.error('Error during memorial finalization:', error);
                setErrorMessage(error.message || 'An unexpected error occurred while creating the memorial.');
                setStatus('error');
            }
        };

        finalizeMemorialCreation();

    }, [orderId, navigate]); // Depend on orderId and navigate

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
                {status === 'processing' && (
                    <>
                        <Loader className="h-16 w-16 text-indigo-500 mx-auto animate-spin mb-6" />
                        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Finalizing Memorial Creation</h1>
                        <p className="text-gray-600">Your payment was successful! Please wait while we save the memorial details...</p>
                    </>
                )}

                {status === 'success' && newMemorialId && (
                    <>
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Memorial Created Successfully!</h1>
                        <p className="text-gray-700 mb-6">
                            The memorial page has been set up based on the information you provided.
                        </p>
                        <button
                            onClick={() => navigate(`/memorial/${newMemorialId}`)} 
                            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium"
                        >
                            View Memorial
                        </button>
                        <Link to="/" className="block mt-4 text-sm text-gray-600 hover:text-indigo-600">
                            Go to Homepage
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
                        <h1 className="text-2xl font-semibold text-red-700 mb-2">Error Finalizing Memorial</h1>
                        <p className="text-gray-700 mb-6">
                            {errorMessage || 'An unexpected error occurred.'}
                        </p>
                        <p className="text-sm text-gray-500 mb-6">
                            Your payment was likely successful, but we encountered an issue saving the memorial details. The data might still be saved locally. Please contact support with Order ID: {orderId || 'N/A'}.
                        </p>
                        <Link to="/" className="block mt-4 text-sm text-gray-600 hover:text-indigo-600">
                            Go to Homepage
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess; 