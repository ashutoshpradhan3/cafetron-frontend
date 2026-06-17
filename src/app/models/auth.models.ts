export const APP_ROLES = {
  admin: 'ADMIN',
  employee: 'EMPLOYEE',
  counter: 'COUNTER',
  vendor: 'VENDOR',
} as const;

export type AppRole = (typeof APP_ROLES)[keyof typeof APP_ROLES];

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  employeeId: string;
  department: string;
  role: AppRole;
}

export interface LoginRequest {
  employeeId: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  name: string;
  role: AppRole | string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: AppRole | string;
  employeeId: string;
  department: string;
}