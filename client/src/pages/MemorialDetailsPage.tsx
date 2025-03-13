import React, { useState, useEffect } from 'react';
import { Calendar, Globe, Heart, Download, Flower2, X, MapPin, Book, Flag, CreditCard, Briefcase, GraduationCap, Medal, Users, Minus, Plus, Edit, Trash2 } from 'lucide-react';
import QRCode from 'qrcode.react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate

interface MediaFile {
    type: 'photo' | 'video';
    url: string;
}

interface MemorialDetails {
    _id: string;
    fullName: string;
    birthDate: string;
    deathDate: string;
    biography: string;
    mainPicture: string;
    isPublic: boolean;
    additionalMedia: MediaFile[];
    enableDigitalFlowers: boolean;
    suggestedDonationAmount: number;
    identityNumber?: string;
    identityType?: string;
    nickname?: string; // Consistent naming
    maidenName?: string;
    nationality?: string;
    languages?: string[]; // Consistent naming
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
        fullName: string;
        identityNumber?: string;
        isLiving: boolean;
    }[];
    createdBy: string;
    causeOfDeath?: {  // Include causeOfDeath
        primaryCause: string;
        majorEvent: string;
        eventName?: string;  // Optional fields
        eventDate?: string; // Optional fields
    };
     placeOfBirth: string;
     serviceDate?: string;
     serviceLocation?: string;
     serviceDetails?:string;
     militaryService?: boolean;
     favoriteQuote?: string;
     birthdayReminder?:boolean;
     tributes?:any[];
     totalTributes?:any;

}

export default function MemorialDetailsPage() {
    const [memorial, setMemorial] = useState<MemorialDetails | null>(null);
    const [activeTab, setActiveTab] = useState<'about' | 'family' | 'career' | 'gallery'>('about');
    const [donation, setDonation] = useState(5);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate(); // For redirection after delete

    const [isEditing, setIsEditing] = useState(false);
    const [editedMemorial, setEditedMemorial] = useState<MemorialDetails | null>(null);
    const [mainPicturePreview, setMainPicturePreview] = useState<string | null>(null);
    const [additionalMediaPreviews, setAdditionalMediaPreviews] = useState<string[]>([]);


    useEffect(() => {
        const fetchMemorial = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`http://localhost:5000/api/memorials/${id}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch memorial: ${response.status} ${response.statusText}`);
                }
                const data = await response.json();
                // Parse stringified data back into objects
                const parsedData: MemorialDetails = {
                    ...data,
                    languages: data.languagesSpoken ? data.languagesSpoken : [],
                    education: data.education ? data.education : [],
                    familyMembers: data.familyMembers ? data.familyMembers : [],
                    additionalMedia: data.additionalMedia ?  data.additionalMedia : [],
                    causeOfDeath: data.causeOfDeath ?  data.causeOfDeath : { primaryCause: '', majorEvent: ''},
                    tributes: data.tributes ? data.tributes : [],
                };
                setMemorial(parsedData);
                 setMainPicturePreview(parsedData.mainPicture); // Set initial preview
                 setAdditionalMediaPreviews(parsedData.additionalMedia.map(media => media.url));


            } catch (err: any) {
                setError(err.message || 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchMemorial();
        }
    }, [id]);


    const user = localStorage.getItem('user'); // Get stored user data as a string
    let loggedUserId = '';

    if (user) {
      const parsedUser = JSON.parse(user); // Parse it to an object

      if (parsedUser.id) {
        loggedUserId = parsedUser.id;
      } else {
        console.error("User id not found in local storage.");
      }
    } else {
      console.error("User not found.");
    }

    const incrementDonation = () => setDonation((prev) => prev + 5);
    const decrementDonation = () => setDonation((prev) => (prev > 5 ? prev - 5 : 5));

    const handleEdit = () => {
          if (memorial) {
        const copy: MemorialDetails = {
            ...memorial,
             languages: memorial.languages ? [...memorial.languages] : [],
            education: memorial.education ? memorial.education.map(edu => ({ ...edu })) : [],  // Deep copy
            familyMembers: memorial.familyMembers ? memorial.familyMembers.map(member => ({ ...member })) : [], // Deep copy
            additionalMedia: memorial.additionalMedia ? memorial.additionalMedia.map(media => ({ ...media })) : [], // Deep copy
            causeOfDeath: memorial.causeOfDeath ? { ...memorial.causeOfDeath } : { primaryCause: '', majorEvent: '' },
            tributes: memorial.tributes ? memorial.tributes.map((tribute) => ({...tribute})) : [],
        };

        setEditedMemorial(copy);
        setIsEditing(true);

    }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditedMemorial((prev) => (prev ? { ...prev, [name]: value } : null));
    };

    const handleDateChange = (name: string, value: string) => {
      setEditedMemorial(prev => (prev ? { ...prev, [name]: new Date(value).toISOString()} : null));
    };

    const handleArrayChange = (name: string, value: string) => {
      const newArray = value.split(',').map(item => item.trim());
      setEditedMemorial(prev => (prev ? { ...prev, [name]: newArray } : null));
    }

 const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'mainPicture' | 'additionalMedia') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
        if (fieldName === 'mainPicture') {
            setMainPicturePreview(reader.result as string);
        } else {
             setAdditionalMediaPreviews(prevPreviews => [...prevPreviews, reader.result as string]);

        }
    };
    reader.readAsDataURL(file);

    setEditedMemorial(prev => {
        if (!prev) return null;
        if (fieldName === 'mainPicture') {
            return { ...prev, mainPicture: file };
        } else {
            // For additionalMedia, we'll store *new* files.  Existing URLs are handled separately.
            const newMedia = { type: file.type.startsWith('image') ? 'photo' : 'video', file };
            return { ...prev, additionalMedia: [...(prev.additionalMedia || []), newMedia] };
        }
    });
};



