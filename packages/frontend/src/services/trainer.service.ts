import { baseService } from "./base.service";

export interface Trainer {
  id: string;
  name: string;
  surname: string;
  specialty: string;
  experience: string;
  averageCalification: number;
  profileImage: string;
}

export interface TrainerStatistics {
  totalServices: number;
  totalClients: number;
  visits: number;
  averageRating: number;
  performance: number;
}

export interface TrainerNotification {
  id: string;
  message: string;
  leido: boolean;
  date: string;
}

export class TrainerService {
  async getTrainerById(id: string): Promise<Trainer> {
    return await baseService.get<Trainer>(`/trainers/${id}`);
  }

  async getTrainerStatistics(id: string): Promise<TrainerStatistics> {
    return await baseService.get<TrainerStatistics>(
      `/trainers/${id}/statistics`
    );
  }

  async getTrainerNotifications(id: string): Promise<TrainerNotification[]> {
    return await baseService.get<TrainerNotification[]>(
      `/trainers/${id}/notifications`
    );
  }

  async updateSeenNotifications(id: string): Promise<{ message: string }> {
    return await baseService.put<{ message: string }>(
      `/trainers/${id}/notifications/seen`
    );
  }

  async markNotificationAsRead(
    id: string,
    notificationId: string
  ): Promise<{ message: string }> {
    return await baseService.put<{ message: string }>(
      `/trainers/${id}/notifications/${notificationId}/read`
    );
  }
}

export const trainerService = new TrainerService();
