import React, { useState } from 'react';
import { MemorialForm } from '../components/forms/MemorialForm';
import { useNavigate, useLocation } from 'react-router-dom';

declare const PaystackPop: any;

interface PaystackInitResponse {
    orderId: string;
    email: string;
    publicKey: string;
    amountInUSD: number;
}

interface PaystackVerifyResponse {
    success: boolean;
    message: string;
}

const CreateMemorial: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSubmitting, setIsSubmitting] = useState(false); // Added submitting state
    const [submitError, setSubmitError] = useState<string | null>(null);

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


    const handlePaymentVerification = async (paystackResponse: any, orderId: string, authToken: string | null) => {
        console.log("Initiating backend verification for memorial order:", orderId, "Ref:", paystackResponse.reference);
        if (!authToken) {
            setSubmitError("Authentication error during payment verification.");
            setIsSubmitting(false);
            return;
        }
        try {
            const verifyResponse = await fetch('https://webgrave.onrender.com/api/payments/verify-paystack', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    reference: paystackResponse.reference,
                    orderId: orderId
                })
            });

            const verifyResult: PaystackVerifyResponse = await verifyResponse.json();

            if (!verifyResponse.ok || !verifyResult.success) {
                console.error("Backend payment verification failed:", verifyResult);
                setSubmitError(verifyResult.message || 'Payment confirmation failed on our server. Please contact support.');
                setIsSubmitting(false);
            } else {
                console.log('Backend payment verification successful for memorial order:', orderId);
                navigate(`/memorial-payment/success?order_id=${orderId}`);
            }

        } catch (verificationError: any) {
            console.error("Network or other error during backend verification:", verificationError);
            if (verificationError instanceof SyntaxError) {
                setSubmitError('Failed to communicate with verification server. Please check connection or contact support.');
            } else {
                setSubmitError('An error occurred while confirming your payment. Please contact support.');
            }
            setIsSubmitting(false);
        }
    };

    const initiatePaystackPayment = async (orderDataForStorage: any) => {
        setSubmitError(null);
        setIsSubmitting(true);
        let currentToken = localStorage.getItem('authToken');

        try {
            if (!currentToken) {
                throw new Error("Authentication token not found. Please log in again.");
            }

            localStorage.setItem('memorialFormData', JSON.stringify(orderDataForStorage));
            console.log("Stored memorial form data in localStorage.");

            const amount = 20;
            const orderResponse = await fetch("https://webgrave.onrender.com/api/payments/initiate-memorial-order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${currentToken}`
                },
                body: JSON.stringify({
                    amount: amount,
                    orderType: 'memorial_creation',
                }),
            });

            if (!orderResponse.ok) {
                const errorData = await orderResponse.json();
                throw new Error(errorData.error || 'Failed to initiate payment order');
            }

            const { orderId, email, publicKey, amountInUSD }: PaystackInitResponse = await orderResponse.json();

            if (!orderId || !email || !publicKey || amountInUSD === undefined || amountInUSD <= 0) {
                throw new Error('Received invalid payment details from server.');
            }
            console.log("Backend order created:", orderId, "Amount:", amountInUSD);

            const paystackOptions = {
                key: publicKey,
                email: email,
                amount: amountInUSD,
                currency: 'ZAR',
                ref: orderId,

                callback: function (response: any) {
                    console.log('Paystack success callback triggered. Reference:', response.reference);
                    handlePaymentVerification(response, orderId, currentToken);
                },
                onClose: function () {
                    console.log('Paystack popup closed by user.');
                    setSubmitError('Payment process was cancelled.');
                    setIsSubmitting(false);
                    localStorage.removeItem('memorialFormData');
                    console.log("Removed memorial form data from localStorage due to closure.");
                }
            };

            const handler = PaystackPop.setup(paystackOptions);
            console.log("Opening Paystack iframe for memorial creation...");
            handler.openIframe();

        } catch (error: any) {
            console.error('Error initiating Paystack payment:', error);
            setSubmitError(`Failed to start payment: ${error.message}`);
            setIsSubmitting(false);
            localStorage.removeItem('memorialFormData');
            console.log("Removed memorial form data from localStorage due to error.");
        }
    };

    const handleMemorialSubmit = async (data: any) => {
        setSubmitError(null);
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                navigate('/login', { state: { from: location.pathname, message: 'Please log in to create a memorial.' } });
                setIsSubmitting(false);
                return;
            }

            // const dataForStorage: any = JSON.parse(JSON.stringify(data));
            const localStorageData: any = { ...data };
            
            if (data.profileImage && typeof data.profileImage === 'string') {
                localStorageData.profileImage = await fileToBase64(data.profileImage);
            } else {
                // Handle cases where profileImage might not be set or not a string URL
                localStorageData.profileImage = null; // Or handle as needed
            }

            await initiatePaystackPayment(localStorageData);

        } catch (error: any) {
            console.error('Error preparing memorial data or initiating payment:', error);
            setSubmitError(`Failed to proceed: ${error.message}`);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="flex-1">
                <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8"> {/* Increased max-width */}
                    <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Create a New Memorial</h1>
                    <div className="bg-white rounded-lg shadow-xl px-6 py-8 sm:px-8"> {/* Added shadow-xl */}
                        <MemorialForm
                            onSubmit={handleMemorialSubmit}
                        />
                        {/* Display submission/payment error messages */}
                        {submitError && (
                            <p className="mt-4 text-center text-sm text-red-600" role="alert">
                                {submitError}
                            </p>
                        )}
                    </div>
                </div>
            </div>
            {/* Footer or other elements if needed */}
        </div>
    );
};

export default CreateMemorial;