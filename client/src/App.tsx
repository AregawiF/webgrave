import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Footer } from './components/Footer';
import { CreateMemorial } from './pages/CreateMemorial';
import { ScanCode } from './pages/ScanCode';
import { FindMemorial } from './pages/FindMemorial';
import { AboutUs } from './components/AboutUs';
import Signup from './components/Signup';
import Login from './components/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status on mount and when localStorage changes
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const expiresAt = localStorage.getItem('tokenExpiresAt');
      
      if (token && expiresAt) {
        // Check if token is expired
        if (new Date().getTime() < parseInt(expiresAt)) {
          setIsAuthenticated(true);
        } else {
          // Clear expired token
          handleLogout();
        }
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenExpiresAt');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} />

        <Routes>
          {isAuthenticated ? (
            <>
              <Route path="/find-memorials" element={<FindMemorial />} />
              <Route path="/create-memorial" element={<CreateMemorial />} />
              <Route path="/scan-code" element={<ScanCode />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/" element={<Navigate to="/find-memorials" />} />
              <Route path="*" element={<Navigate to="/find-memorials" />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Hero />} />
              <Route path="/signup" element={<Signup onSignupSuccess={() => setIsAuthenticated(true)} />} />
              <Route path="/login" element={<Login onLoginSuccess={() => setIsAuthenticated(true)} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          )}
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
