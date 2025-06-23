import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { TrainerEvaluationsState } from "./trainer-evaluations.types";
import type { TrainerEvaluation } from "@/services/trainer-evaluations.service";
import { getTrainerEvaluations } from "@/store/trainer-evaluations/trainer-evaluations.thunks";

const initialState: TrainerEvaluationsState = {
  evaluations: [],
  loading: false,
  error: null,
};

const trainerEvaluationsSlice = createSlice({
  name: "trainerEvaluations",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setEvaluations: (state, action: PayloadAction<TrainerEvaluation[]>) => {
      state.evaluations = action.payload;
    },
    clearEvaluations: (state) => {
      state.evaluations = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // getTrainerEvaluations
    builder
      .addCase(getTrainerEvaluations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTrainerEvaluations.fulfilled, (state, action) => {
        state.loading = false;
        state.evaluations = action.payload;
      })
      .addCase(getTrainerEvaluations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setLoading, setError, setEvaluations, clearEvaluations } =
  trainerEvaluationsSlice.actions;

export default trainerEvaluationsSlice.reducer;
