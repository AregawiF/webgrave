import React from "react";
import logo from "../assets/webgrave-logo.png";

interface LoginProps {
    setCurrentPage: (page: string) => void;
    onLoginSuccess: () => void;
  }
  
const Login: React.FC<LoginProps> = ({ setCurrentPage, onLoginSuccess }) => {
    const handleLogin = () => {
        // Simulate successful login
        // localStorage.setItem('isAuthenticated', 'true');

        onLoginSuccess();
    };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-sm w-full">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="WebGrave Logo" className="w-16" />
        </div>

        <h2 className="text-2xl font-semibold text-center text-gray-800">Welcome Back</h2>

        {/* Login Form */}
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
            onClick={handleLogin}
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 rounded-lg transition"
          >
            Log In
          </button>
        </form>

        {/* Forgot Password & Signup Link */}
        <div className="mt-4 text-center text-sm text-gray-600">
          <a href="/forgot-password" className="text-primary-600 hover:underline">
            Forgot password?
          </a>
        </div>

        <p className="mt-2 text-gray-500">
            Don't have an account?{" "}
            <button onClick={() => setCurrentPage('signup')} className="text-blue-600 underline">
            Sign up
            </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
