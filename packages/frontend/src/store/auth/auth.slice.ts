import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, User } from "./auth.types";
import { register, login, logout } from "./auth.thunks";
import { updateProfile, uploadAvatar } from "../profile/profile.thunks";

// Initialize state from localStorage if available
const getInitialState = (): AuthState => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      
      // Validate token structure and expiration
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        try {
          const payload = JSON.parse(atob(tokenParts[1]));
          const currentTime = Math.floor(Date.now() / 1000);
          
          // Check if token is expired
          if (payload.exp && payload.exp < currentTime) {
            // Token is expired, clear localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return {
              user: null,
              token: null,
              isLoading: false,
              error: null,
              isAuthenticated: false,
            };
          }
        } catch {
          // If payload parsing fails, clear localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return {
            user: null,
            token: null,
            isLoading: false,
            error: null,
            isAuthenticated: false,
          };
        }
      }
      
      return {
        user,
        token,
        isLoading: false,
        error: null,
        isAuthenticated: true,
      };
    } catch {
      // If parsing fails, clear localStorage and return default state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
  
  return {
    user: null,
    token: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
  };
};

const initialState: AuthState = getInitialState();

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
        // Registration successful, but user needs to login
        // Don't set authentication state here
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Registration failed";
      });

    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        
        // Save to localStorage
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Login failed";
      });

    // Logout
    builder
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.isLoading = false;
        
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      });

    // Update Profile - Sync with auth state
    builder
      .addCase(updateProfile.fulfilled, (state, action) => {
        if (state.user) {
          // Update the user in auth state with the new profile data
          state.user = {
            ...state.user,
            name: action.payload.name,
            surname: action.payload.surname,
            email: action.payload.email,
            birthDay: action.payload.birthDay,
            role: action.payload.role as "cliente" | "entrenador",
            avatar: action.payload.avatar,
          };
          
          // Update localStorage
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      });

    // Upload Avatar - Sync with auth state
    builder
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        if (state.user) {
          // Update the avatar URL in auth state
          state.user.avatar = action.payload.avatarUrl;
          
          // Update localStorage
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer; 