//   const handleSave = async () => {
//     if (!editedMemorial) return;

//     try {
//         const formData = new FormData();

//         // Append all the changed fields, handling arrays and objects correctly.
//         for (const key in editedMemorial) {
//             if (editedMemorial.hasOwnProperty(key)) {
//                 const value = (editedMemorial as any)[key];

//                 if (value instanceof File) {
//                     formData.append(key, value);
//                 } else if (Array.isArray(value)) {
//                     // Handle additionalMedia specially
//                     if (key === 'additionalMedia') {
//                         value.forEach((mediaItem: any, index: number) => {
//                             if (mediaItem.file) {
//                                 // New file: append it
//                                 formData.append(`additionalMedia[${index}]`, mediaItem.file);
//                             } else if (mediaItem.url) {
//                                 // Existing URL: send as a stringified object (your backend will need to handle this).
//                                 formData.append(`additionalMedia[${index}]`, JSON.stringify({ type: mediaItem.type, url: mediaItem.url }));
//                             }
//                         });
//                     }
//                      else {
//                          formData.append(key, JSON.stringify(value));
//                     }

//                 }else if (key === 'causeOfDeath' && typeof value === 'object' && value !== null) {
//                     formData.append(key, JSON.stringify(value));
//                 }

//                  else if (key === 'birthDate' || key === 'deathDate') {
//                     formData.append(key, new Date(value).toISOString());
//                 }
//                 else if(key !== 'tributes' && key !== 'totalTributes') {  // likely don't need to send these
//                     formData.append(key, String(value));
//                 }
//             }
//         }

//         const token = localStorage.getItem('authToken');
//         if (!token) {
//             throw new Error('No auth token found');
//         }

//         const response = await fetch(`http://localhost:5000/api/memorials/${id}`, {
//             method: 'PUT',
//             body: formData, // Use FormData for file uploads
//             headers: {
//               'Authorization': `Bearer ${token}`
//             },
//         });

//         if (!response.ok) {
//             throw new Error(`Failed to update memorial: ${response.status} ${response.statusText}`);
//         }

//         const updatedData = await response.json();
//          const parsedData: MemorialDetails = {
//                     ...updatedData,
//                     languages: updatedData.languagesSpoken ? updatedData.languagesSpoken : [],
//                     education: updatedData.education ? updatedData.education : [],
//                     familyMembers: updatedData.familyMembers ? updatedData.familyMembers : [],
//                     additionalMedia: updatedData.additionalMedia ?  updatedData.additionalMedia : [],
//                     causeOfDeath: updatedData.causeOfDeath ?  updatedData.causeOfDeath : { primaryCause: '', majorEvent: ''},
//                      tributes: updatedData.tributes ? updatedData.tributes : [],
//                 };
//         setMemorial(parsedData); // Update the main memorial state
//         setIsEditing(false);
//         setMainPicturePreview(parsedData.mainPicture);
//          setAdditionalMediaPreviews(parsedData.additionalMedia.map(media => media.url));

//     } catch (err: any) {
//         setError(err.message || 'An unknown error occurred during save');
//     }
// };

