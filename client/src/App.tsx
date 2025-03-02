import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Footer } from './components/Footer';
import { CreateMemorial } from './pages/CreateMemorial';
import { ScanCode } from './pages/ScanCode';
import { FindMemorial } from './pages/FindMemorial';
import { AboutUs } from './components/AboutUs';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'create' | 'scan' | 'find' | 'about'>('home');

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
          onCreateClick={() => setCurrentPage('create')} 
          onScanClick={() => setCurrentPage('scan')}
        />
      ) : currentPage === 'create' ? (
        <CreateMemorial />
      ) : currentPage === 'scan' ? (
        <ScanCode />
      ) : currentPage === 'about' ? (
        <AboutUs />
      ) : (
        <FindMemorial />
      )}
      <Footer />
    </div>
  );
}

export default App;