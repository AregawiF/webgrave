export interface AccountFormData {
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface FamilyMember {
  relationship: string;
  fullName: string;
  isLiving: boolean;
  email?: string;
  phone?: string;
  birthDate?: string;
  identityNumber?: string;
  identityType?: 'national_id' | 'passport' | 'ssn' | 'other';
}

export interface Achievement {
  title: string;
  date: string;
  description: string;
}

export interface EducationEntry {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
  location: string;
}

export interface CareerEntry {
  company: string;
  position: string;
  startYear: string;
  endYear: string;
  location: string;
  description: string;
}

export interface MemorialFormData {
  name: string;
  birthDate: string;
  birthPlace: string;
  deathDate: string;
  serviceDate?: string;
  serviceLocation?: string;
  serviceDetails?: string;
  description: string;
  profileImage: string | null;
  isPublic: boolean;
  enableDigitalFlowers: boolean;
  suggestedDonationAmount: number;
  enableBirthDateReminder: boolean;
  // Identity fields
  identityNumber?: string;
  identityType?: 'national_id' | 'passport' | 'ssn' | 'other';
  // Personal Information
  nickname?: string;
  maidenName?: string;
  nationality: string;
  languages: string[];
  religion?: string;
  militaryService?: {
    branch: string;
    rank: string;
    serviceYears: string;
    details: string;
  };
  education: EducationEntry[];
  career: CareerEntry[];
  familyMembers: FamilyMember[];
  achievements: Achievement[];
  hobbies: string[];
  favoriteQuote?: string;
  charities?: string[];
  mediaFiles: {
    type: 'image' | 'video' | 'document';
    url: string;
    caption: string;
  }[];
  // Cause of death information
  causeOfDeath: string;
  disasterTag?: string;
  disasterType?: 'war' | 'natural' | 'pandemic' | 'accident' | '';
  disasterName?: string;
  disasterDate?: string;
}