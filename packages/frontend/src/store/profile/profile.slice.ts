import { createSlice } from "@reduxjs/toolkit";
import type { ProfileState } from "./profile.types";
import { fetchProfile, updateProfile, clearProfile } from "./profile.thunks";

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
    // Fetch Profile
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

    // Update Profile
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

    // Clear Profile
    builder
      .addCase(clearProfile.fulfilled, (state) => {
        state.data = null;
        state.error = null;
        state.isLoading = false;
      });
  },
});

export const { clearError } = profileSlice.actions;
export default profileSlice.reducer;
