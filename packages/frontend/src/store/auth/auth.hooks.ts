import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { register, login, logout } from "./auth.thunks";
import type { RegisterData, LoginData } from "./auth.types";

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  return !!(token && user);
};

export const validateAndCleanToken = (): boolean => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  if (!token || !user) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return false;
  }

  try {
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return false;
    }

    const payload = JSON.parse(atob(tokenParts[1]));
    const currentTime = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < currentTime) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return false;
    }

    return true;
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return false;
  }
};

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const {
    user,
    token,
    isLoading,
    error,
    isAuthenticated: authState,
  } = useAppSelector((state) => state.auth);

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
