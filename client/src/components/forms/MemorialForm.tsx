import React, { useState } from 'react';
import { AlertCircle, Upload, Flower2, X, Bell, MapPin, Briefcase, UserCircle, Mail, Phone, Calendar, GraduationCap, Medal, Users, Skull } from 'lucide-react';
import { PersonalInfoSection } from './sections/PersonalInfoSection';
import { EducationSection } from './sections/EducationSection';
import { FamilyMembersSection } from './sections/FamilyMembersSection';
import { MilitaryServiceSection } from './sections/MilitaryServiceSection';
import { CauseOfDeathSection } from './sections/CauseOfDeathSection';


interface Props {
  onSubmit: (data: any) => void;
} 

export function MemorialForm({ onSubmit }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    birthPlace: '',
    deathDate: '',
    serviceDate: '',
    serviceLocation: '',
    serviceDetails: '',
    description: '',
    profileImage: null,
    isPublic: true,
    enableDigitalFlowers: true,
    suggestedDonationAmount: 5,
    enableBirthDateReminder: false,
    nickname: '',
    maidenName: '',
    nationality: '',
    languages: [],
    religion: '',
    militaryService: undefined,
    education: [],
    career: [],
    familyMembers: [],
    achievements: [],
    hobbies: [],
    favoriteQuote: '',
    charities: [],
    causeOfDeath: '',
    disasterTag: '',
    disasterType: '',
    disasterName: '',
    disasterDate: '',
    // Adding required fields for backend
    identityType: '',
    identityNumber: ''
  });
  const [amount, setAmount] = useState(20);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    // Basic information validations
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.birthDate) newErrors.birthDate = 'Birth date is required';
    if (!formData.birthPlace) newErrors.birthPlace = 'Place of birth is required';
    if (!formData.deathDate) newErrors.deathDate = 'Death date is required';
    if (!formData.description) newErrors.description = 'Description is required';
    
    // Required identity information
    if (!formData.identityType) newErrors.identityType = 'Identity type is required';
    if (!formData.identityNumber) newErrors.identityNumber = 'Identity number is required';
    if (!formData.nationality) newErrors.nationality = 'Nationality is required';
    
    // Cause of death validations
    if (!formData.causeOfDeath) newErrors.causeOfDeath = 'Primary cause of death is required';
    
    
    // Profile image validation (required by backend)
    if (!formData.profileImage) {
      newErrors.profileImage = 'Profile picture is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // const handleStripeCheckout = async () => {
  //   const response = await fetch("http://localhost:5000/api/payment/create-stripe-payment", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ amount }),
  //   });

  //   const { url } = await response.json();
  //   window.location.href = url; // Redirect to Stripe Checkout
  // };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profileImage: URL.createObjectURL(file)
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Create Memorial</h2>
        <p className="mt-2 text-sm text-gray-600">
          Please provide details about your loved one.
        </p>
      </div>

      {/* Profile Image Section */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Profile Picture <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center justify-center">
          <div className="relative">
            {formData.profileImage ? (
              <div className="relative w-32 h-32 rounded-full overflow-hidden">
                <img
                  src={formData.profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, profileImage: null }))}
                  className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                <label className="cursor-pointer text-center p-4">
                  <UserCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm text-gray-500">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>
        {errors.profileImage && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.profileImage}
          </p>
        )}
      </div>

      {/* Basic Information */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
          placeholder="Enter full name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.name}
          </p>
        )}
      </div>

      {/* Birth Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Birth Date <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 relative">
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
            <div className="mt-2 flex items-center">
              <input
                type="checkbox"
                checked={formData.enableBirthDateReminder}
                onChange={(e) => setFormData({ ...formData, enableBirthDateReminder: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-600 flex items-center">
                <Bell className="h-4 w-4 mr-1" />
                Enable birthday reminder
              </label>
            </div>
          </div>
          {errors.birthDate && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.birthDate}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Place of Birth <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={formData.birthPlace}
              onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
              className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
              placeholder="City, Country"
            />
          </div>
          {errors.birthPlace && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.birthPlace}
            </p>
          )}
        </div>
      </div>

      {/* Death Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Death Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={formData.deathDate}
          onChange={(e) => setFormData({ ...formData, deathDate: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
        />
        {errors.deathDate && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.deathDate}
          </p>
        )}
      </div>

      {/* Service Information */}
      <div className="space-y-4 bg-gray-50 p-6 rounded-xl">
        <div className="flex items-center">
          <Briefcase className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Service Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Service Date
            </label>
            <input
              type="date"
              value={formData.serviceDate}
              onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Service Location
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={formData.serviceLocation}
                onChange={(e) => setFormData({ ...formData, serviceLocation: e.target.value })}
                className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter service location"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Service Details
          </label>
          <textarea
            value={formData.serviceDetails}
            onChange={(e) => setFormData({ ...formData, serviceDetails: e.target.value })}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
            placeholder="Additional service information..."
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Bio <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
          placeholder="Share memories and stories about your loved one..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.description}
          </p>
        )}
      </div>

      {/* Extended Personal Information */}
      <PersonalInfoSection
        formData={formData}
        setFormData={setFormData}
        errors={errors}
      />

      {/* Education History */}
      <EducationSection
        formData={formData}
        setFormData={setFormData}
      />

      {/* Military Service */}
      <MilitaryServiceSection
        formData={formData}
        setFormData={setFormData}
      />

      {/* Family Members */}
      <FamilyMembersSection
        formData={formData}
        setFormData={setFormData}
      />

      {/* Cause of Death Section */}
      <CauseOfDeathSection
        formData={formData}
        setFormData={setFormData}
        errors={errors}
      />

      {/* Digital Flowers Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.enableDigitalFlowers}
              onChange={(e) => setFormData({ ...formData, enableDigitalFlowers: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Enable Digital Flowers and Donations
            </label>
          </div>
          <Flower2 className="h-5 w-5 text-primary-600" />
        </div>

        {/* {formData.enableDigitalFlowers && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Suggested Donation Amount
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                min="1"
                value={formData.suggestedDonationAmount}
                onChange={(e) => setFormData({ ...formData, suggestedDonationAmount: parseInt(e.target.value) })}
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            {errors.suggestedDonationAmount && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.suggestedDonationAmount}
              </p>
            )}
          </div>
        )} */}
      </div>

      {/* Privacy Setting */}
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={formData.isPublic}
          onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-900">
          Make this memorial public
        </label>
      </div>
      
      {errors.payment && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {errors.payment}</p>)}
      {/* Submit Button */}
      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        Create Memorial
      </button>
      
    </form>
  );
}