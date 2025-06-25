import { Types } from "mongoose";

export type GetServiceClientsResponseDTO = {
    id: Types.ObjectId;
    name: string;
    email: string;
    avatarUrl: string;
    hiringId: Types.ObjectId;
    status: "pending" | "confirmed" | "cancelled" | "rejected" | "completed";
    day: string;
    time: string;
    birthDate: Date;
}[];
