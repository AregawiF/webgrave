import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/webgrave-logo.png";
import { Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSignup = async (e: React.FormEvent) => {
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
      const response = await fetch('http://localhost:5000/api/auth/signup', {
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
        throw new Error(errorData.message || 'Signup failed');
      }

      const data = await response.json();
      
      // Store auth data
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('tokenExpiresAt', (new Date().getTime() + 24 * 60 * 60 * 1000).toString()); // 24 hours
      localStorage.setItem('user', JSON.stringify(data.user));

      onSignupSuccess();
      navigate('/find-memorials');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

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

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-6">
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
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>

          <p className="mt-4 text-center text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-primary-600 hover:underline font-semibold">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
