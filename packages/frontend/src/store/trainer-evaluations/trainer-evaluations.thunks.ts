import { createAsyncThunk } from "@reduxjs/toolkit";
import { trainerEvaluationsService } from "@/services/trainer-evaluations.service";
import type { GetTrainerEvaluationsPayload } from "./trainer-evaluations.types";

export const getTrainerEvaluations = createAsyncThunk(
  "trainerEvaluations/getTrainerEvaluations",
  async (payload: GetTrainerEvaluationsPayload, { rejectWithValue }) => {
    try {
      const evaluations = await trainerEvaluationsService.getTrainerEvaluations(
        payload.trainerId
      );

      if (payload.onSuccess) {
        payload.onSuccess();
      }

      return evaluations;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch trainer evaluations";

      if (payload.onError) {
        payload.onError(errorMessage);
      }

      return rejectWithValue(errorMessage);
    }
  }
);
