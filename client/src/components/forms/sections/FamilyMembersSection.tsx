import React from 'react';
import { Users, Plus, X, Mail, Phone, Calendar, CreditCard } from 'lucide-react';
import type { FamilyMember } from '../../../types/forms';

interface Props {
  formData: any;
  setFormData: (data: any) => void;
}

export function FamilyMembersSection({ formData, setFormData }: Props) {
  const addFamilyMember = () => {
    setFormData({
      ...formData,
      familyMembers: [
        ...formData.familyMembers,
        {
          relationship: '',
          fullName: '',
          isLiving: true,
          email: '',
          phone: '',
          birthDate: '',
          identityNumber: '',
          identityType: ''
        }
      ]
    });
  };

  const removeFamilyMember = (index: number) => {
    setFormData({
      ...formData,
      familyMembers: formData.familyMembers.filter((_: any, i: number) => i !== index)
    });
  };

  const updateFamilyMember = (index: number, field: keyof FamilyMember, value: string | boolean) => {
    const newFamilyMembers = [...formData.familyMembers];
    newFamilyMembers[index] = { ...newFamilyMembers[index], [field]: value };
    setFormData({ ...formData, familyMembers: newFamilyMembers });
  };

  const relationships = [
    'Spouse',
    'Child',
    'Parent',
    'Sibling',
    'Grandparent',
    'Grandchild',
    'Aunt/Uncle',
    'Niece/Nephew',
    'Cousin',
    'In-law',
    'Other'
  ];

  return (
    <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Users className="h-5 w-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Family Members</h3>
        </div>
        <button
          type="button"
          onClick={addFamilyMember}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Family Member
        </button>
      </div>

      <div className="space-y-6">
        {formData.familyMembers.map((member: FamilyMember, index: number) => (
          <div key={index} className="relative border border-gray-200 rounded-lg p-4">
            <button
              type="button"
              onClick={() => removeFamilyMember(index)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Relationship
                </label>
                <select
                  value={member.relationship}
                  onChange={(e) => updateFamilyMember(index, 'relationship', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select relationship...</option>
                  {relationships.map((rel) => (
                    <option key={rel} value={rel}>{rel}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  value={member.fullName}
                  onChange={(e) => updateFamilyMember(index, 'fullName', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter full name"
                />
              </div>

              {/* Identity Information */}
              <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                  <h4 className="text-sm font-medium text-gray-900">Identity Information</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Identity Number
                    </label>
                    <input
                      type="text"
                      value={member.identityNumber || ''}
                      onChange={(e) => updateFamilyMember(index, 'identityNumber', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      placeholder="National ID, SSN, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Document Type
                    </label>
                    <select
                      value={member.identityType || ''}
                      onChange={(e) => updateFamilyMember(index, 'identityType', e.target.value)}
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={member.email || ''}
                    onChange={(e) => updateFamilyMember(index, 'email', e.target.value)}
                    className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={member.phone || ''}
                    onChange={(e) => updateFamilyMember(index, 'phone', e.target.value)}
                    className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Birth Date
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    value={member.birthDate || ''}
                    onChange={(e) => updateFamilyMember(index, 'birthDate', e.target.value)}
                    className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  checked={member.isLiving}
                  onChange={(e) => updateFamilyMember(index, 'isLiving', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-700">Currently Living</label>
              </div>
            </div>
          </div>
        ))}

        {formData.familyMembers.length === 0 && (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No family members</h3>
            <p className="mt-1 text-sm text-gray-500">Add family members to connect memorials.</p>
            <button
              type="button"
              onClick={addFamilyMember}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Family Member
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-700">
          Adding identity information for family members helps us connect memorials and makes it easier to create new memorials for connected family members in the future.
        </p>
      </div>
    </div>
  );
}