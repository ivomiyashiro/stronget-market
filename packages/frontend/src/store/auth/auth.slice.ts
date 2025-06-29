import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, User } from "./auth.types";
import { register, login, logout } from "./auth.thunks";
import { updateProfile, uploadAvatar } from "../profile/profile.thunks";

const getInitialState = (): AuthState => {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);

      const tokenParts = token.split(".");
      if (tokenParts.length === 3) {
        try {
          const payload = JSON.parse(atob(tokenParts[1]));
          const currentTime = Math.floor(Date.now() / 1000);

          if (payload.exp && payload.exp < currentTime) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            return {
              user: null,
              token: null,
              isLoading: false,
              error: null,
              isAuthenticated: false,
            };
          }
        } catch {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
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
      localStorage.removeItem("token");
      localStorage.removeItem("user");
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
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Registration failed";
      });

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

        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Login failed";
      });

    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isLoading = false;

      localStorage.removeItem("token");
      localStorage.removeItem("user");
    });

    builder.addCase(updateProfile.fulfilled, (state, action) => {
      if (state.user) {
        state.user = {
          ...state.user,
          name: action.payload.name,
          surname: action.payload.surname,
          email: action.payload.email,
          birthDay: action.payload.birthDay,
          role: action.payload.role as "cliente" | "entrenador",
          avatar: action.payload.avatar,
        };

        localStorage.setItem("user", JSON.stringify(state.user));
      }
    });

    builder.addCase(uploadAvatar.fulfilled, (state, action) => {
      if (state.user) {
        state.user.avatar = action.payload.avatarUrl;

        localStorage.setItem("user", JSON.stringify(state.user));
      }
    });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
