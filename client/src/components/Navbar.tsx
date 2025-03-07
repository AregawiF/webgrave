import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Home, PlusCircle, Search, MessageCircle, 
  LogIn, UserPlus, LogOut, Info, Scan 
} from 'lucide-react';
import logo from '../assets/webgrave-logo.png';


interface NavbarProps {
  isAuthenticated: boolean;
  handleLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isAuthenticated, handleLogout }) => {
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        
        <div className='flex items-center'>
          <img src={logo} className="w-10" alt="webgrave logo" />
          <Link to="/" className="text-2xl font-bold text-primary-600">
            WebGrave
          </Link>
        </div>
        
        <div className="flex items-center space-x-6">
          <Link 
            to="/find-memorials" 
            className="flex items-center text-gray-700 hover:text-primary-600 transition"
          >
            <Search className="mr-2 h-5 w-5" /> Find Memorials
          </Link>
          <Link 
            to="/scan-code" 
            className="flex items-center text-gray-700 hover:text-primary-600 transition"
          >
            <Scan className="mr-2 h-5 w-5" /> Scan Code
          </Link>

          {isAuthenticated && (
            <Link 
              to="/create-memorial" 
              className="flex items-center text-gray-700 hover:text-primary-600 transition"
            >
              <PlusCircle className="mr-2 h-5 w-5" /> Create Memorial
            </Link>
          )}

          <Link 
            to="/about" 
            className="flex items-center text-gray-700 hover:text-primary-600 transition"
          >
          {/* insert icon for about us */}
            <Info className='mr-2 h-5 w-5'/>About us
          </Link>
          <Link 
            to="/contact" 
            className="flex items-center text-gray-700 hover:text-primary-600 transition"
          >
            <MessageCircle className="mr-2 h-5 w-5" /> Contact
          </Link>

          {!isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                <LogIn className="mr-2 h-5 w-5" /> Login
              </Link>
              <Link 
                to="/signup" 
                className="flex items-center px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition"
              >
                <UserPlus className="mr-2 h-5 w-5" /> Sign Up
              </Link>
            </div>
          ) : (
            <button 
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <LogOut className="mr-2 h-5 w-5" /> Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
