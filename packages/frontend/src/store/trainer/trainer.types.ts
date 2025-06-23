import type { Trainer, TrainerStatistics, TrainerNotification } from "@/services/trainer.service";

export interface TrainerState {
  currentTrainer: Trainer | null;
  trainerStatistics: TrainerStatistics | null;
  trainerNotifications: TrainerNotification[];
  loading: boolean;
  error: string | null;
}

export interface GetTrainerByIdPayload {
  id: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export interface GetTrainerStatisticsPayload {
  id: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export interface GetTrainerNotificationsPayload {
  id: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export interface UpdateSeenNotificationsPayload {
  id: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
} 