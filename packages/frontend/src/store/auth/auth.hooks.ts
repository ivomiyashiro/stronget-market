import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { register, login, logout } from "./auth.thunks";
import type { RegisterData, LoginData } from "./auth.types";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, token, isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

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
    isAuthenticated,
    registerUser,
    loginUser,
    logoutUser,
  };
}; 