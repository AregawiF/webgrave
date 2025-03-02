import React, { useEffect, useState } from 'react';
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
  const [currentPage, setCurrentPage] = useState<'home' | 'create' | 'scan' | 'find' | 'about' | 'login' | 'signup'>('home');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check authentication state from local storage
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    setIsAuthenticated(authStatus === 'true');
  }, []);

  // Function to handle login (sets authentication in local storage)
  const handleLogin = () => {
    localStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
    setCurrentPage('find');
  };

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
    setCurrentPage('home');
  };

  // Function to render the current page
  const renderPage = () => {
    if (!isAuthenticated && currentPage !== 'login' && currentPage !== 'signup') {
      return <Hero onSignupClick={() => setCurrentPage('signup')} onLoginClick={() => setCurrentPage('login')} />;
    }

    switch (currentPage) {
      case 'create':
        return <CreateMemorial />;
      case 'scan':
        return <ScanCode />;
      case 'find':
        return <FindMemorial />;
      case 'about':
        return <AboutUs />;
      case 'login':
        return <Login setCurrentPage={setCurrentPage} onLoginSuccess={handleLogin} />;
      case 'signup':
        return <Signup setCurrentPage={setCurrentPage} onSignupSuccess={handleLogin} />;
      default:
        return isAuthenticated ? <FindMemorial/> : <Hero onSignupClick={() => setCurrentPage('signup')} onLoginClick={() => setCurrentPage('login')} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Show Header only if authenticated */}
      {isAuthenticated && (
        <Header
          onCreateClick={() => setCurrentPage('create')}
          onScanClick={() => setCurrentPage('scan')}
          onFindClick={() => setCurrentPage('find')}
          onAboutClick={() => setCurrentPage('about')}
        />
      )}

      {/* Render the current page */}
      {renderPage()}

      {/* Show Footer only if authenticated */}
      {isAuthenticated && <Footer />}
    </div>
  );
}

export default App;
