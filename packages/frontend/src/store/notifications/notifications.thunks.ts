import { createAsyncThunk } from "@reduxjs/toolkit";
import { trainerService } from "@/services/trainer.service";
import type { GetNotificationsPayload, MarkNotificationAsReadPayload } from "./notifications.types";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (payload: GetNotificationsPayload, { rejectWithValue }) => {
    try {
      const notifications = await trainerService.getTrainerNotifications(payload.id);
      return notifications;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch notifications";
      return rejectWithValue(errorMessage);
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  "notifications/markNotificationAsRead",
  async (payload: MarkNotificationAsReadPayload, { rejectWithValue }) => {
    try {
      await trainerService.markNotificationAsRead(payload.userId, payload.id);
      return payload.id; // Return the notification ID to update the local state
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to mark notification as read";
      return rejectWithValue(errorMessage);
    }
  }
);

export const markAllNotificationsAsSeen = createAsyncThunk(
  "notifications/markAllNotificationsAsSeen",
  async (payload: GetNotificationsPayload, { rejectWithValue }) => {
    try {
      const result = await trainerService.updateSeenNotifications(payload.id);
      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to mark all notifications as seen";
      return rejectWithValue(errorMessage);
    }
  }
); 