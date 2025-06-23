import type { TrainerEvaluation } from "@/services/trainer-evaluations.service";

export interface TrainerEvaluationsState {
  evaluations: TrainerEvaluation[];
  loading: boolean;
  error: string | null;
}

export interface GetTrainerEvaluationsPayload {
  trainerId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
} 