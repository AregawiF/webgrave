import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/webgrave-logo.png";

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      
      // Store auth data
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('tokenExpiresAt', (new Date().getTime() + 24 * 60 * 60 * 1000).toString()); // 24 hours
      localStorage.setItem('user', JSON.stringify(data.user));

      onLoginSuccess();
      navigate('/find-memorials');
    } catch (error) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-sm w-full">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="WebGrave Logo" className="w-16" />
        </div>

        <h2 className="text-2xl font-semibold text-center text-gray-800">Welcome Back</h2>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="block text-gray-600 text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-gray-600 text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 rounded-lg transition"
          >
            Log In
          </button>
        </form>

        {/* Forgot Password & Signup Link */}
        <div className="mt-4 text-center text-sm text-gray-600">
          <Link to="/forgot-password" className="text-primary-600 hover:underline">
            Forgot password?
          </Link>
        </div>

        <p className="mt-2 text-center text-gray-500">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
