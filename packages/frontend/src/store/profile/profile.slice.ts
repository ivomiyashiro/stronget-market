import { createSlice } from "@reduxjs/toolkit";
import type { ProfileState } from "./profile.types";
import {
  fetchProfile,
  updateProfile,
  uploadAvatar,
  clearProfile,
} from "./profile.thunks";

const initialState: ProfileState = {
  data: null,
  isLoading: false,
  error: null,
};

export const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch profile";
      });

    builder
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update profile";
      });

    builder
      .addCase(uploadAvatar.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;

        if (state.data) {
          state.data.avatar = action.payload.avatarUrl;
        }
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to upload avatar";
      });

    builder.addCase(clearProfile.fulfilled, (state) => {
      state.data = null;
      state.error = null;
      state.isLoading = false;
    });
  },
});

export const { clearError } = profileSlice.actions;
export default profileSlice.reducer;
