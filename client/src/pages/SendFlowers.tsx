import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, DollarSign, MessageCircle, Send } from 'lucide-react';

interface Memorial {
  _id: string;
  deceased: {
    firstName: string;
    lastName: string;
  };
}

interface FlowerTribute {
  amount: number;
  memorialId: string;
  message?: string;
}

const SendFlowers: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [memorial, setMemorial] = useState<Memorial | null>(null);
  const [tribute, setTribute] = useState<FlowerTribute>({
    amount: 10,
    memorialId: id || '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMemorialDetails = async () => {
      try {
        const response = await fetch(`https://webgrave.onrender.com/api/memorials/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch memorial details');
        }

        const data = await response.json();
        setMemorial(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemorialDetails();
  }, [id]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = parseInt(e.target.value, 10);
    setTribute(prev => ({ ...prev, amount }));
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTribute(prev => ({ ...prev, message: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Please log in to send flowers');
      }

      // Store tribute data in localStorage for use after payment
      localStorage.setItem('flowerTributeData', JSON.stringify(tribute));

      // Initiate PayFast payment
      const response = await fetch('https://webgrave.onrender.com/api/payments/create-payfast-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: tribute.amount,
          orderType: 'flower_tribute',
          memorialId: id
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to initiate payment');
      }

      const { payfastUrl, formData } = await response.json();

      // Create and submit the PayFast form
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = payfastUrl;

      Object.entries(formData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value as string;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing payment');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-red-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-red-500">{error}</p>
          <button 
            onClick={() => navigate('/find-memorials')} 
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg"
          >
            Back to Memorials
          </button>
        </div>
      </div>
    );
  }

  if (!memorial) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-xl p-8">
        <div className="flex items-center justify-center mb-8">
          <Heart className="h-12 w-12 text-primary-600 mr-4" />
          <h1 className="text-3xl font-bold text-gray-900">
            Send Flowers to {memorial.deceased.firstName} {memorial.deceased.lastName}'s Memorial
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <DollarSign className="mr-2 h-5 w-5 text-gray-500" /> Tribute Amount
            </label>
            <div className="flex items-center">
              <input
                type="number"
                id="amount"
                name="amount"
                min="1"
                max="500"
                value={tribute.amount}
                onChange={handleAmountChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                required
              />
              <span className="ml-2 text-gray-600">USD</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Your tribute helps support the memorial and honor the memory of {memorial.deceased.firstName}.
            </p>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <MessageCircle className="mr-2 h-5 w-5 text-gray-500" /> Tribute Message (Optional)
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              value={tribute.message}
              onChange={handleMessageChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              placeholder="Share a heartfelt message to honor their memory..."
            />
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => navigate(`/memorial/${id}`)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              <Send className="mr-2 h-5 w-5" /> Send Flowers
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendFlowers;
