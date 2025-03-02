import React from 'react';
import { Skull, AlertTriangle } from 'lucide-react';

interface Props {
  formData: any;
  setFormData: (data: any) => void;
  errors: Record<string, string>;
}

export function CauseOfDeathSection({ formData, setFormData, errors }: Props) {
  const disasters = {
    war: ['World War II', 'Vietnam War', 'Korean War', 'Other'],
    natural: ['Hurricane', 'Earthquake', 'Tsunami', 'Other'],
    pandemic: ['COVID-19', 'Spanish Flu', 'Other'],
    accident: ['Transportation', 'Industrial', 'Natural', 'Other'],
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-center">
        <Skull className="h-5 w-5 text-gray-400 mr-2" />
        <h3 className="text-lg font-medium text-gray-900">Cause of Death</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Primary Cause
          </label>
          <input
            type="text"
            value={formData.causeOfDeath}
            onChange={(e) => setFormData({ ...formData, causeOfDeath: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
            placeholder="e.g., Heart Disease, Cancer"
          />
          {errors.causeOfDeath && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              {errors.causeOfDeath}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Related to Major Event/Disaster?
          </label>
          <select
            value={formData.disasterType}
            onChange={(e) => setFormData({ ...formData, disasterType: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Not related to major event</option>
            <option value="war">War/Conflict</option>
            <option value="natural">Natural Disaster</option>
            <option value="pandemic">Pandemic/Disease</option>
            <option value="accident">Major Accident</option>
          </select>
        </div>

        {formData.disasterType && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Event Name
              </label>
              <select
                value={formData.disasterName}
                onChange={(e) => setFormData({ ...formData, disasterName: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select event...</option>
                {disasters[formData.disasterType as keyof typeof disasters]?.map((event) => (
                  <option key={event} value={event}>{event}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Event Date
              </label>
              <input
                type="date"
                value={formData.disasterDate}
                onChange={(e) => setFormData({ ...formData, disasterDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}