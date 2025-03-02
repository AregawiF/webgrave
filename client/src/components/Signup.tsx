import React from "react";
import logo from "../assets/webgrave-logo.png";
import { useNavigate } from "react-router-dom";

interface LoginProps {
    onSignupSuccess: () => void;
}
  
const Signup: React.FC<LoginProps> = ({ onSignupSuccess }) => {
    const navigate = useNavigate();

  const handleSignup = (e: React.FormEvent) => {
    // Simulate successful signup
    // save user data to database
    e.preventDefault(); // Prevent default form submission
    localStorage.setItem('isAuthenticated', 'true');
    onSignupSuccess(); // Update state in App.tsx
    navigate('/find-memorials');

  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-sm w-full">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="WebGrave Logo" className="w-16" />
        </div>

        <h2 className="text-2xl font-semibold text-center text-gray-800">Create an Account</h2>

        {/* Signup Form */}
        <form className="mt-6 space-y-4">
          <div>
            <label className="block text-gray-600 text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-gray-600 text-sm font-medium">Password</label>
            <input
              type="password"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            onClick={handleSignup}
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 rounded-lg transition"
          >
            Sign Up
          </button>
            <p className="mt-2 text-gray-500">
                Already have an account?{" "}
                <button onClick={() => setCurrentPage('login')} className="text-blue-600 underline">
                Log in
                </button>
            </p>
        </form>
      </div>
    </div>  
  );
};

export default Signup;

