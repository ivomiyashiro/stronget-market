import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { register, login, logout } from "./auth.thunks";
import type { RegisterData, LoginData } from "./auth.types";

// Utility function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

// Utility function to validate and clean up expired tokens
export const validateAndCleanToken = (): boolean => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (!token || !user) {
    // Clear any partial data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return false;
  }

  try {
    // Basic JWT validation - check if token is malformed
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }

    // Decode the payload to check expiration
    const payload = JSON.parse(atob(tokenParts[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    if (payload.exp && payload.exp < currentTime) {
      // Token is expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }

    return true;
  } catch {
    // If there's any error parsing the token, clear it
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return false;
  }
};

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, token, isLoading, error, isAuthenticated: authState } = useAppSelector((state) => state.auth);

  const registerUser = useCallback(
    (registerData: RegisterData) => {
      return dispatch(register(registerData));
    },
    [dispatch]
  );

  const loginUser = useCallback(
    (loginData: LoginData) => {
      return dispatch(login(loginData));
    },
    [dispatch]
  );

  const logoutUser = useCallback(() => {
    return dispatch(logout());
  }, [dispatch]);

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated: authState,
    registerUser,
    loginUser,
    logoutUser,
  };
}; 