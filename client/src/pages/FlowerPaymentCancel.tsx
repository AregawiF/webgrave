import { Link, useSearchParams } from 'react-router-dom';
import { XCircle, Flower2 } from 'lucide-react';

const FlowerPaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const memorialId = searchParams.get('memorial_id');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-md">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mx-auto">
            <XCircle className="h-10 w-10" />
          </div>
          
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Payment Cancelled</h1>
          <p className="mt-2 text-lg text-gray-600">Your flower tribute was not processed.</p>
          
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <div className="flex items-center justify-center mb-3">
              <Flower2 className="h-6 w-6 text-gray-600 mr-2" />
              <span className="text-gray-700 font-medium">No action was taken</span>
            </div>
            <p className="text-gray-700 text-sm">
              You can try again if you wish to send a flower tribute.
            </p>
          </div>
          
          <div className="mt-8 flex flex-col space-y-3">
            {memorialId && (
              <Link 
                to={`/memorials/${memorialId}`}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors inline-block"
              >
                Return to Memorial Page
              </Link>
            )}
            
            <Link 
              to="/"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors inline-block"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowerPaymentCancel;
