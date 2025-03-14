import { useState, useEffect } from 'react';
import {
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

interface StripeCheckoutProps {
  amount: number;
  onSuccess: () => void;
  onFailure: () => void;
}

const StripeCheckout = ({ amount, onSuccess, onFailure }: StripeCheckoutProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false); // Add a ready state


  useEffect(() => {
    if (stripe && elements) {
        setIsReady(true);
    }
  }, [stripe, elements]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Create a payment intent on the server
      const response = await fetch('http://localhost:5000/api/payment/create-stripe-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: 'usd',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json(); // Attempt to get error details
        throw new Error(errorData.message || 'Failed to create payment intent');
      }

      const { clientSecret } = await response.json();

      // Confirm the payment with the card element
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            // You can collect more billing details if needed (name, address, etc.)
          },
        },
      });

      if (error) {
        throw new Error(error.message || 'Payment failed');
      } else if (paymentIntent.status === 'succeeded') {
        // Payment succeeded
        onSuccess();
      } else {
        console.log('Payment status:', paymentIntent.status);
        onFailure();
        // throw new Error(`Payment status: ${paymentIntent.status}`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <div className="mt-4">
      <h2 className="text-lg font-medium mb-4">Pay with Card</h2>
      <form onSubmit={handleSubmit}>
        <div className="border border-gray-300 rounded-md p-4 mb-4">
          {/* Conditionally render the CardElement */}
          {isReady && <CardElement options={cardElementOptions} />}
        </div>

        {errorMessage && (
          <div className="text-red-500 text-sm mb-4">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || isLoading}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : `Pay $${amount}.00`}
        </button>
      </form>
    </div>
  );
};

export default StripeCheckout;