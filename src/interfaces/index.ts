/**
 * Buy2Go Domain Interfaces
 * Aligned with Buy2Go Service Backend Models & DTOs
 */

export type Buy2GoRole = 'ADMIN' | 'OWNER' | 'CUSTOMER' | string;

export interface Buy2GoUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: Buy2GoRole;
  roleName?: Buy2GoRole;
  userName?: string;
  createdAt?: string;
}

// User alias for Redux and components
export type User = Buy2GoUser;

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}

export interface PaginatedResponse<T = any> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface Buy2GoProduct {
  id: string | number;
  title: string;
  name?: string;
  category: string;
  price: number;
  startingPrice?: number;
  formattedPrice?: string;
  image?: string;
  imageUrl?: string;
  photoUrl?: string;
  description?: string;
  sizes?: string | string[];
  colours?: string | string[];
  isLive?: boolean;
  slug?: string;
  maxPhotosAllowed?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type Product = Buy2GoProduct;

export interface ProductPayload {
  title?: string;
  name?: string;
  category: string;
  price: number | string;
  sizes?: string | string[];
  colours?: string | string[];
  description?: string;
  isLive?: boolean;
  imageUrl?: string;
  photoUrl?: string;
  [key: string]: any;
}
