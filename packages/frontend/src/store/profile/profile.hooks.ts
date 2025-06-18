import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchProfile, updateProfile, clearProfile } from "./profile.thunks";
import type { Profile } from "./profile.types";

export const useProfile = () => {
  const dispatch = useAppDispatch();
  const { data: profile, isLoading, error } = useAppSelector((state) => state.profile);

  const fetchUserProfile = useCallback(
    (userId: string) => {
      return dispatch(fetchProfile(userId));
    },
    [dispatch]
  );

  const updateUserProfile = useCallback(
    (userId: string, profileData: Partial<Profile>) => {
      return dispatch(updateProfile({ userId, profileData }));
    },
    [dispatch]
  );

  const clearUserProfile = useCallback(() => {
    return dispatch(clearProfile());
  }, [dispatch]);

  return {
    profile,
    isLoading,
    error,
    fetchUserProfile,
    updateUserProfile,
    clearUserProfile,
  };
}; 