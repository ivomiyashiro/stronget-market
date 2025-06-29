import { createAsyncThunk } from "@reduxjs/toolkit";
import { trainerService } from "@/services/trainer.service";
import type {
  GetTrainerByIdPayload,
  GetTrainerStatisticsPayload,
  GetTrainerNotificationsPayload,
  UpdateSeenNotificationsPayload,
} from "./trainer.types";

export const getTrainerById = createAsyncThunk(
  "trainer/getTrainerById",
  async (payload: GetTrainerByIdPayload, { rejectWithValue }) => {
    try {
      const trainer = await trainerService.getTrainerById(payload.id);

      if (payload.onSuccess) {
        payload.onSuccess();
      }

      return trainer;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch trainer";

      if (payload.onError) {
        payload.onError(errorMessage);
      }

      return rejectWithValue(errorMessage);
    }
  }
);

export const getTrainerStatistics = createAsyncThunk(
  "trainer/getTrainerStatistics",
  async (payload: GetTrainerStatisticsPayload, { rejectWithValue }) => {
    try {
      const statistics = await trainerService.getTrainerStatistics(payload.id);

      if (payload.onSuccess) {
        payload.onSuccess();
      }

      return statistics;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch trainer statistics";

      if (payload.onError) {
        payload.onError(errorMessage);
      }

      return rejectWithValue(errorMessage);
    }
  }
);

export const getTrainerNotifications = createAsyncThunk(
  "trainer/getTrainerNotifications",
  async (payload: GetTrainerNotificationsPayload, { rejectWithValue }) => {
    try {
      const notifications = await trainerService.getTrainerNotifications(
        payload.id
      );

      if (payload.onSuccess) {
        payload.onSuccess();
      }

      return notifications;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch trainer notifications";

      if (payload.onError) {
        payload.onError(errorMessage);
      }

      return rejectWithValue(errorMessage);
    }
  }
);

export const updateSeenNotifications = createAsyncThunk(
  "trainer/updateSeenNotifications",
  async (payload: UpdateSeenNotificationsPayload, { rejectWithValue }) => {
    try {
      const result = await trainerService.updateSeenNotifications(payload.id);

      if (payload.onSuccess) {
        payload.onSuccess();
      }

      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update seen notifications";

      if (payload.onError) {
        payload.onError(errorMessage);
      }

      return rejectWithValue(errorMessage);
    }
  }
);