const handleSave = async () => {
    if (!editedMemorial) return;
  
    try {
      const formData = new FormData();
  
      // Basic fields with correct field names
      formData.append('fullName', editedMemorial.fullName);
      // Important: Backend uses nickName not nickname
      if (editedMemorial.nickname) formData.append('nickName', editedMemorial.nickname); 
      if (editedMemorial.maidenName) formData.append('maidenName', editedMemorial.maidenName);
      if (editedMemorial.biography) formData.append('biography', editedMemorial.biography);
      if (editedMemorial.identityNumber) formData.append('identityNumber', editedMemorial.identityNumber);
      if (editedMemorial.identityType) formData.append('identityType', editedMemorial.identityType);
      if (editedMemorial.placeOfBirth) formData.append('placeOfBirth', editedMemorial.placeOfBirth);
      if (editedMemorial.nationality) formData.append('nationality', editedMemorial.nationality);
      if (editedMemorial.religion) formData.append('religion', editedMemorial.religion);
      if (editedMemorial.favoriteQuote) formData.append('favoriteQuote', editedMemorial.favoriteQuote);
      if (editedMemorial.serviceLocation) formData.append('serviceLocation', editedMemorial.serviceLocation);
      if (editedMemorial.serviceDetails) formData.append('serviceDetails', editedMemorial.serviceDetails);
      
      // Handle dates properly
      if (editedMemorial.birthDate) formData.append('birthDate', new Date(editedMemorial.birthDate).toISOString());
      if (editedMemorial.deathDate) formData.append('deathDate', new Date(editedMemorial.deathDate).toISOString());
      if (editedMemorial.serviceDate) formData.append('serviceDate', new Date(editedMemorial.serviceDate).toISOString());
  
      // Handle boolean values correctly
      formData.append('isPublic', String(!!editedMemorial.isPublic));
      formData.append('birthdayReminder', String(!!editedMemorial.birthdayReminder));
      formData.append('militaryService', String(!!editedMemorial.militaryService));
      formData.append('enableDigitalFlowers', String(!!editedMemorial.enableDigitalFlowers));
  
      // Backend expects languagesSpoken not languages
      if (editedMemorial.languages && editedMemorial.languages.length > 0) {
        formData.append('languagesSpoken', JSON.stringify(editedMemorial.languages));
      }
  
      // Complex objects need to be stringified
      if (editedMemorial.education && editedMemorial.education.length > 0) {
        formData.append('education', JSON.stringify(editedMemorial.education));
      }
  
      if (editedMemorial.familyMembers && editedMemorial.familyMembers.length > 0) {
        formData.append('familyMembers', JSON.stringify(editedMemorial.familyMembers));
      }
  
      if (editedMemorial.causeOfDeath) {
        formData.append('causeOfDeath', JSON.stringify(editedMemorial.causeOfDeath));
      }
  
      // Handle main picture
      if (editedMemorial.mainPicture instanceof File) {
        formData.append('mainPicture', editedMemorial.mainPicture);
      } else if (mainPicturePreview && mainPicturePreview.startsWith('data:')) {
        const blob = await fetch(mainPicturePreview).then(r => r.blob());
        formData.append('mainPicture', blob, 'main_picture.jpg');
      }
  
      // Handle additionalMedia - separate existing and new media
      if (editedMemorial.additionalMedia && editedMemorial.additionalMedia.length > 0) {
        // First, handle existing media with URLs
        const existingMedia = editedMemorial.additionalMedia
          .filter(media => media.url && !media.url.startsWith('data:') && !media.file)
          .map(media => ({ type: media.type, url: media.url }));
        
        // Send existing media as a JSON string
        formData.append('existingMedia', JSON.stringify(existingMedia));
        
        // Then handle new uploads
        let newMediaCount = 0;
        for (const media of editedMemorial.additionalMedia) {
          if (media.file) {
            // If it's a File object
            formData.append('additionalMedia', media.file);
            newMediaCount++;
          } else if (media.url && media.url.startsWith('data:')) {
            // If it's a data URL from a new upload
            const blob = await fetch(media.url).then(r => r.blob());
            const fileExt = media.type === 'photo' ? 'jpg' : 'mp4';
            formData.append('additionalMedia', blob, `media_${newMediaCount}.${fileExt}`);
            newMediaCount++;
          }
        }
      }
  
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found');
      }
  
      console.log('Sending update with formData:', Object.fromEntries(formData));
  
      const response = await fetch(`http://localhost:5000/api/memorials/${id}`, {
        method: 'PUT',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update memorial: ${response.status}`);
      }
  
      const updatedData = await response.json();
      const parsedData: MemorialDetails = {
        ...updatedData,
        languages: updatedData.languagesSpoken || [],
        education: updatedData.education || [],
        familyMembers: updatedData.familyMembers || [],
        additionalMedia: updatedData.additionalMedia || [],
        causeOfDeath: updatedData.causeOfDeath || { primaryCause: '', majorEvent: ''},
        tributes: updatedData.tributes || [],
      };
      
      setMemorial(parsedData);
      setIsEditing(false);
      setMainPicturePreview(parsedData.mainPicture);
      setAdditionalMediaPreviews(parsedData.additionalMedia.map(media => media.url));
      
      // Show success message
      alert('Memorial updated successfully');
  
    } catch (err: any) {
      console.error('Update error:', err);
      setError(err.message || 'An unknown error occurred during save');
      alert(`Error updating memorial: ${err.message}`);
    }
  };


    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this memorial?')) {
            try {

                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error('No auth token found');
                }

                const response = await fetch(`http://localhost:5000/api/memorials/${id}`, {
                    method: 'DELETE',
                    headers: {
                      'Authorization': `Bearer ${token}`
                    },
                });

                if (!response.ok) {
                    throw new Error(`Failed to delete memorial: ${response.status} ${response.statusText}`);
                }

                navigate('/'); // Redirect to home page or another appropriate page
            } catch (err: any) {
                setError(err.message || 'An unknown error occurred during delete');
            }
        }
    };


    const handleNestedInputChange = (section: string, index: number, field: string, value: any) => {
    setEditedMemorial(prev => {
        if (!prev) return null;
        const updatedSection = [...(prev[section as keyof MemorialDetails] as any[])]; // Type assertion
        if (!updatedSection[index]) {
            updatedSection[index] = {} as any; // Initialize if undefined
        }
        updatedSection[index] = { ...updatedSection[index], [field]: value };

        return { ...prev, [section]: updatedSection };
    });
};


    const renderTabContent = () => {
      if (!memorial) return null;

      switch (activeTab) {
        case 'about':
          return (
            <div className="space-y-8">
              {/* Basic Information */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {memorial.fullName && (
                      <div>
                         {isEditing ? (
                                <input
                                  type="text"
                                  name="fullName"
                                  value={editedMemorial?.fullName || ''}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 border rounded-md"
                                />
                              ) : (
                        <>
                          <label className="text-sm font-medium text-gray-500">Known As</label>
                          <p className="text-gray-900">{memorial.fullName}</p>
                        </>
                      )}
                      </div>
                    )}
                    {memorial.maidenName && (
                        <div>
                        {isEditing ? (
                                <input
                                type="text"
                                name="maidenName"
                                value={editedMemorial?.maidenName || ''}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border rounded-md"
                                />
                            ) : (
                            <>
                            <label className="text-sm font-medium text-gray-500">Maiden Name</label>
                            <p className="text-gray-900">{memorial.maidenName}</p>
                            </>
                        )}
                        </div>
                    )}

                  {memorial.placeOfBirth && (
                    <div>
                      {isEditing ? (
                        <input
                          type="text"
                          name="placeOfBirth"
                          value={editedMemorial?.placeOfBirth || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      ) : (
                        <>
                          <label className="text-sm font-medium text-gray-500">Place of Birth</label>
                          <p className="text-gray-900">{memorial.placeOfBirth}</p>
                        </>
                      )}
                    </div>
                  )}

                    {memorial.nationality && (
                      <div className="flex items-center">
                        <Flag className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          {isEditing ? (
                                  <input
                                    type="text"
                                    name="nationality"
                                    value={editedMemorial?.nationality || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md"
                                  />
                                ) : (
                            <>
                              <label className="text-sm font-medium text-gray-500">Nationality</label>
                              <p className="text-gray-900">{memorial.nationality}</p>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                  {memorial.languages && memorial.languages.length > 0 && (
                    <div>
                        {isEditing ? (
                            <input
                            type="text"
                            name="languages"
                            defaultValue={editedMemorial?.languages?.join(', ') || ''}
                            onChange={(e) => handleArrayChange('languages', e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="Enter languages separated by commas"
                            />
                        ) : (
                        <>
                        <label className="text-sm font-medium text-gray-500">Languages</label>
                        <p className="text-gray-900">{memorial.languages.join(', ')}</p>
                        </>
                        )}
                    </div>
                )}
                    {memorial.religion && (
                      <div className="flex items-center">
                        <Book className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          {isEditing ? (
                                <input
                                  type="text"
                                  name="religion"
                                  value={editedMemorial?.religion || ''}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 border rounded-md"
                                />
                              ) : (
                            <>
                              <label className="text-sm font-medium text-gray-500">Religion</label>
                              <p className="text-gray-900">{memorial.religion}</p>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                     {memorial.favoriteQuote && (
                    <div>
                      {isEditing ? (
                        <input
                          type="text"
                          name="favoriteQuote"
                          value={editedMemorial?.favoriteQuote || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      ) : (
                        <>
                          <label className="text-sm font-medium text-gray-500">Favorite Quote</label>
                          <p className="text-gray-900">{memorial.favoriteQuote}</p>
                        </>
                      )}
                    </div>
                  )}
                     {/* Birthday Reminder Toggle */}
                    {isEditing ? (
                        <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="birthdayReminder"
                            name="birthdayReminder"
                            checked={editedMemorial?.birthdayReminder || false}
                            onChange={(e) => setEditedMemorial(prev => (prev ? { ...prev, birthdayReminder: e.target.checked } : null))}
                            className="mr-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="birthdayReminder" className="text-sm text-gray-700">
                            Birthday Reminder
                        </label>
                        </div>
                    ) : (
                        <div className="flex items-center">
                        <label className="text-sm font-medium text-gray-500 mr-2">Birthday Reminder:</label>
                        <span className="text-gray-900">{memorial.birthdayReminder ? 'On' : 'Off'}</span>
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

                        {isEditing ? (
                                <>
                                <label className="text-sm font-medium text-gray-500">Identity Number</label>

                                <input
                                    type="text"
                                    name="identityNumber"
                                    value={editedMemorial?.identityNumber || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                                <label className="text-sm font-medium text-gray-500 mt-1">Type</label>

                                <input
                                    type="text"
                                    name="identityType"
                                    value={editedMemorial?.identityType || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                                </>
                            ) : (
                        <>
                        <label className="text-sm font-medium text-gray-500">Identity Number</label>
                        <p className="text-gray-900">{memorial.identityNumber}</p>
                        <p className="text-sm text-gray-500 mt-1">Type: {memorial.identityType}</p>
                        </>
                            )}
                    </div>
                    <div className="flex justify-center">
                      <QRCode
                        value={`https://webgrave.com/memorial/${memorial._id}`}
                        size={128}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                  </div>
                </div>
              )}

                {/* Cause of Death */}
                {memorial.causeOfDeath && (
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Cause of Death</h3>
                    {isEditing ? (
                         <>
                        <label className="block text-sm font-medium text-gray-700">Primary Cause</label>
                        <input
                            type="text"
                            name="causeOfDeath.primaryCause"
                            value={editedMemorial?.causeOfDeath?.primaryCause || ''}
                            onChange={(e) => handleNestedInputChange('causeOfDeath', 0, 'primaryCause', e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />

                        <label className="block mt-4 text-sm font-medium text-gray-700">Major Event</label>
                        <select
                            name="causeOfDeath.majorEvent"
                            value={editedMemorial?.causeOfDeath?.majorEvent || ''}
                            onChange={(e) => handleNestedInputChange('causeOfDeath', 0, 'majorEvent', e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="">Select...</option>
                            <option value="war_conflict">War/Conflict</option>
                            <option value="natural_disaster">Natural Disaster</option>
                            <option value="pandemic_disease">Pandemic/Disease</option>
                            <option value="major_accident">Major Accident</option>
                            <option value="not_related">Not Related</option>
                        </select>

                        <label className="block mt-4 text-sm font-medium text-gray-700">Event Name (if applicable)</label>
                        <input
                            type="text"
                            name="causeOfDeath.eventName"
                            value={editedMemorial?.causeOfDeath?.eventName || ''}
                            onChange={(e) => handleNestedInputChange('causeOfDeath', 0, 'eventName', e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />

                        <label className="block mt-4 text-sm font-medium text-gray-700">Event Date (if applicable)</label>
                        <input
                            type="date"
                            name="causeOfDeath.eventDate"
                            value={editedMemorial?.causeOfDeath?.eventDate ? new Date(editedMemorial.causeOfDeath.eventDate).toISOString().split('T')[0] : ''}
                           onChange={(e) => handleNestedInputChange('causeOfDeath', 0, 'eventDate', e.target.value)}

                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        </>

                    ) : (
                        <>
                        <p className="text-gray-600"><strong>Primary Cause:</strong> {memorial.causeOfDeath.primaryCause}</p>
                        <p className="text-gray-600"><strong>Major Event:</strong> {memorial.causeOfDeath.majorEvent}</p>
                         {memorial.causeOfDeath.eventName && <p className="text-gray-600"><strong>Event Name:</strong> {memorial.causeOfDeath.eventName}</p>}
                        {memorial.causeOfDeath.eventDate && <p className="text-gray-600"><strong>Event Date:</strong> {new Date(memorial.causeOfDeath.eventDate).toLocaleDateString()}</p>}

                        </>
                    )}
                    </div>
                )}

              {/* Description */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Life Story</h3>
                {isEditing ? (
                    <textarea
                        name="biography"
                        value={editedMemorial?.biography || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                        rows={4}
                    />
                ) : (
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{memorial.biography}</p>
                )}
              </div>


              {/* Achievements */}
              {memorial.achievements && memorial.achievements.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center mb-4">
                    <Medal className="h-5 w-5 text-gray-400 mr-2" />
                    <h3 className="text-xl font-semibold text-gray-900">Achievements</h3>
                  </div>
                  {isEditing ? (
                    <textarea
                        name="achievements"
                        defaultValue={editedMemorial?.achievements?.join(', ') || ''}
                        onChange={(e) => handleArrayChange('achievements', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                        rows={4}
                    />
                ):(
                  <ul className="list-disc list-inside space-y-2">
                    {memorial.achievements.map((achievement, index) => (
                      <li key={index} className="text-gray-600">{achievement}</li>
                    ))}
                  </ul>
                )}
                </div>
              )}
                {memorial.militaryService !== undefined && (
                    <div>
                    {isEditing ? (
                        <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="militaryService"
                            name="militaryService"
                            checked={editedMemorial?.militaryService || false}
                            onChange={(e) => setEditedMemorial(prev => (prev ? { ...prev, militaryService: e.target.checked } : null))}
                            className="mr-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="militaryService" className="text-sm text-gray-700">
                            Military Service
                        </label>
                        </div>
                    ) : (
                        <div className="flex items-center">
                        <label className="text-sm font-medium text-gray-500 mr-2">Military Service:</label>
                        <span className="text-gray-900">{memorial.militaryService ? 'Yes' : 'No'}</span>
                        </div>
                    )}
                    </div>
                )}
            </div>
          );
        case 'family':
          // ... (Similar structure for other cases - add input fields inside isEditing checks)
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
                                    {isEditing ? (
                                         <>
                                            <input
                                                type="text"
                                                name={`familyMembers[${index}].fullName`}
                                                value={editedMemorial?.familyMembers?.[index]?.fullName || ''}
                                               onChange={(e) => handleNestedInputChange('familyMembers', index, 'fullName', e.target.value)}
                                                className="w-full px-3 py-1 border rounded-md text-gray-900"
                                            />
                                            <input
                                                type="text"
                                                name={`familyMembers[${index}].relationship`}
                                                value={editedMemorial?.familyMembers?.[index]?.relationship || ''}
                                                onChange={(e) => handleNestedInputChange('familyMembers', index, 'relationship', e.target.value)}

                                                className="w-full px-3 py-1 border rounded-md text-gray-500"
                                            />

                                        </>
                                    ) : (
                                        <>
                                            <h4 className="font-medium text-gray-900">{member.fullName}</h4>
                                            <p className="text-sm text-gray-500">{member.relationship}</p>
                                        </>
                                    )}
                                </div>
                                {isEditing ? (
                                   <select
                                    name={`familyMembers[${index}].isLiving`}
                                    value={editedMemorial?.familyMembers?.[index]?.isLiving ? 'Living' : 'Deceased'}
                                   onChange={(e) => handleNestedInputChange('familyMembers', index, 'isLiving', e.target.value === 'Living')}
                                    className="px-2 py-1 text-xs font-medium rounded-full border"
                                >
                                    <option value="Living">Living</option>
                                    <option value="Deceased">Deceased</option>
                                </select>

                                ) : (
                                member.isLiving ? (
                                    <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-full">
                                        Living
                                    </span>
                                ) : (
                                    <span className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-50 rounded-full">
                                        Deceased
                                    </span>
                                ))}
                            </div>

                            {member.identityNumber && (
                                <div className="mt-2 pt-2 border-t">
                                  {isEditing? (

                                    <>
                                      <label className="block text-xs text-gray-500">Identity Number:</label>
                                      <input
                                          type="text"
                                          name={`familyMembers[${index}].identityNumber`}
                                          value={editedMemorial?.familyMembers?.[index]?.identityNumber || ''}
                                          onChange={(e) => handleNestedInputChange('familyMembers', index, 'identityNumber', e.target.value)}
                                          className="w-full px-3 py-1 border rounded-md text-sm font-mono text-gray-700"
                                        />
                                    </>
                                  ) : (
                                    <>
                                    <p className="text-xs text-gray-500">Identity Number:</p>
                                    <p className="text-sm font-mono text-gray-700">{member.identityNumber}</p>
                                    </>
                                  )}
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
                                        {isEditing ? (
                                            <>
                                                <input
                                                    type="text"
                                                    name={`education[${index}].institution`}
                                                    value={editedMemorial?.education?.[index]?.institution || ''}
                                                   onChange={(e) => handleNestedInputChange('education', index, 'institution', e.target.value)}
                                                    className="w-full px-3 py-1 border rounded-md font-medium text-gray-900"
                                                />
                                                <input
                                                    type="text"
                                                    name={`education[${index}].degree`}
                                                    value={editedMemorial?.education?.[index]?.degree || ''}
                                                    onChange={(e) => handleNestedInputChange('education', index, 'degree', e.target.value)}

                                                    className="w-full px-3 py-1 border rounded-md text-gray-600"
                                                />
                                                <input
                                                    type="text"
                                                    name={`education[${index}].fieldOfStudy`}
                                                    value={editedMemorial?.education?.[index]?.fieldOfStudy || ''}
                                                     onChange={(e) => handleNestedInputChange('education', index, 'fieldOfStudy', e.target.value)}

                                                    className="w-full px-3 py-1 border rounded-md text-gray-600"
                                                    placeholder='Field of Study'
                                                />
                                                <input
                                                    type="text"
                                                    name={`education[${index}].years`}
                                                    value={editedMemorial?.education?.[index]?.years || ''}
                                                   onChange={(e) => handleNestedInputChange('education', index, 'years', e.target.value)}
                                                    className="w-full px-3 py-1 border rounded-md text-sm text-gray-500"
                                                />
                                            </>

                                        ) : (
                                            <>
                                                <h4 className="font-medium text-gray-900">{edu.institution}</h4>
                                                <p className="text-gray-600">{edu.degree} in {edu.fieldOfStudy}</p>
                                                <p className="text-sm text-gray-500">{edu.years}</p>
                                            </>
                                        )}
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
                                        {isEditing ? (
                                            <>
                                                <input
                                                    type="text"
                                                    name={`career[${index}].company`}
                                                    value={editedMemorial?.career?.[index]?.company || ''}
                                                   onChange={(e) => handleNestedInputChange('career', index, 'company', e.target.value)}
                                                    className="w-full px-3 py-1 border rounded-md font-medium text-gray-900"
                                                />
                                                <input
                                                    type="text"
                                                    name={`career[${index}].position`}
                                                    value={editedMemorial?.career?.[index]?.position || ''}
                                                    onChange={(e) => handleNestedInputChange('career', index, 'position', e.target.value)}

                                                    className="w-full px-3 py-1 border rounded-md text-gray-600"
                                                />
                                                <input
                                                    type="text"
                                                    name={`career[${index}].years`}
                                                    value={editedMemorial?.career?.[index]?.years || ''}
                                                   onChange={(e) => handleNestedInputChange('career', index, 'years', e.target.value)}
                                                    className="w-full px-3 py-1 border rounded-md text-sm text-gray-500"
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <h4 className="font-medium text-gray-900">{job.company}</h4>
                                                <p className="text-gray-600">{job.position}</p>
                                                <p className="text-sm text-gray-500">{job.years}</p>
                                            </>
                                        )}
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
                        {editedMemorial?.additionalMedia.map((file, index) => (
                            <div key={index} className="group relative rounded-xl overflow-hidden bg-gray-50">
                                {file.type === 'photo' ? (
                                    <div className="aspect-w-4 aspect-h-3">
                                        <img
                                             src={additionalMediaPreviews[index] || file.url}
                                            alt={file.caption || `Media ${index}`}
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                ) : file.type === 'video' ? (
                                    <video
                                         src={additionalMediaPreviews[index] || file.url}
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
                                  {/* Delete Button (if editing) */}
                                {isEditing && (
                                    <button
                                        onClick={() => {
                                            const updatedMedia = editedMemorial.additionalMedia.filter((_, i) => i !== index);
                                           setAdditionalMediaPreviews(prevPreviews => prevPreviews.filter((_,i) => i !== index))
                                            setEditedMemorial(prev => prev ? { ...prev, additionalMedia: updatedMedia } : null);
                                        }}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-75 hover:opacity-100"
                                    >
                                        <X size={16} />
                                    </button>
                                )}

                            </div>
                        ))}

                        {/* File Input for Additional Media (if editing) */}
                        {isEditing && (
                            <div>
                                <label htmlFor="additionalMedia" className="block text-sm font-medium text-gray-700">Add Media</label>
                                <input
                                    type="file"
                                    id="additionalMedia"
                                    name="additionalMedia"
                                     onChange={(e) => handleFileChange(e, 'additionalMedia')}
                                    multiple
                                    className="mt-1"
                                />
                            </div>
                        )}
                    </div>
                </div>
            );
    }
};


    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!memorial) {
        return <div>Memorial not found.</div>;
    }


    return (
        <div className="min-h-screen  text-left  bg-gray-50 ">

          {/* Header with profile image and edit/delete buttons */}
      <div className="relative h-80 overflow-hidden">
        <img
          src={mainPicturePreview || memorial.mainPicture}
          alt={memorial.fullName}
          className="w-1/2 h-full object-cover mx-auto"
        />
         {isEditing && (
                <div className="absolute top-2 right-2 z-10">
                    <input type="file" onChange={(e) => handleFileChange(e, 'mainPicture')} />
                </div>
            )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <h1 className="text-4xl font-bold mb-2">{memorial.fullName}</h1>
          <div className="flex items-center gap-4 text-white/90">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
               {isEditing ? (
                    <>
                        <input
                            type="date"
                            name="birthDate"
                            value={editedMemorial?.birthDate ? new Date(editedMemorial.birthDate).toISOString().split('T')[0] : ''}
                            onChange={(e) => handleDateChange('birthDate', e.target.value)}
                            className="text-black px-2 py-1 rounded"
                        />
                        <span> - </span>
                        <input
                            type="date"
                            name="deathDate"
                            value={editedMemorial?.deathDate ? new Date(editedMemorial.deathDate).toISOString().split('T')[0] : ''}
                            onChange={(e) => handleDateChange('deathDate', e.target.value)}
                            className="text-black px-2 py-1 rounded"
                        />
                    </>
                ) : (
              <span>{new Date(memorial.birthDate).toLocaleDateString()} - {new Date(memorial.deathDate).toLocaleDateString()}</span>
               )}
            </div>
            
             {memorial.serviceDate && (
                <div className="flex items-center">

                {isEditing ? (
                    <>
                    <label className="text-sm font-medium text-gray-500 mr-2">Service Date:</label>

                        <input
                            type="date"
                            name="serviceDate"
                            value={editedMemorial?.serviceDate ? new Date(editedMemorial.serviceDate).toISOString().split('T')[0] : ''}
                            onChange={(e) => handleDateChange('serviceDate', e.target.value)}
                            className="text-black px-2 py-1 rounded"
                        />
                    </>
                ) : (
                    <>
                    <label className="text-sm font-medium text-gray-500 mr-2">Service Date:</label>
                    <span>{new Date(memorial.serviceDate).toLocaleDateString()}</span>
                    </>
                )}
                </div>
            )}
              {memorial.serviceLocation && (
                    <div>
                      {isEditing ? (
                        <>
                          <label className="text-sm font-medium text-gray-500">Service Location</label>

                        <input
                          type="text"
                          name="serviceLocation"
                          value={editedMemorial?.serviceLocation || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-md"
                        />
                        </>
                      ) : (
                        <>
                          <label className="text-sm font-medium text-gray-500">Service Location</label>
                          <p className="text-gray-900">{memorial.serviceLocation}</p>
                        </>
                      )}
                    </div>
                  )}
              {memorial.serviceDetails && (
                    <div>
                      {isEditing ? (
                        <>
                          <label className="text-sm font-medium text-gray-500">Service Details</label>

                         <textarea
                            name="serviceDetails"
                            value={editedMemorial?.serviceDetails || ''}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-md"
                            rows={4}
                        />
                        </>
                      ) : (
                        <>
                          <label className="text-sm font-medium text-gray-500">Service Details</label>
                          <p className="text-gray-900">{memorial.serviceDetails}</p>
                        </>
                      )}
                    </div>
                  )}
            {/* <div className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
               {isEditing ? (
                    <select
                    name="isPublic"
                    value={editedMemorial?.isPublic ? 'Public' : 'Private'}
                    onChange={(e) => {
                        setEditedMemorial(prev => (prev ? { ...prev, isPublic: e.target.value === 'Public' } : null));
                    }}
                    className="text-black px-2 py-1 rounded"
                    >
                    <option value="Public">Public</option>
                    <option value="Private">Private</option>
                </select>
                ) : (
              <span>{memorial.isPublic ? 'Public Memorial' : 'Private Memorial'}</span>
               )}
            </div> */}
          </div>
           {/* Edit and Delete Buttons */}
           {memorial.createdBy === loggedUserId && (
             <div className="absolute top-4 right-4 flex space-x-2">

              {isEditing ? (
                <button onClick={handleSave} className="btn-primary">Save</button>
              ) : (
                <>
                    <button onClick={handleEdit} className="btn-secondary">
                        <Edit className="h-4 w-4 mr-1" /> Edit
                    </button>
                    <button onClick={handleDelete} className="btn-danger">
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </button>
                </>
              )}
            </div>
            )}
        </div>
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

                                    {/* Donation Controls */}
                                    <div className="flex items-center justify-center gap-4 mb-4">
                                        <button onClick={decrementDonation} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300">
                                            <Minus className="h-4 w-4 text-gray-700" />
                                        </button>
                                        <span className="text-lg font-semibold">${donation}</span>
                                        <button onClick={incrementDonation} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300">
                                            <Plus className="h-4 w-4 text-gray-700" />
                                        </button>
                                    </div>

                                     {/* Send Flowers Button -  Keep this, but consider adding a loading state */}
                                    <button className="btn-primary w-full flex items-center justify-center gap-2">
                                        <Heart className="h-5 w-5" />
                                        Send Flowers (${donation})
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}