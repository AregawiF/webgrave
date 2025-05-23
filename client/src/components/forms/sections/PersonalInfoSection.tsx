import { User, Flag, Languages, Book, CreditCard } from 'lucide-react';

interface Props {
  formData: any;
  setFormData: (data: any) => void;
  errors: Record<string, string>;
}

export function PersonalInfoSection({ formData, setFormData, errors }: Props) {
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
                Identity Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.identityNumber || ''}
                onChange={(e) => setFormData({ ...formData, identityNumber: e.target.value })}
                className={`mt-1 block w-full rounded-md ${errors.identityNumber ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'} shadow-sm`}
                placeholder="National ID, SSN, etc."
              />
              {errors.identityNumber ? (
                <p className="mt-1 text-sm text-red-600">{errors.identityNumber}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  This helps with legal identification and family connections
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Document Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.identityType || ''}
                onChange={(e) => setFormData({ ...formData, identityType: e.target.value })}
                className={`mt-1 block w-full rounded-md ${errors.identityType ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'} shadow-sm`}
              >
                <option value="">Select type...</option>
                <option value="national_id">National ID</option>
                <option value="passport">Passport</option>
                <option value="ssn">Social Security Number</option>
              </select>
              {errors.identityType && (
                <p className="mt-1 text-sm text-red-600">{errors.identityType}</p>
              )}
            </div>
          </div>
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
            Nationality <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Flag className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={formData.nationality}
              onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
              className={`block w-full pl-10 rounded-md ${errors.nationality ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'} shadow-sm`}
              placeholder="E.g., American, British, etc."
            />
          </div>
          {errors.nationality && (
            <p className="mt-1 text-sm text-red-600">{errors.nationality}</p>
          )}
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