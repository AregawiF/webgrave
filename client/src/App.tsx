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
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true'
  );

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(localStorage.getItem('isAuthenticated') === 'true');
    };

    window.addEventListener('storage', checkAuth); // Listen for auth changes
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Show Header only if authenticated */}
        {isAuthenticated && <Header />}

        <Routes>
          {isAuthenticated ? (
            <>
              <Route path="/find-memorials" element={<FindMemorial />} />
              <Route path="/create-memorial" element={<CreateMemorial />} />
              <Route path="/scan-code" element={<ScanCode />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="*" element={<Navigate to="/find-memorials" />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Hero />} />
              <Route path="/signup" element={<Signup onSignupSuccess={() => setIsAuthenticated(true)}/>} />
              <Route path="/login" element={<Login onLoginSuccess={() => setIsAuthenticated(true)} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          )}
        </Routes>

        {/* Show Footer only if authenticated */}
        {isAuthenticated && <Footer />}
      </div>
    </Router>
  );
}

export default App;
