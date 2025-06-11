import { Types } from "mongoose";
import Trainer from "./trainers.model";
import {
    GetTrainerResponseDTO,
    GetTrainerStatisticsResponseDTO,
    GetTrainerNotificationResponse,
} from "./dtos";

export class TrainersService {
    async getTrainerById(id: string): Promise<GetTrainerResponseDTO | null> {
        const trainer = await Trainer.findById(id);
        if (!trainer) return null;
        return {
            id: trainer._id,
            name: trainer.name,
            surname: trainer.surname,
            specialty: trainer.specialty,
            experience: trainer.experience,
            averageCalification: trainer.averageCalification,
            profileImage: trainer.profileImage || "",
        };
    }

    async getTrainerStatistics(
        id: string
    ): Promise<GetTrainerStatisticsResponseDTO | null> {
        const trainer = await Trainer.findById(id);
        if (!trainer) return null;
        return {
            totalServices: trainer.totalServices,
            totalClients: trainer.totalClients,
            visits: trainer.visits,
            averageRating: trainer.averageRating,
            performance: trainer.performance,
        };
    }

    async getTrainerNotifications(id: string): Promise<GetTrainerNotificationResponse[]> {
        const trainer = await Trainer.findById(id);
        if (!trainer) return [];
        return trainer.notifications.map((n: any) => ({
            id: n._id,
            message: n.message,
            leido: n.leido,
            date: n.date,
        }));
    }

    async updateSeenNotifications(id: string): Promise<void> {
        await Trainer.updateMany(
            { _id: id, "notifications.leido": false },
            { $set: { "notifications.$.leido": true } }
        );
    }
}
