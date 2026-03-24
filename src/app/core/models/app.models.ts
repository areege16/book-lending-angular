export type UserRole = 'Admin' | 'Reader';

export interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  token?: string;
  jwt?: string;
  accessToken?: string;
  message?: string;
}

export interface RegisterRequest {
  userName: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber?: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  description: string;
  coverImageUrl?: string;
  isAvailable: boolean;
  borrowedByUser?: boolean;
}

export interface BookPayload {
  title: string;
  author: string;
  isbn: string;
  description: string;
  coverImage?: File | null;
}

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface BorrowRecord {
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  borrowedAt?: string;
  dueDate?: string;
  returnedAt?: string | null;
  isReturned?: boolean;
  isOverdue?: boolean;
  userName?: string;
  userEmail?: string;
}
