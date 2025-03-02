import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

interface Props {
  onSearch: (criteria: SearchCriteria) => void;
  onClose: () => void;
}

interface SearchCriteria {
  name?: string;
  birthYear?: string;
  deathYear?: string;
  location?: string;
  causeOfDeath?: string;
  disasterType?: string;
  disasterName?: string;
  nationality?: string;
  religion?: string;
  military?: boolean;
}

export function AdvancedSearch({ onSearch, onClose }: Props) {
  const [criteria, setCriteria] = useState<SearchCriteria>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(criteria);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold">Advanced Search</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter name"
                onChange={(e) => setCriteria({ ...criteria, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                placeholder="City, Country"
                onChange={(e) => setCriteria({ ...criteria, location: e.target.value })}
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Birth Year</label>
              <input
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                placeholder="YYYY"
                onChange={(e) => setCriteria({ ...criteria, birthYear: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Death Year</label>
              <input
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                placeholder="YYYY"
                onChange={(e) => setCriteria({ ...criteria, deathYear: e.target.value })}
              />
            </div>
          </div>

          {/* Cause of Death and Disasters */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Cause of Death</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Heart Disease, Accident"
                onChange={(e) => setCriteria({ ...criteria, causeOfDeath: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Disaster Type</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  onChange={(e) => setCriteria({ ...criteria, disasterType: e.target.value })}
                >
                  <option value="">Any</option>
                  <option value="war">War/Conflict</option>
                  <option value="natural">Natural Disaster</option>
                  <option value="pandemic">Pandemic</option>
                  <option value="accident">Major Accident</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Specific Event</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., World War II, COVID-19"
                  onChange={(e) => setCriteria({ ...criteria, disasterName: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Additional Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nationality</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter nationality"
                onChange={(e) => setCriteria({ ...criteria, nationality: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Religion</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter religion"
                onChange={(e) => setCriteria({ ...criteria, religion: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              onChange={(e) => setCriteria({ ...criteria, military: e.target.checked })}
            />
            <label className="ml-2 block text-sm text-gray-900">
              Military Service
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center"
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}