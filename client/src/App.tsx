import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Signup from './components/Signup';
import CreateMemorial from './pages/CreateMemorial';
import FindMemorial from './pages/FindMemorial';
import MemorialDetailsPage from './pages/MemorialDetailsPage';
import EditMemorial from './pages/EditMemorial';
import SendFlowers from './pages/SendFlowers';
import ContactForm from './pages/ContactForm';
import PrivateRoute from './components/PrivateRoute';
import AboutUs from './pages/AboutUs';
import Home from './pages/Home';
import ScanCode from './pages/ScanCode';
import NotFound from './pages/NotFound';
import Footer from './components/Footer';
import MyMemorials from './pages/MyMemorials';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import FlowerPaymentSuccess from './pages/FlowerPaymentSuccess';
import FlowerPaymentCancel from './pages/FlowerPaymentCancel';

const App: React.FC = () => {
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
      <div className="flex flex-col min-h-screen">
        <Navbar isAuthenticated={isAuthenticated} handleLogout={handleLogout} />
        <main className="flex-grow">
          {/* add footer component at the bottom of every page after every page */}

          <Routes>
            <Route path="/login" element={<Login onLoginSuccess={() => setIsAuthenticated(true)} />} />
            <Route path="/signup" element={<Signup onSignupSuccess={() => setIsAuthenticated(true)} />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/find-memorials" element={<FindMemorial />} />
            <Route path="/scan-code" element={<ScanCode />} />
            <Route path="/" element={<Home />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/cancel" element={<PaymentCancel />} />
            <Route path="/flower-payment/success" element={<FlowerPaymentSuccess />} />
            <Route path="/flower-payment/cancel" element={<FlowerPaymentCancel />} />
            <Route 
              path="/memorial/:id" 
              element={<MemorialDetailsPage />} 
            />
            <Route 
              path="/send-flowers/:id" 
              element={<SendFlowers />} 
            />
            <Route path="/contact" element={<ContactForm />} />
            <Route 
              path="/create-memorial" 
              element={
                <PrivateRoute>
                  <CreateMemorial />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/my-memorials" 
              element={
                <PrivateRoute>
                  <MyMemorials />
                </PrivateRoute>
              }
            />
            <Route 
              path="/edit-memorial/:id" 
              element={
                <PrivateRoute>
                  <EditMemorial />
                </PrivateRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer/>
      </div>
    </Router>
  );
};

export default App;
