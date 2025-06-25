import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { NotificationsState, Notification } from "./notifications.types";
import { fetchNotifications, markNotificationAsRead } from "./notifications.thunks";

const initialState: NotificationsState = {
  notifications: [],
  isLoading: false,
  error: null,
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
      state.error = null;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
    },
    markNotificationAsReadLocal: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (notif) => notif.id === action.payload
      );
      if (notification) {
        notification.leido = true;
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach((notification) => {
        notification.leido = true;
      });
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload;
        state.error = null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || "Failed to fetch notifications";
      })
      // Mark notification as read
      .addCase(markNotificationAsRead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.isLoading = false;
        // Mark the specific notification as read
        const notification = state.notifications.find(
          (notif) => notif.id === action.payload
        );
        if (notification) {
          notification.leido = true;
        }
        state.error = null;
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || "Failed to mark notification as read";
      });
  },
});

export const {
  setNotifications,
  addNotification,
  markNotificationAsReadLocal,
  markAllNotificationsAsRead,
  clearNotifications,
  setLoading,
  setError,
} = notificationsSlice.actions;

export default notificationsSlice.reducer; 