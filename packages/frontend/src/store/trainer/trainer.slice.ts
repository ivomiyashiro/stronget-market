import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { TrainerState } from "./trainer.types";
import type { Trainer, TrainerStatistics, TrainerNotification } from "@/services/trainer.service";
import {
  getTrainerById,
  getTrainerStatistics,
  getTrainerNotifications,
  updateSeenNotifications,
} from "./trainer.thunks";

const initialState: TrainerState = {
  currentTrainer: null,
  trainerStatistics: null,
  trainerNotifications: [],
  loading: false,
  error: null,
};

const trainerSlice = createSlice({
  name: "trainer",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setCurrentTrainer: (state, action: PayloadAction<Trainer | null>) => {
      state.currentTrainer = action.payload;
    },
    setTrainerStatistics: (state, action: PayloadAction<TrainerStatistics | null>) => {
      state.trainerStatistics = action.payload;
    },
    setTrainerNotifications: (state, action: PayloadAction<TrainerNotification[]>) => {
      state.trainerNotifications = action.payload;
    },
    clearTrainerData: (state) => {
      state.currentTrainer = null;
      state.trainerStatistics = null;
      state.trainerNotifications = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // getTrainerById
    builder
      .addCase(getTrainerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTrainerById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTrainer = action.payload;
      })
      .addCase(getTrainerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // getTrainerStatistics
    builder
      .addCase(getTrainerStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTrainerStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.trainerStatistics = action.payload;
      })
      .addCase(getTrainerStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // getTrainerNotifications
    builder
      .addCase(getTrainerNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTrainerNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.trainerNotifications = action.payload;
      })
      .addCase(getTrainerNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // updateSeenNotifications
    builder
      .addCase(updateSeenNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSeenNotifications.fulfilled, (state) => {
        state.loading = false;
        // Mark all notifications as read
        state.trainerNotifications = state.trainerNotifications.map(notification => ({
          ...notification,
          leido: true,
        }));
      })
      .addCase(updateSeenNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setLoading,
  setError,
  setCurrentTrainer,
  setTrainerStatistics,
  setTrainerNotifications,
  clearTrainerData,
} = trainerSlice.actions;

export default trainerSlice.reducer; 