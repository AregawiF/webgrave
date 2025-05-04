import React, { useState, useEffect } from 'react';
import { Calendar, Globe, Heart, Download, Flower2, X, MapPin, Book, Flag, CreditCard, Briefcase, GraduationCap, Medal, Users, Minus, Plus, Edit, Trash2, MessageSquare } from 'lucide-react';
import QRCode from 'qrcode.react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Paystack from '@paystack/inline-js';

declare const PaystackPop: any;

interface MediaFile {
    type: 'photo' | 'video';
    url: string;
    file?: File;
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
        fullName: string;
        identityNumber?: string;
        isLiving: boolean;
    }[];
    createdBy: string;
    causeOfDeath?: {
        primaryCause: string;
        majorEvent: string;
        eventName?: string;
        eventDate?: string;
    };
    placeOfBirth: string;
    serviceDate?: string;
    serviceLocation?: string;
    serviceDetails?: string;
    militaryService?: boolean;
    favoriteQuote?: string;
    birthdayReminder?: boolean;
    tributes?: any[];
    totalTributes?: any;
}

export default function MemorialDetailsPage() {
    const [memorial, setMemorial] = useState<MemorialDetails | null>(null);
    const [activeTab, setActiveTab] = useState<'about' | 'family' | 'career' | 'gallery'>('about');
    const [donation, setDonation] = useState(5);
    const [tributeMessage, setTributeMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isTributesModalOpen, setIsTributesModalOpen] = useState(false);
    const [tributePage, setTributePage] = useState(1);
    const [totalTributePages, setTotalTributePages] = useState(1);
    const [totalTributes, setTotalTributes] = useState(0);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const [isEditing, setIsEditing] = useState(false);
    const [editedMemorial, setEditedMemorial] = useState<MemorialDetails | null>(null);
    const [mainPicturePreview, setMainPicturePreview] = useState<string | null>(null);
    const [additionalMediaPreviews, setAdditionalMediaPreviews] = useState<string[]>([]);
    const user = localStorage.getItem('user');
    let loggedUserId = '';

    if (user) {
        const parsedUser = JSON.parse(user);

        if (parsedUser.id) {
            loggedUserId = parsedUser.id;
        } else {
            console.error("User id not found in local storage.");
        }
    } else {
        console.error("User not found.");
    }

    const fetchMemorial = async () => {
        setLoading(true);
        try {
            const response = await fetch(`https://webgrave.onrender.com/api/memorials/${id}?page=${tributePage}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch memorial: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            const parsedData: MemorialDetails = {
                ...data.memorial,
                languages: data.memorial.languagesSpoken ? data.memorial.languagesSpoken : [],
                education: data.memorial.education ? data.memorial.education : [],
                familyMembers: data.memorial.familyMembers ? data.memorial.familyMembers : [],
                additionalMedia: data.memorial.additionalMedia ? data.memorial.additionalMedia : [],
                tributes: data.memorial.tributes ? data.memorial.tributes : [],
            };
            setMemorial(parsedData);
            setTotalTributePages(data.totalPages);
            setTotalTributes(data.totalItems);
            setMainPicturePreview(parsedData.mainPicture);
            setAdditionalMediaPreviews(parsedData.additionalMedia.map(media => media.url));
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMemorial();
    }, [id, tributePage]);

    const handleTributePageChange = (newPage: number) => {
        setTributePage(newPage);
    };

    const incrementDonation = () => setDonation((prev) => prev + 5);
    const decrementDonation = () => setDonation((prev) => (prev > 5 ? prev - 5 : 5));

    const handleEdit = () => {
        if (memorial) {
            const copy: MemorialDetails = {
                ...memorial,
                languages: memorial.languages ? [...memorial.languages] : [],
                education: memorial.education ? memorial.education.map(edu => ({ ...edu })) : [],
                familyMembers: memorial.familyMembers ? memorial.familyMembers.map(member => ({ ...member })) : [],
                additionalMedia: memorial.additionalMedia ? memorial.additionalMedia.map(media => ({ ...media })) : [],
                causeOfDeath: memorial.causeOfDeath ? { ...memorial.causeOfDeath } : { primaryCause: '', majorEvent: '' },
                tributes: memorial.tributes ? memorial.tributes.map((tribute) => ({ ...tribute })) : [],
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
        setEditedMemorial(prev => (prev ? { ...prev, [name]: new Date(value).toISOString() } : null));
    };

    const handleArrayChange = (name: string, value: string) => {
        const newArray = value.split(',').map(item => item.trim());
        setEditedMemorial(prev => (prev ? { ...prev, [name]: newArray } : null));
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'mainPicture' | 'additionalMedia') => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (fieldName === 'mainPicture') {
            const file = files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setMainPicturePreview(reader.result as string);
                setEditedMemorial(prev => {
                    if (!prev) return null;
                    return { ...prev, mainPicture: file };
                });
            };
            reader.readAsDataURL(file);
        } else {
            // Handle multiple files for additionalMedia
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setAdditionalMediaPreviews(prev => [...prev, reader.result as string]);
                    setEditedMemorial(prev => {
                        if (!prev) return null;
                        const newMedia = {
                            type: file.type.startsWith('image') ? 'photo' : 'video',
                            url: reader.result as string,
                            file // Store the actual file object
                        };
                        return {
                            ...prev,
                            additionalMedia: [...(prev.additionalMedia || []), newMedia]
                        };
                    });
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const handleSave = async () => {
        if (!editedMemorial) return;

        try {
            const formData = new FormData();

            // Append basic information
            formData.append('fullName', editedMemorial.fullName);
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

            // Append dates
            if (editedMemorial.birthDate) formData.append('birthDate', new Date(editedMemorial.birthDate).toISOString());
            if (editedMemorial.deathDate) formData.append('deathDate', new Date(editedMemorial.deathDate).toISOString());
            if (editedMemorial.serviceDate) formData.append('serviceDate', new Date(editedMemorial.serviceDate).toISOString());

            // Append boolean fields
            formData.append('isPublic', String(!!editedMemorial.isPublic));
            formData.append('birthdayReminder', String(!!editedMemorial.birthdayReminder));
            formData.append('militaryService', String(!!editedMemorial.militaryService));
            formData.append('enableDigitalFlowers', String(!!editedMemorial.enableDigitalFlowers));

            // Append arrays and objects
            if (editedMemorial.languages && editedMemorial.languages.length > 0) {
                formData.append('languagesSpoken', JSON.stringify(editedMemorial.languages));
            }

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

            // Handle additional media
            // Only append files that are newly added (have a file property)
            const newMediaFiles = editedMemorial.additionalMedia.filter(media => media.file);
            newMediaFiles.forEach((media, index) => {
                if (media.file) {
                    formData.append('additionalMedia', media.file, `media-${index}`);
                }
            });

            // Add existing media URLs that should be kept
            const existingMediaToKeep = editedMemorial.additionalMedia
                .filter(media => !media.file)
                .map(media => ({ type: media.type, url: media.url }));

            // Send the list of media to keep
            formData.append('existingMedia', JSON.stringify(existingMediaToKeep));

            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No auth token found');
            }

            const response = await fetch(`https://webgrave.onrender.com/api/memorials/${id}`, {
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
                causeOfDeath: updatedData.causeOfDeath || { primaryCause: '', majorEvent: '' },
                tributes: updatedData.tributes || [],
            };

            setMemorial(parsedData);
            setEditedMemorial(parsedData);
            setIsEditing(false);
            setMainPicturePreview(parsedData.mainPicture);
            setAdditionalMediaPreviews(parsedData.additionalMedia.map(media => media.url));

            setSuccess('Memorial updated successfully');

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

                const response = await fetch(`https://webgrave.onrender.com/api/memorials/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                });

                if (!response.ok) {
                    throw new Error(`Failed to delete memorial: ${response.status} ${response.statusText}`);
                }

                navigate('/find-memorials');
            } catch (err: any) {
                setError(err.message || 'An unknown error occurred during delete');
            }
        }
    };

    const handleNestedInputChange = (section: string, index: number, field: string, value: any) => {
        setEditedMemorial(prev => {
            if (!prev) return null;
            const updatedSection = [...(prev[section as keyof MemorialDetails] as any[])];
            if (!updatedSection[index]) {
                updatedSection[index] = {} as any;
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
                                            value={`https://web-grave.com/memorial/${memorial._id}`}
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
                                ) : (
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
                                            {isEditing ? (

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
                                        <div className="aspect-w-4 aspect-h-3 " onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedImage(additionalMediaPreviews[index] || file.url)
                                        }} >
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
                                                setAdditionalMediaPreviews(prevPreviews => prevPreviews.filter((_, i) => i !== index))
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
                            {isEditing ? (
                                <div>
                                    <label htmlFor="additionalMedia" className="block text-sm font-medium text-gray-700">Add Media</label>
                                    <input
                                        type="file"
                                        id="additionalMedia"
                                        name="additionalMedia"
                                        accept="image/*,video/*"
                                        onChange={(e) => handleFileChange(e, 'additionalMedia')}
                                        multiple
                                        className="mt-1"
                                    />
                                </div>
                            ): <p className='text-gray-500 text-sm'>Enable editing to add media.</p>}
                        </div>
                    </div>
                );
        }
    };

    const handlePaymentVerification = async (paystackResponse: any, orderId: string, authToken: string | null) => {
        console.log("Initiating backend verification for order:", orderId, "Ref:", paystackResponse.reference);
        // Ensure setError and setSending are accessible from component state hooks
        // Ensure navigate is accessible from useNavigate() hook

        if (!authToken) {
            setError("Authentication error during verification."); // Update component state
            setSending(false); // Update component state
            return;
        }
        try {
            // Make sure this URL is your *correct* production backend URL
            const verifyResponse = await fetch('https://webgrave.onrender.com/api/payments/verify-paystack', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    reference: paystackResponse.reference, // Send Paystack's reference
                    orderId: orderId                   // Send your internal order ID
                })
            });

            const verifyResult = await verifyResponse.json();

            if (!verifyResponse.ok || !verifyResult.success) {
                // Verification failed on backend OR Paystack status wasn't 'success'
                console.error("Backend verification failed:", verifyResult);
                setError(verifyResult.message || 'Payment confirmation failed on our server. Please contact support. Your payment might have gone through.'); // Update component state
                setSending(false); // Update component state
            } else {
                // Verification successful!
                console.log('Backend verification successful for order:', orderId);
                // Navigate to the success page, passing the orderId
                navigate(`/flower-payment/success?order_id=${orderId}`); // Use navigate hook
                // No need to setSending(false) due to navigation
            }

        } catch (verificationError: any) {
            console.error("Network or other error during backend verification fetch:", verificationError);
            setError('An error occurred while confirming your payment with our server. Please contact support.'); // Update component state
            setSending(false); // Update component state
        }
    };


    // --- Function to initiate the payment process ---
    const sendFlowerTribute = async () => {

        setError(null); // Clear previous errors
        setSending(true); // Set loading state for the button
        let currentToken = localStorage.getItem('authToken'); // Get token fresh

        try {
            if (!currentToken) {
                // Redirect to login if not authenticated
                navigate('/login', { state: { from: location.pathname, message: 'Please log in to send flowers' } });
                setSending(false); // Stop processing
                return;
            }

            // Ensure 'id' (memorialId) is available from useParams()
            if (!id) {
                throw new Error("Memorial ID is missing.");
            }

            // Store necessary data in localStorage *before* potentially redirecting to Paystack
            localStorage.setItem('flowerTributeData', JSON.stringify({
                memorialId: id,             // from useParams()
                amount: donation,           // from component state
                message: tributeMessage,    // from component state
            }));
            console.log("Stored flower tribute data in localStorage");

            // 1. Call your backend to create an order record and get payment details
            console.log("Initiating payment order creation on backend...");
            // Make sure this URL is your *correct* production backend URL
            const orderResponse = await fetch('https://webgrave.onrender.com/api/payments/initiate-paystack-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentToken}`
                },
                body: JSON.stringify({
                    amount: donation,           // Send the numeric amount from state
                    orderType: 'flower_tribute',
                    memorialId: id,             // Send the memorial ID from route params
                })
            });

            if (!orderResponse.ok) {
                const errorData = await orderResponse.json();
                console.error("Backend order creation failed:", errorData);
                throw new Error(errorData.error || 'Failed to prepare payment. Please try again.');
            }

            const { orderId, email, publicKey, amountInUSD } = await orderResponse.json();
            console.log("Backend order created:", orderId, "Amount (kobo/cents):", amountInUSD);

            if (!orderId || !email || !publicKey || amountInUSD === undefined || amountInUSD <= 0) {
                 throw new Error('Received invalid payment details from server.');
            }
            console.log(amountInUSD, 'NGN');

            // 2. Configure PaystackPop
            const paystackOptions = {
                key: publicKey,                             // Your public key from backend
                email: email,                               // User's email from backend/user profile
                amount: amountInUSD,                        // Amount MUST be in kobo/cents
                currency: 'ZAR',                            // Or 'NGN', 'GHS', 'ZAR'. MUST match backend & Paystack account
                ref: orderId,                               // Use YOUR unique order ID

                // ---- Use SYNCHRONOUS callbacks as per Paystack docs ----
                callback: function(response: any) {
                    // This function executes IMMEDIATELY after Paystack's success.
                    console.log('Paystack success callback triggered. Reference:', response.reference);
                    // **CRITICAL:** Call your backend verification function here.
                    handlePaymentVerification(response, orderId, currentToken);
                },
                onClose: function() {
                    // This function executes if the user closes the popup.
                    console.log('Paystack popup closed by user.');
                    setError('Payment process was cancelled.'); // Update component state
                    setSending(false); // Update component state
                    localStorage.removeItem('flowerTributeData');
                    console.log("Removed flower tribute data from localStorage due to closure.");
                }
            };

            // 3. Initialize and Open Paystack Iframe
            // Assumes PaystackPop is available globally
            const handler = PaystackPop.setup(paystackOptions);
            console.log("Opening Paystack iframe...");
            handler.openIframe();
            // Do NOT setSending(false) here.

        } catch (err: any) {
            console.error("Error during sendFlowerTribute process:", err);
            setError(err.message || 'An unexpected error occurred. Please try again.'); // Update component state
            setSending(false); // Update component state
            localStorage.removeItem('flowerTributeData');
            console.log("Removed flower tribute data from localStorage due to error.");
        }
    }; // End of sendFlowerTribute function


    const handleViewAllTributes = () => {
        setIsTributesModalOpen(true);
        setTributePage(1); // Reset to first page when opening modal
    };

    const handleTributesModalClose = () => {
        setIsTributesModalOpen(false);
        setTributePage(1); // Reset page when closing modal
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
        <div className="min-h-screen bg-memorial-50 py-12">
            {/* Header with profile image and edit/delete buttons */}
            <div className="relative h-80 overflow-hidden">
                <img
                    src={mainPicturePreview || memorial.mainPicture}
                    alt={memorial.fullName}
                    className="w-1/2 h-full object-cover mx-auto"
                />
                {isEditing && (
                    <div className="absolute top-2 right-2 z-10">
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'mainPicture')} />
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
                                    <p className="text-gray-600 mb-4">
                                        Honor the memory with a digital flower and optional donation
                                    </p>

                                    {/* Error and Success Messages */}
                                    {error && (
                                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                                            {error}
                                        </div>
                                    )}
                                    {success && (
                                        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
                                            {success}
                                        </div>
                                    )}

                                    {/* Tribute Message */}
                                    <div className="mb-4">
                                        <div className="flex items-center mb-2">
                                            <MessageSquare className="h-4 w-4 text-gray-600 mr-2" />
                                            <label className="text-sm font-medium text-gray-700">Message (Optional)</label>
                                        </div>
                                        <textarea
                                            value={tributeMessage}
                                            onChange={(e) => setTributeMessage(e.target.value)}
                                            placeholder="Add a personal message..."
                                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                            rows={3}
                                            maxLength={500}
                                        />
                                    </div>

                                    {/* Donation Controls */}
                                    <div className="flex items-center justify-center gap-4 mb-4">
                                        <button
                                            onClick={decrementDonation}
                                            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
                                            disabled={sending}
                                        >
                                            <Minus className="h-4 w-4 text-gray-700" />
                                        </button>
                                        <span className="text-lg font-semibold">${donation}</span>
                                        <button
                                            onClick={incrementDonation}
                                            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
                                            disabled={sending}
                                        >
                                            <Plus className="h-4 w-4 text-gray-700" />
                                        </button>
                                    </div>

                                    {/* Send Flowers Button */}
                                    <button
                                        onClick={sendFlowerTribute}
                                        className="btn-primary w-full flex items-center justify-center gap-2"
                                        disabled={sending}
                                    >
                                        {sending ? (
                                            <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                                        ) : (
                                            <Heart className="h-5 w-5" />
                                        )}
                                        {sending ? 'Processing...' : `Send Flowers ($${donation})`}
                                    </button>

                                    {/* Show recent tributes preview */}
                                    {memorial.tributes && memorial.tributes.length > 0 && (
                                        <div className="mt-6 pt-4 border-t border-gray-100">
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Tributes</h4>
                                            <div className="space-y-2">
                                                {memorial.tributes.slice(0, 3).map((tribute, index) => (
                                                    <div key={index} className="flex items-start text-left p-2 bg-white rounded-md shadow-sm">
                                                        <Heart className="h-4 w-4 text-pink-500 mr-2 mt-0.5 flex-shrink-0" />
                                                        <div>
                                                            <p className="text-xs text-gray-500">
                                                                {tribute.isAnonymous ? 'Anonymous' : tribute.senderName}
                                                                <span className="mx-1">•</span>
                                                                ${tribute.amount}
                                                            </p>
                                                            {tribute.message && (
                                                                <p className="text-sm text-gray-700 truncate">{tribute.message}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleViewAllTributes}
                                        className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        View All Tributes
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tributes Modal */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-50 ${isTributesModalOpen ? 'flex' : 'hidden'}`}
                onClick={handleTributesModalClose}
            >
                <div
                    className="relative bg-white rounded-lg max-w-4xl mx-auto my-8 p-6 w-full max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold">All Digital Flower Tributes</h2>
                        <button
                            onClick={handleTributesModalClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {memorial?.tributes.map((tribute, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-semibold">{tribute.senderName}</p>
                                        <p className="text-sm text-gray-600">{new Date(tribute.date).toLocaleDateString()}</p>
                                    </div>
                                    <p className="text-indigo-600">${tribute.amount}</p>
                                </div>
                                {tribute.message && (
                                    <p className="mt-2 text-gray-600">"{tribute.message}"</p>
                                )}
                            </div>
                        ))}
                    </div>

                    {totalTributePages > 1 && (
                        <div className="mt-6 flex justify-center">
                            <nav className="flex items-center justify-center">
                                <button
                                    onClick={() => handleTributePageChange(tributePage - 1)}
                                    disabled={tributePage === 1}
                                    className="px-4 py-2 mx-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <span className="px-4 py-2 mx-2">
                                    Page {tributePage} of {totalTributePages}
                                </span>
                                <button
                                    onClick={() => handleTributePageChange(tributePage + 1)}
                                    disabled={tributePage === totalTributePages}
                                    className="px-4 py-2 mx-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </nav>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for Image Preview */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
                    onClick={() => {
                        setSelectedImage(null); // Close modal on background click
                    }}
                >
                    <div
                        className="relative max-w-3xl mx-auto p-4"
                        onClick={(e) => e.stopPropagation()} // Prevent close on image click
                    >
                        <button
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent event from bubbling up
                                setSelectedImage(null); // Close button
                            }}
                        >
                            <X size={24} />
                        </button>
                        <img src={selectedImage} alt="Preview" className="max-h-[80vh] max-w-full rounded-lg" />
                    </div>
                </div>
            )}
        </div>
    );
}