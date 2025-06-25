import { baseService } from "./base.service";

export interface TrainerEvaluation {
  id: string;
  serviceId: string;
  trainerId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export class TrainerEvaluationsService {
  async getTrainerEvaluations(trainerId: string): Promise<TrainerEvaluation[]> {
    return await baseService.get<TrainerEvaluation[]>(
      `/reviews/trainer/${trainerId}`
    );
  }
}

export const trainerEvaluationsService = new TrainerEvaluationsService();
