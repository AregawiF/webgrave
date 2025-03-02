import React, { useState } from 'react';
import { Calendar, Globe, Heart, Download, Flower2, X, MapPin, Book, Flag, CreditCard, Briefcase, GraduationCap, Medal, Users } from 'lucide-react';
import QRCode from 'qrcode.react';

interface MediaFile {
  type: 'image' | 'video' | 'document';
  url: string;
  caption: string;
}

interface MemorialDetails {
  id: string;
  name: string;
  birthDate: string;
  deathDate: string;
  description: string;
  profileImage: string;
  isPublic: boolean;
  mediaFiles: MediaFile[];
  enableDigitalFlowers: boolean;
  suggestedDonationAmount: number;
  // Extended information
  identityNumber?: string;
  identityType?: string;
  nickname?: string;
  maidenName?: string;
  nationality?: string;
  languages?: string[];
  religion?: string;
  education?: {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    years: string;
  }[];
  career?: {
    company: string;
    position: string;
    years: string;
  }[];
  achievements?: string[];
  familyMembers?: {
    relationship: string;
    name: string;
    identityNumber?: string;
    isLiving: boolean;
  }[];
}

interface Props {
  memorial: MemorialDetails;
  onClose: () => void;
}

export function MemorialDetails({ memorial, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'about' | 'family' | 'career' | 'gallery'>('about');
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'about':
        return (
          <div className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {memorial.nickname && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Known As</label>
                      <p className="text-gray-900">{memorial.nickname}</p>
                    </div>
                  )}
                  {memorial.maidenName && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Maiden Name</label>
                      <p className="text-gray-900">{memorial.maidenName}</p>
                    </div>
                  )}
                  {memorial.nationality && (
                    <div className="flex items-center">
                      <Flag className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <label className="text-sm font-medium text-gray-500">Nationality</label>
                        <p className="text-gray-900">{memorial.nationality}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {memorial.languages && memorial.languages.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Languages</label>
                      <p className="text-gray-900">{memorial.languages.join(', ')}</p>
                    </div>
                  )}
                  {memorial.religion && (
                    <div className="flex items-center">
                      <Book className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <label className="text-sm font-medium text-gray-500">Religion</label>
                        <p className="text-gray-900">{memorial.religion}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Legal Identification */}
            {memorial.identityNumber && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-900">Legal Identification</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Identity Number</label>
                    <p className="text-gray-900">{memorial.identityNumber}</p>
                    <p className="text-sm text-gray-500 mt-1">Type: {memorial.identityType}</p>
                  </div>
                  <div className="flex justify-center">
                    <QRCode
                      value={`https://webgrave.com/memorial/${memorial.identityNumber}`}
                      size={128}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Life Story</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{memorial.description}</p>
            </div>

            {/* Achievements */}
            {memorial.achievements && memorial.achievements.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <Medal className="h-5 w-5 text-gray-400 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-900">Achievements</h3>
                </div>
                <ul className="list-disc list-inside space-y-2">
                  {memorial.achievements.map((achievement, index) => (
                    <li key={index} className="text-gray-600">{achievement}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 'family':
        return (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center mb-6">
              <Users className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-xl font-semibold text-gray-900">Family Members</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {memorial.familyMembers?.map((member, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{member.name}</h4>
                      <p className="text-sm text-gray-500">{member.relationship}</p>
                    </div>
                    {member.isLiving ? (
                      <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-full">
                        Living
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-50 rounded-full">
                        Deceased
                      </span>
                    )}
                  </div>
                  {member.identityNumber && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-xs text-gray-500">Identity Number:</p>
                      <p className="text-sm font-mono text-gray-700">{member.identityNumber}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'career':
        return (
          <div className="space-y-8">
            {/* Education */}
            {memorial.education && memorial.education.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center mb-6">
                  <GraduationCap className="h-5 w-5 text-gray-400 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-900">Education</h3>
                </div>
                <div className="space-y-6">
                  {memorial.education.map((edu, index) => (
                    <div key={index} className="border-l-2 border-gray-200 pl-4">
                      <h4 className="font-medium text-gray-900">{edu.institution}</h4>
                      <p className="text-gray-600">{edu.degree} in {edu.fieldOfStudy}</p>
                      <p className="text-sm text-gray-500">{edu.years}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Career */}
            {memorial.career && memorial.career.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center mb-6">
                  <Briefcase className="h-5 w-5 text-gray-400 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-900">Career</h3>
                </div>
                <div className="space-y-6">
                  {memorial.career.map((job, index) => (
                    <div key={index} className="border-l-2 border-gray-200 pl-4">
                      <h4 className="font-medium text-gray-900">{job.company}</h4>
                      <p className="text-gray-600">{job.position}</p>
                      <p className="text-sm text-gray-500">{job.years}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'gallery':
        return (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Media Gallery</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {memorial.mediaFiles.map((file, index) => (
                <div key={index} className="group relative rounded-xl overflow-hidden bg-gray-50">
                  {file.type === 'image' ? (
                    <div className="aspect-w-4 aspect-h-3">
                      <img
                        src={file.url}
                        alt={file.caption}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  ) : file.type === 'video' ? (
                    <video
                      src={file.url}
                      className="h-full w-full object-cover rounded-xl"
                      controls
                    />
                  ) : (
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-full w-full flex items-center justify-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      View Document
                    </a>
                  )}
                  {file.caption && (
                    <p className="mt-2 text-sm text-gray-600">{file.caption}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen px-4 text-center">
        <div className="fixed inset-0" onClick={onClose}></div>
        
        <div className="inline-block w-full max-w-6xl my-8 text-left align-middle transition-all transform bg-gray-50 shadow-2xl rounded-2xl overflow-hidden">
          {/* Header with profile image */}
          <div className="relative h-80 rounded-t-2xl overflow-hidden">
            <img
              src={memorial.profileImage}
              alt={memorial.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <h1 className="text-4xl font-bold mb-2">{memorial.name}</h1>
              <div className="flex items-center gap-4 text-white/90">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>{new Date(memorial.birthDate).toLocaleDateString()} - {new Date(memorial.deathDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  <span>{memorial.isPublic ? 'Public Memorial' : 'Private Memorial'}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Main Content */}
              <div className="flex-1">
                {/* Navigation Tabs */}
                <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm mb-6">
                  {[
                    { id: 'about', label: 'About' },
                    { id: 'family', label: 'Family' },
                    { id: 'career', label: 'Career & Education' },
                    { id: 'gallery', label: 'Gallery' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors
                        ${activeTab === tab.id 
                          ? 'bg-primary-100 text-primary-800' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                {renderTabContent()}
              </div>

              {/* Sidebar */}
              <div className="md:w-80 space-y-6">
                {/* Digital Flowers */}
                {memorial.enableDigitalFlowers && (
                  <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl border border-indigo-100">
                    <div className="text-center">
                      <Flower2 className="h-10 w-10 mx-auto text-indigo-600 mb-3" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Send Digital Flowers</h3>
                      <p className="text-gray-600 mb-6">
                        Honor the memory with a digital flower and optional donation
                      </p>
                      <button className="btn-primary w-full flex items-center justify-center gap-2">
                        <Heart className="h-5 w-5" />
                        Send Flowers (${memorial.suggestedDonationAmount})
                      </button>
                    </div>
                  </div>
                )}

                {/* Memorial ID Card */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Memorial ID</h3>
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <p className="font-mono text-lg text-gray-700">{memorial.id}</p>
                    </div>
                    <button className="btn-secondary w-full flex items-center justify-center gap-2">
                      <Download className="h-5 w-5" />
                      Download Memorial Card
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}