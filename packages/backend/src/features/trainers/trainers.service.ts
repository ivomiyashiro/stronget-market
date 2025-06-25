import { GetTrainerStatisticsResponseDTO, GetTrainerNotificationResponse } from "./dtos";

import User from "../user/user.model";
import Service from "../services/services.model";
import Hiring from "../hiring/hiring.model";
import Review from "../reviews/reviews.model";

export class TrainersService {
    async getTrainerStatistics(
        id: string
    ): Promise<GetTrainerStatisticsResponseDTO | null> {
        const trainer = await User.findById(id);
        if (!trainer) return null;

        const services = await Service.find({ trainerId: id });
        const hirings = await Hiring.find({ trainerId: id });
        const reviews = await Review.find({ trainerId: id });

        const totalVisualizations = services.reduce(
            (acc, service) => acc + (service.visualizations as number),
            0
        );

        const averageRating =
            reviews.length > 0
                ? reviews.reduce((acc, review) => acc + review.calification, 0) /
                  reviews.length
                : 0;

        const performance =
            totalVisualizations > 0 ? (hirings.length / totalVisualizations) * 100 : 0;

        return {
            totalServices: services.length,
            totalClients: hirings.length,
            visits: totalVisualizations,
            averageRating,
            performance,
        };
    }

    async getTrainerNotifications(id: string): Promise<GetTrainerNotificationResponse[]> {
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

    async markNotificationAsRead(id: string, notificationId: string): Promise<void> {
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
