import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Flower2 } from 'lucide-react';

const FlowerPaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [isProcessing, setIsProcessing] = useState(true);
  const [memorialId, setMemorialId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 5;
  const RETRY_DELAY = 2000; // 2 seconds
  const navigate = useNavigate();

  const verifyPaymentAndCreateTribute = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      if (!orderId) {
        throw new Error('No order ID found in URL');
      }

      console.log('Payment verified successfully. Processing flower tribute.');

      // Get flower tribute data from localStorage
      const storedTributeData = localStorage.getItem('flowerTributeData');

      if (!storedTributeData) {
        console.error('No tribute data found in localStorage');
        throw new Error('Flower tribute data not found after successful payment. Please contact support.');
      }

      const tributeData = JSON.parse(storedTributeData);
      setMemorialId(tributeData.memorialId);

      // Create the flower tribute
      const tributeResponse = await fetch(`https://webgrave.onrender.com/api/flowers/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          memorialId: tributeData.memorialId,
          amount: tributeData.amount,
          message: tributeData.message,
        })
      });

      if (!tributeResponse.ok) {
        const errorData = await tributeResponse.json();
        console.error('Payment successful, but failed to create tribute:', errorData);
        throw new Error(errorData.message || 'Payment succeeded, but failed to save tribute details. Please contact support.');
      }

      const tribute = await tributeResponse.json();
      console.log('Flower tribute created successfully:', tribute);

      // Clean up localStorage
      localStorage.removeItem('flowerTributeData');

      setIsProcessing(false);
      setErrorMessage(null);
      navigate(`/memorial/${tributeData.memorialId}`);


    } catch (err) {
      console.error('Error processing flower tribute:', err);
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred');
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    verifyPaymentAndCreateTribute();
  }, []);

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-md">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-500 mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="mt-4 text-xl font-semibold text-gray-900">Payment Verification Failed</h1>
            <p className="mt-2 text-gray-600">{errorMessage}</p>
            <div className="mt-6">
              <Link to="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-800">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-md">
          <div className="text-center">
            <Flower2 className="h-12 w-12 text-indigo-500 mx-auto animate-pulse" />
            <h1 className="mt-4 text-xl font-semibold text-gray-900">Processing Your Flower Tribute</h1>
            <p className="mt-2 text-gray-600">Please wait while we verify your payment...</p>
            <div className="mt-6 flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-md">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-500 mx-auto">
            <CheckCircle className="h-10 w-10" />
          </div>

          <h1 className="mt-4 text-2xl font-bold text-gray-900">Thank You!</h1>
          <p className="mt-2 text-lg text-gray-600">Your flower tribute has been sent successfully.</p>

          <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
            <div className="flex items-center justify-center mb-3">
              <Flower2 className="h-6 w-6 text-indigo-600 mr-2" />
              <span className="text-indigo-700 font-medium">Your gesture means a lot</span>
            </div>
            <p className="text-indigo-700 text-sm">
              Your tribute has been recorded and will appear on the memorial page.
            </p>
          </div>

          <div className="mt-8 flex flex-col space-y-3">
            {memorialId && (
              <button
                onClick={() => navigate(`/memorial/${memorialId}`)}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Return to Memorial Page
              </button>
            )}

            <Link
              to="/"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowerPaymentSuccess;
