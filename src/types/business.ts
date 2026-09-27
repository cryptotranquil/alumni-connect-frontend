export type BusinessStatus = 'active' | 'inactive' | 'pending' | 'approved';

export interface Posted_by {
  id: string;
}

export interface Business {
  _id: string;
  name: string;
  location: string;
  category: "Technology" | "Education",
  description: string; 
  contact_email: string;
  contact_phone: string;
  status: BusinessStatus;
  posted_by?: Posted_by;
  logo?: string;
  banner?: string;
  createdAt: string;
  updatedAt: string;
}

