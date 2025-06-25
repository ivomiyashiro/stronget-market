import { Types } from "mongoose";

export type GetServicesResponseDTO = {
    id: Types.ObjectId;
    trainerName: string;
    category: string;
    description: string;
    duration: number;
    price: number;
    mode: "online" | "in-person";
    zone: string;
    language: string;
    availability: {
        day: string;
        startTime: string;
    }[];
    trainerImage: string;
    rating: number;
    pendings: number;
    totalReviews: number;
    visualizations: number;
    clients: number;
    trainerId: Types.ObjectId;
    hiringId?: Types.ObjectId; // Optional hiring ID for client services
    files: string[];
};
