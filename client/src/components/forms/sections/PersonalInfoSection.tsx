import React from 'react';
import { User, Flag, Languages, Book, CreditCard, QrCode } from 'lucide-react';
import QRCode from 'qrcode.react';

interface Props {
  formData: any;
  setFormData: (data: any) => void;
  errors: Record<string, string>;
}

export function PersonalInfoSection({ formData, setFormData, errors }: Props) {
  const generateQRValue = () => {
    if (!formData.identityNumber) return '';
    return `https://webgrave.com/memorial/${formData.identityNumber}`;
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-center">
        <User className="h-5 w-5 text-primary-600 mr-2" />
        <h3 className="text-lg font-medium text-gray-900">Additional Personal Information</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Legal Identification Section */}
        <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="flex items-center mb-2">
            <CreditCard className="h-5 w-5 text-primary-600 mr-2" />
            <h4 className="text-sm font-medium text-gray-900">Legal Identification</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Identity Number
              </label>
              <input
                type="text"
                value={formData.identityNumber || ''}
                onChange={(e) => setFormData({ ...formData, identityNumber: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                placeholder="National ID, SSN, etc."
              />
              <p className="mt-1 text-xs text-gray-500">
                This helps with legal identification and family connections
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Document Type
              </label>
              <select
                value={formData.identityType || ''}
                onChange={(e) => setFormData({ ...formData, identityType: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select type...</option>
                <option value="national_id">National ID</option>
                <option value="passport">Passport</option>
                <option value="ssn">Social Security Number</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {formData.identityNumber && (
            <div className="flex items-center justify-center p-4 bg-white rounded-lg">
              <div className="text-center">
                <div className="mb-2">
                  <QrCode className="h-5 w-5 text-gray-400 mx-auto" />
                  <span className="text-sm text-gray-500">Memorial QR Code</span>
                </div>
                <QRCode
                  value={generateQRValue()}
                  size={128}
                  level="H"
                  includeMargin={true}
                  className="mx-auto"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Scan to access digital memorial
                </p>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nickname
          </label>
          <input
            type="text"
            value={formData.nickname || ''}
            onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
            placeholder="Known as..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Maiden Name (if applicable)
          </label>
          <input
            type="text"
            value={formData.maidenName || ''}
            onChange={(e) => setFormData({ ...formData, maidenName: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
            placeholder="Previous surname"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nationality
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Flag className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={formData.nationality}
              onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
              className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
              placeholder="Nationality"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Languages Spoken
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Languages className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={formData.languages.join(', ')}
              onChange={(e) => setFormData({ ...formData, languages: e.target.value.split(',').map(lang => lang.trim()) })}
              className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
              placeholder="English, Spanish, etc."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Religion (optional)
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Book className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={formData.religion || ''}
              onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
              className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
              placeholder="Religious affiliation"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Favorite Quote
          </label>
          <textarea
            value={formData.favoriteQuote || ''}
            onChange={(e) => setFormData({ ...formData, favoriteQuote: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
            placeholder="A meaningful quote..."
            rows={2}
          />
        </div>
      </div>
    </div>
  );
}