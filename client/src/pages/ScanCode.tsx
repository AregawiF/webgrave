import React from 'react';
import { Camera } from 'lucide-react';

export function ScanCode() {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="text-center max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <Camera className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Scanner Disabled</h2>
        <p className="text-gray-600">
          The QR code scanner is currently disabled. Please check back later.
        </p>
      </div>
    </div>
  );
}