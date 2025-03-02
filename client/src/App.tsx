import React, { useState } from 'react';
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        onCreateClick={() => setCurrentPage('create')}
        onScanClick={() => setCurrentPage('scan')}
        onFindClick={() => setCurrentPage('find')}
        onAboutClick={() => setCurrentPage('about')}
      />
      {currentPage === 'home' ? (
        <Hero 
          onSignupClick={() => setCurrentPage('signup')}
          onLoginClick={() => setCurrentPage('login')} 
        />
      ) : currentPage === 'create' ? (
        <CreateMemorial />
      ) : currentPage === 'scan' ? (
        <ScanCode />
      ) : currentPage === 'about' ? (
        <AboutUs />
      ) : currentPage == 'login' ? (
        <Login />
      ) : currentPage === 'signup' ? (
        <Signup />
      ) : (
        <FindMemorial />
      )
      }
      <Footer />
    </div>
  );
}

export default App;