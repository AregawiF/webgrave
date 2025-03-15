import { CreditCard, X } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripeCheckout from './StripeCheckout';

// Replace with your actual Stripe publishable key from environment variables
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface Props {
  amount: number;
  onComplete: (success: boolean) => void;
  onClose: () => void;
}

export function PaymentModal({ amount, onComplete, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Complete Your Memorial</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <CreditCard className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <p className="text-gray-600">
              Create a lasting digital memorial for your loved one
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              ${amount}.00
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">What's included:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Permanent digital memorial page</li>
              <li>• Custom QR code for physical memorials</li>
              <li>• Photo and video gallery</li>
              <li>• Digital flower tributes</li>
            </ul>
          </div>

          <div className="border border-gray-300 rounded-lg p-4">
            <Elements stripe={stripePromise}>
              <StripeCheckout amount={amount} onSuccess={() => onComplete(true)} onFailure={() => onComplete(false)} />
            </Elements>
          </div>

          <div className="space-y-3">
            <button
              onClick={onClose}
              className="w-full btn-secondary"
            >
              Cancel
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            By proceeding, you agree to our terms of service and privacy policy
          </p>
        </div>
      </div>
    </div>
  );
}