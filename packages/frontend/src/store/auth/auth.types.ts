import type { RegisterRequest, LoginRequest } from "@/services/user.service";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export type RegisterData = RegisterRequest;
export type LoginData = LoginRequest; 