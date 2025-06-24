import { GetTrainerStatisticsResponseDTO, GetTrainerNotificationResponse } from "./dtos";

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
            visits: services.reduce((acc, service) => acc + service.visualizations, 0),
            averageRating: 0,
            performance: clients.length / services.length,
        };
    }

    async getTrainerNotifications(id: string): Promise<GetTrainerNotificationResponse[]> {
        const user = await User.findById(id);

        if (!user || !user.notifications) return [];

        return user.notifications.map((notification) => ({
            id: notification._id,
            message: notification.message,
            leido: notification.leido,
            date: notification.date,
        }));
    }

    async updateSeenNotifications(id: string): Promise<void> {
        await User.updateMany(
            { _id: id, "notifications.leido": false },
            { $set: { "notifications.$.leido": true } }
        );
    }
}
