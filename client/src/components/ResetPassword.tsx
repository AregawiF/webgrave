import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import logo from "../assets/webgrave-logo.png";

interface LocationState {
  userId: string;
  email: string;
}

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, email } = location.state as LocationState;

  const [formData, setFormData] = useState({
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(3);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);

  useEffect(() => {
    let blockTimer: NodeJS.Timeout;
    if (blockTimeRemaining > 0) {
      blockTimer = setInterval(() => {
        setBlockTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (isBlocked) {
      setIsBlocked(false);
    }
    return () => clearInterval(blockTimer);
  }, [blockTimeRemaining, isBlocked]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://webgrave.onrender.com/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          otp: formData.otp,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.tooManyAttempts) {
          setIsBlocked(true);
          setBlockTimeRemaining(15 * 60); // 15 minutes in seconds
          throw new Error('Too many failed attempts. Please try again later.');
        }
        setRemainingAttempts(data.remainingAttempts || remainingAttempts - 1);
        throw new Error(data.message || 'Failed to reset password');
      }

      // Redirect to login with success message
      navigate('/login', {
        state: {
          message: 'Password has been reset successfully. Please login with your new password.',
          email
        }
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="bg-white shadow-2xl rounded-2xl p-10 max-w-lg w-full transform transition-all hover:scale-105 duration-300">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={logo} alt="WebGrave Logo" className="w-20 h-20 object-contain" />
        </div>

        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Reset Your Password</h2>

        <p className="text-center text-gray-600 mb-8">
          Enter the verification code sent to <span className="font-semibold">{email}</span>
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
            <svg className="w-6 h-6 mr-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Attempts Remaining */}
        {!isBlocked && remainingAttempts > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg">
            <p className="text-center">
              {remainingAttempts} {remainingAttempts === 1 ? 'attempt' : 'attempts'} remaining
            </p>
          </div>
        )}

        {/* Blocked Message */}
        {isBlocked && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <p className="text-center">
              Too many failed attempts. Please try again in {formatTime(blockTimeRemaining)}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="otp" className="block text-gray-700 font-medium mb-2">Verification Code</label>
            <input
              id="otp"
              type="text"
              name="otp"
              value={formData.otp}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              placeholder="Enter 6-digit code"
              maxLength={6}
              disabled={isBlocked || isLoading}
              required
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-gray-700 font-medium mb-2">New Password</label>
            <input
              id="newPassword"
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              placeholder="Enter new password"
              disabled={isBlocked || isLoading}
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              placeholder="Confirm new password"
              disabled={isBlocked || isLoading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isBlocked || isLoading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50"
          >
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-primary-600 hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 