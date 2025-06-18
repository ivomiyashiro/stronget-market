import type { RegisterRequest, LoginRequest } from "@/services/user.service";

export interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
  birthDay: string;
  role: "cliente" | "entrenador";
  profileImage?: string;
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
