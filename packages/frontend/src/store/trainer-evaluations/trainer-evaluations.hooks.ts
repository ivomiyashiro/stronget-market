import { useSelector } from "react-redux";
import type { RootState } from "../store";

export const useTrainerEvaluations = () =>
  useSelector((state: RootState) => state.trainerEvaluations.evaluations);

export const useTrainerEvaluationsLoading = () =>
  useSelector((state: RootState) => state.trainerEvaluations.loading);

export const useTrainerEvaluationsError = () =>
  useSelector((state: RootState) => state.trainerEvaluations.error); 