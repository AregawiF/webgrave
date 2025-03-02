import React from 'react';
import { SocialLinks } from './SocialLinks';

export function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center">
          <p className="text-gray-500">© {new Date().getFullYear()} WebGrave. All rights reserved.</p>
          <SocialLinks />
        </div>
      </div>
    </footer>
  );
}