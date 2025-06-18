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