import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Flower2 } from 'lucide-react';

const FlowerPaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [memorialId, setMemorialId] = useState<string | null>(null);
  const [memorialName, setMemorialName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionId) {
      completeFlowerPayment(sessionId);
    } else {
      setLoading(false);
      setErrorMessage('No session ID found. Unable to verify your payment.');
    }
  }, [sessionId]);

  const completeFlowerPayment = async (sessionId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setErrorMessage('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/flowers/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId })
      });

      const data = await response.json();

      if (response.ok) {
        // If we have memorial info in the response, save it
        if (data.tribute && data.tribute.memorialId) {
          setMemorialId(data.tribute.memorialId);
        }
        
        // Try to get memorial name if available
        if (data.memorialName) {
          setMemorialName(data.memorialName);
        }
      } else {
        // Use a generic user-friendly error message instead of showing technical details
        console.error('Payment verification error:', data.error || 'Unknown error');
        setErrorMessage('We couldn\'t verify your payment. Please contact support if this issue persists.');
      }
    } catch (err: any) {
      // Log the actual error but show a generic message to the user
      console.error('Payment completion error:', err);
      setErrorMessage('An unexpected error occurred. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
                Return to {memorialName || 'Memorial'} Page
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
