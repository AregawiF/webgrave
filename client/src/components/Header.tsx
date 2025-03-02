import { useLocation, useNavigate } from 'react-router-dom';
import { Scan, Search, Menu, User, X } from 'lucide-react';
import { useState } from 'react';
import logo from '../assets/webgrave-logo.png';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu

  // Function to check if a link is active
  const isActive = (path: string) => 
    location.pathname === path ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200';

  return (
    <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-surface-200/50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center">
            <img src={logo} className="w-10" alt="webgrave logo" />
            <button 
              onClick={() => navigate('/')}
              className="text-2xl font-semibold text-surface-900 hover:text-primary-600 transition-colors"
            >
              WebGrave
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <button onClick={() => navigate('/find-memorials')} className={`flex px-6 py-2 rounded ${isActive('/find-memorials')}`}>
              <Search size={20} /> Find Memorial
            </button>
            <button onClick={() => navigate('/scan-code')} className={`flex px-4 py-2 rounded ${isActive('/scan-code')}`}>
              <Scan size={20} /> Scan Code
            </button>
            <button onClick={() => navigate('/about-us')} className={`flex px-4 py-2 rounded ${isActive('/about-us')}`}>
              About Us
            </button>
            <button onClick={() => navigate('/create-memorial')} className={`px-4 py-2 rounded ${isActive('/create-memorial')}`}>
              Create Memorial
            </button>
          </div>

          {/* Profile Dropdown */}
          <div className="hidden md:block relative">
            <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="text-gray-700 hover:bg-gray-200 px-4 py-2 rounded">
              <User size={20} />
            </button>
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 bg-white shadow-md rounded py-2 w-40">
                <button onClick={() => navigate('/profile')} className="block px-4 py-2 hover:bg-gray-100 w-full text-left">Profile</button>
                <button onClick={() => {
                  localStorage.removeItem('isAuthenticated');
                  navigate('/');
                }} className="block px-4 py-2 hover:bg-gray-100 w-full text-left text-red-500">Logout</button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-700 hover:text-gray-900">
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden flex flex-col space-y-2 bg-white py-4 px-4 border-t">
            <button onClick={() => { navigate('/find-memorials'); setIsMobileMenuOpen(false); }} className={`px-4 py-2 rounded ${isActive('/find-memorials')}`}>
              Find Memorial
            </button>
            <button onClick={() => { navigate('/scan-code'); setIsMobileMenuOpen(false); }} className={`px-4 py-2 rounded ${isActive('/scan-code')}`}>
              Scan Code
            </button>
            <button onClick={() => { navigate('/about-us'); setIsMobileMenuOpen(false); }} className={`px-4 py-2 rounded ${isActive('/about-us')}`}>
              About Us
            </button>
            <button onClick={() => { navigate('/create-memorial'); setIsMobileMenuOpen(false); }} className={`px-4 py-2 rounded ${isActive('/create-memorial')}`}>
              Create Memorial
            </button>
            <button onClick={() => { navigate('/profile'); setIsMobileMenuOpen(false); }} className="px-4 py-2 rounded text-gray-700 hover:bg-gray-200">
              Profile
            </button>
            <button onClick={() => { localStorage.removeItem('isAuthenticated'); navigate('/'); setIsMobileMenuOpen(false); }} className="px-4 py-2 rounded text-red-500 hover:bg-gray-200">
              Logout
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
