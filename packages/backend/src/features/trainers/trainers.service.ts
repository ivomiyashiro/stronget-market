import {
  GetTrainerStatisticsResponseDTO,
  GetTrainerNotificationResponse,
} from "./dtos";

import User from "../user/user.model";
import Service from "../services/services.model";
import Hiring from "../hiring/hiring.model";

export class TrainersService {
  async getTrainerStatistics(
    id: string
  ): Promise<GetTrainerStatisticsResponseDTO | null> {
    const trainer = await User.findById(id);
    const services = await Service.find({ trainerId: id });
    const clients = await Hiring.find({ trainerId: id });

    if (!trainer) return null;

    return {
      totalServices: services.length,
      totalClients: clients.length,
      visits: services.reduce(
        (acc, service) => acc + (service.visualizations as number),
        0
      ),
      averageRating: 0,
      performance: clients.length / services.length,
    };
  }

  async getTrainerNotifications(
    id: string
  ): Promise<GetTrainerNotificationResponse[]> {
    const user = await User.findById(id).populate("notifications");

    if (!user || !user.notifications) return [];

    return user.notifications
      .filter((notification) => !notification.leido)
      .map((notification) => ({
        id: notification._id,
        message: notification.message,
        leido: notification.leido,
        date: notification.date,
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async updateSeenNotifications(id: string): Promise<void> {
    await User.updateMany(
      { _id: id, "notifications.leido": false },
      { $set: { "notifications.$.leido": true } }
    );
  }

  async markNotificationAsRead(
    id: string,
    notificationId: string
  ): Promise<void> {
    await User.updateOne(
      {
        _id: id,
        "notifications._id": notificationId,
      },
      {
        $set: {
          "notifications.$.leido": true,
        },
      }
    );
  }
}
