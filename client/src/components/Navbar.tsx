
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, PlusCircle, Search, MessageCircle, 
  LogIn, UserPlus, LogOut, Info, Scan, Folder, 
  User,
  X,
  Menu
} from 'lucide-react';
import logo from '../assets/webgrave-logo.png';

interface NavbarProps {
  isAuthenticated: boolean;
  handleLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isAuthenticated, handleLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => 
    location.pathname === path 
      ? 'border-b-4 border-primary-600 -mb-1 pb-1 mx-2'
      : 'text-gray-700 hover:text-primary-600 transition';

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        
        <div className='flex items-center'>
          <img src={logo} className="w-10" alt="webgrave logo" />
          <Link to="/" className="text-2xl font-bold text-primary-600">
            WebGrave
          </Link>
        </div>
        
        <div className="flex items-center space-x-6 hidden md:flex">
          <Link to="/find-memorials" className={`flex items-center ${isActive('/find-memorials')}`}>
            <Search className="mr-2 h-5 w-5" /> Find Memorials
          </Link>
          <Link to="/scan-code" className={`flex items-center ${isActive('/scan-code')}`}>
            <Scan className="mr-2 h-5 w-5" /> Scan Code
          </Link>

          {isAuthenticated && (
            <>
              <Link to="/create-memorial" className={`flex items-center ${isActive('/create-memorial')}`}>
                <PlusCircle className="mr-2 h-5 w-5" /> Create Memorial
              </Link>
              <Link to="/my-memorials" className={`flex items-center ${isActive('/my-memorials')}`}>
                <Folder className="mr-2 h-5 w-5" /> My Memorials
              </Link>
            </>
          )}

          <Link to="/about" className={`flex items-center ${isActive('/about')}`}>
            <Info className='mr-2 h-5 w-5'/> About us
          </Link>
          <Link to="/contact" className={`flex items-center ${isActive('/contact')}`}>
            <MessageCircle className="mr-2 h-5 w-5" /> Contact
          </Link>

          {!isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <Link to="/login" className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
                <LogIn className="mr-2 h-5 w-5" /> Login
              </Link>
              <Link to="/signup" className="flex items-center px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition">
                <UserPlus className="mr-2 h-5 w-5" /> Sign Up
              </Link>
            </div>
          ) : (
            <div className="relative">
              <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="text-gray-700 hover:bg-gray-200 px-4 py-2 rounded">
                <User size={20} />
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 bg-white shadow-md rounded py-2 w-40">
                  <button onClick={() => navigate('/profile')} className="block px-4 py-2 hover:bg-gray-100 w-full text-left">Profile</button>
                  <button onClick={handleLogout} className="block px-4 py-2 hover:bg-gray-100 w-full text-left text-red-500">Logout</button>
                </div>
              )}
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
        <div className="md:hidden flex flex-col space-y-2 bg-white py-4 px-4 border-t flex justify-center ml-6">
          <Link to="/find-memorials" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center my-2 `}>
            Find Memorials
          </Link>
          <Link to="/scan-code" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center my-2 pb-2`}>
            Scan Code
          </Link>

          {isAuthenticated && (
            <>
              <Link to="/create-memorial" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center pb-2`}>
                Create Memorial
              </Link>
              <Link to="/my-memorials" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center my-4 pb-2`}>
                My Memorials
              </Link>
            </>
          )}

          <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center my-2 pb-2`}>
            About us
          </Link>
          <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center my-2`}>
            Contact
          </Link>

          {!isAuthenticated ? (
            <div className="flex flex-col space-y-2">
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
                Login
              </Link>
              <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition">
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="flex flex-col space-y-2">
              <button onClick={() => navigate('/profile')} className="block py-2 hover:bg-gray-100 w-full text-left">Profile</button>
              <button onClick={handleLogout} className="block py-2 hover:bg-gray-100 w-full text-left text-red-500">Logout</button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
