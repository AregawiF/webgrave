import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/webgrave-logo.png";
import { Eye, EyeOff, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';

interface SignupProps {
  onSignupSuccess: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSignupSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'info' | 'otp'>('info');
  const [userId, setUserId] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState(3);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);

  // Password validation criteria
  const passwordValidations = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.querySelector(`input[name=otp-${index + 1}]`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.querySelector(`input[name=otp-${index - 1}]`) as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validate inputs
    if (!formData.firstName || !formData.lastName) {
      setError("First and last names are required");
      setIsLoading(false);
      return;
    }

    if (!validateEmail(formData.email)) {
      setError("Invalid email format");
      setIsLoading(false);
      return;
    }

    // Check password validation
    const allValidationsPassed = Object.values(passwordValidations).every(Boolean);
    if (!allValidationsPassed) {
      setError("Password does not meet complexity requirements");
      setIsLoading(false);
      return;
    }

    // Check password match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('https://webgrave.onrender.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message === 'User already exists') {
          setError('This email is already registered. Please login or use a different email.');
          setIsLoading(false);
          return;
        }
        throw new Error(errorData.message || 'Failed to register');
      }

      const data = await response.json();
      setUserId(data.userId);
      setStep('otp');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError("Please enter the complete verification code");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('https://webgrave.onrender.com/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          otp: otpString,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429) {
          setIsBlocked(true);
          setBlockTimeRemaining(errorData.remainingTime);
          setError(`Too many failed attempts. Please try again in ${Math.ceil(errorData.remainingTime / 60)} minutes.`);
        } else {
          setRemainingAttempts(errorData.remainingAttempts);
          setError(errorData.message);
        }
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      
      // Store auth data
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('tokenExpiresAt', (new Date().getTime() + 24 * 60 * 60 * 1000).toString());
      localStorage.setItem('user', JSON.stringify(data.user));

      onSignupSuccess();
      navigate('/find-memorials');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to verify OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch('https://webgrave.onrender.com/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429) {
          setResendCooldown(errorData.remainingTime);
        }
        throw new Error(errorData.message || 'Failed to resend OTP');
      }

      const data = await response.json();
      setResendCooldown(10); // 10 seconds cooldown
      setError(""); // Clear any previous errors
      
      // Start cooldown timer
      const timer = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // Start block timer if blocked
  React.useEffect(() => {
    if (isBlocked && blockTimeRemaining > 0) {
      const timer = setInterval(() => {
        setBlockTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsBlocked(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isBlocked, blockTimeRemaining]);

  const renderInfoStep = () => (
    <form onSubmit={handleRegister} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-gray-700 font-medium mb-2">First Name</label>
          <input
            id="firstName"
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
            placeholder="First name"
            required
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-gray-700 font-medium mb-2">Last Name</label>
          <input
            id="lastName"
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
            placeholder="Last name"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email Address</label>
        <input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
          placeholder="Enter your email"
          required
        />
      </div>

      <div className="relative">
        <label htmlFor="password" className="block text-gray-700 font-medium mb-2">Password</label>
        <input
          id="password"
          type={showPassword ? "text" : "password"}
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
          placeholder="Create a password"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-11 transform -translate-y-1/2 text-gray-500 hover:text-primary-600"
        >
          {showPassword ? <EyeOff size={25} className="translate-y-1/2"/> : <Eye size={25} className="translate-y-1/2"/>}
        </button>
      </div>

      {/* Password Validation */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center">
          {passwordValidations.length ? <CheckCircle2 className="text-green-500 mr-2" size={16} /> : <XCircle className="text-red-500 mr-2" size={16} />}
          At least 8 characters
        </div>
        <div className="flex items-center">
          {passwordValidations.uppercase ? <CheckCircle2 className="text-green-500 mr-2" size={16} /> : <XCircle className="text-red-500 mr-2" size={16} />}
          One uppercase letter
        </div>
        <div className="flex items-center">
          {passwordValidations.lowercase ? <CheckCircle2 className="text-green-500 mr-2" size={16} /> : <XCircle className="text-red-500 mr-2" size={16} />}
          One lowercase letter
        </div>
        <div className="flex items-center">
          {passwordValidations.number ? <CheckCircle2 className="text-green-500 mr-2" size={16} /> : <XCircle className="text-red-500 mr-2" size={16} />}
          One number
        </div>
        <div className="flex items-center col-span-2">
          {passwordValidations.specialChar ? <CheckCircle2 className="text-green-500 mr-2" size={16} /> : <XCircle className="text-red-500 mr-2" size={16} />}
          One special character
        </div>
      </div>

      <div className="relative">
        <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">Confirm Password</label>
        <input
          id="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
          placeholder="Confirm your password"
          required
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-11 transform -translate-y-1/2 text-gray-500 hover:text-primary-600"
        >
          {showConfirmPassword ? <EyeOff size={25} className="translate-y-1/2" /> : <Eye size={25} className="translate-y-1/2" />}
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50"
      >
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );

  const renderOTPStep = () => (
    <form onSubmit={handleVerifyOTP} className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Verify Your Email</h3>
        <p className="text-gray-600">
          We've sent a verification code to <span className="font-medium">{formData.email}</span>
        </p>
        {remainingAttempts < 3 && (
          <p className="text-sm text-amber-600 mt-2">
            {remainingAttempts} {remainingAttempts === 1 ? 'attempt' : 'attempts'} remaining
          </p>
        )}
      </div>

      <div className="flex justify-center space-x-2 mb-8">
        {otp.map((digit, index) => (
          <input
            key={index}
            type="text"
            name={`otp-${index}`}
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition"
            maxLength={1}
            pattern="[0-9]"
            inputMode="numeric"
            autoComplete="off"
            disabled={isBlocked}
          />
        ))}
      </div>

      <button
        type="submit"
        disabled={isLoading || isBlocked}
        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50"
      >
        {isLoading ? 'Verifying...' : 'Verify Email'}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={handleResendOTP}
          disabled={resendCooldown > 0 || isBlocked}
          className={`text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {resendCooldown > 0 
            ? `Resend code in ${resendCooldown}s`
            : "Didn't receive the code? Resend"}
        </button>
      </div>
    </form>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="bg-white shadow-2xl rounded-2xl p-10 max-w-lg w-full transform transition-all hover:scale-105 duration-300">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={logo} alt="WebGrave Logo" className="w-20 h-20 object-contain" />
        </div>

        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Create Your Account</h2>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
            <svg className="w-6 h-6 mr-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Back Button for OTP Step */}
        {step === 'otp' && (
          <button
            onClick={() => setStep('info')}
            className="mb-6 flex items-center text-gray-600 hover:text-primary-600 transition"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Registration
          </button>
        )}

        {/* Form Steps */}
        {step === 'info' ? renderInfoStep() : renderOTPStep()}

        <p className="mt-4 text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-primary-600 hover:underline font-semibold">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
