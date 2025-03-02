export interface Memorial {
  id: string;
  name: string;
  birthDate: string;
  deathDate: string;
  description: string;
  photos: string[];
  isPublic: boolean;
  barcodeId?: string;
}

export interface MemorialPageProps {
  memorial: Memorial;
}

export interface SearchParams {
  query: string;
  type: 'name' | 'date';
}