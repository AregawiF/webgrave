import React from 'react';
import { Shield } from 'lucide-react';

interface Props {
  formData: any;
  setFormData: (data: any) => void;
}

export function MilitaryServiceSection({ formData, setFormData }: Props) {
  const hasMilitaryService = Boolean(formData.militaryService);

  const handleServiceChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      militaryService: {
        ...(formData.militaryService || {}),
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Military Service</h3>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={hasMilitaryService}
            onChange={(e) => {
              if (!e.target.checked) {
                setFormData({ ...formData, militaryService: undefined });
              } else {
                setFormData({
                  ...formData,
                  militaryService: { branch: '', rank: '', serviceYears: '', details: '' }
                });
              }
            }}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-600">
            Served in military
          </label>
        </div>
      </div>

      {hasMilitaryService && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Branch of Service
            </label>
            <input
              type="text"
              value={formData.militaryService?.branch || ''}
              onChange={(e) => handleServiceChange('branch', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., Army, Navy, Air Force"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Rank
            </label>
            <input
              type="text"
              value={formData.militaryService?.rank || ''}
              onChange={(e) => handleServiceChange('rank', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
              placeholder="Final rank achieved"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Years of Service
            </label>
            <input
              type="text"
              value={formData.militaryService?.serviceYears || ''}
              onChange={(e) => handleServiceChange('serviceYears', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., 1960-1965"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Service Details
            </label>
            <textarea
              value={formData.militaryService?.details || ''}
              onChange={(e) => handleServiceChange('details', e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
              placeholder="Deployments, medals, or other notable service information..."
            />
          </div>
        </div>
      )}
    </div>
  );
}