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
