import { useSelector } from "react-redux";
import type { RootState } from "../store";

export const useCurrentTrainer = () =>
  useSelector((state: RootState) => state.trainer.currentTrainer);

export const useTrainerStatistics = () =>
  useSelector((state: RootState) => state.trainer.trainerStatistics);

export const useTrainerNotifications = () =>
  useSelector((state: RootState) => state.trainer.trainerNotifications);

export const useTrainerLoading = () =>
  useSelector((state: RootState) => state.trainer.loading);

export const useTrainerError = () =>
  useSelector((state: RootState) => state.trainer.error); 