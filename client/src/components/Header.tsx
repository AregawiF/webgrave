import { Scan, Search, Menu } from 'lucide-react';
import logo from '../assets/webgrave-logo.png';

interface Props {
  onCreateClick: () => void;
  onScanClick: () => void;
  onFindClick: () => void;
  onAboutClick: () => void;
}

export function Header({ onCreateClick, onScanClick, onFindClick, onAboutClick }: Props) {
  return (
    <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-surface-200/50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <img src={logo} className='w-10' alt="webgrave logo" />
            <button 
              onClick={() => window.location.href = '/'}
              className="text-2xl font-semibold text-surface-900 hover:text-primary-600 transition-colors"
            >
              WebGrave
            </button>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={onFindClick}
              className="text-surface-600 hover:text-surface-900 flex items-center gap-2 transition-colors"
            >
              <Search size={20} />
              Find Memorial
            </button>
            <button 
              onClick={onScanClick}
              className="text-surface-600 hover:text-surface-900 flex items-center gap-2 transition-colors"
            >
              <Scan size={20} />
              Scan Code
            </button>
            <button
              onClick={onAboutClick}
              className="text-surface-600 hover:text-surface-900 transition-colors"
            >
              About Us
            </button>
            <button 
              onClick={onCreateClick}
              className="btn-primary"
            >
              Create Memorial
            </button>
          </div>

          <div className="md:hidden">
            <button className="text-surface-600 hover:text-surface-900 transition-colors">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}