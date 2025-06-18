import { createAsyncThunk } from "@reduxjs/toolkit";
import userService, {
  type RegisterResponse,
  type LoginResponse,
} from "@/services/user.service";
import type { RegisterData, LoginData } from "./auth.types";

// Register user
export const register = createAsyncThunk<
  RegisterResponse,
  RegisterData,
  { rejectValue: string }
>("auth/register", async (registerData, { rejectWithValue }) => {
  try {
    const response = await userService.register(registerData);
    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Registration failed";
    return rejectWithValue(errorMessage);
  }
});

// Login user
export const login = createAsyncThunk<
  LoginResponse,
  LoginData,
  { rejectValue: string }
>("auth/login", async (loginData, { rejectWithValue }) => {
  try {
    const response = await userService.login(loginData);
    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Login failed";
    return rejectWithValue(errorMessage);
  }
});

// Logout user
export const logout = createAsyncThunk("auth/logout", async () => {
  // This is a simple action that doesn't need API call
  return null;
});
