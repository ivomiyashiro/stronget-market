import { createAsyncThunk } from "@reduxjs/toolkit";
import type { Profile } from "./profile.types";
import userService from "@/services/user.service";

export const fetchProfile = createAsyncThunk<
  Profile,
  string,
  { rejectValue: string }
>("profile/fetchProfile", async (userId: string, { rejectWithValue }) => {
  try {
    const response = await userService.getUser(userId);
    return response as Profile;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch profile";
    return rejectWithValue(errorMessage);
  }
});

export const updateProfile = createAsyncThunk<
  Profile,
  { userId: string; profileData: Partial<Profile> },
  { rejectValue: string }
>(
  "profile/updateProfile",
  async ({ userId, profileData }, { rejectWithValue }) => {
    try {
      const response = await userService.put(`/users/${userId}`, profileData);

      return response as Profile;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update profile";
      return rejectWithValue(errorMessage);
    }
  }
);

export const uploadAvatar = createAsyncThunk<
  { avatarUrl: string },
  { userId: string; file: File },
  { rejectValue: string }
>("profile/uploadAvatar", async ({ userId, file }, { rejectWithValue }) => {
  try {
    const response = await userService.uploadAvatar(userId, file);

    return { avatarUrl: response.avatarUrl };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to upload avatar";
    return rejectWithValue(errorMessage);
  }
});

export const clearProfile = createAsyncThunk(
  "profile/clearProfile",
  async () => {
    return null;
  }
);
