import { Types } from "mongoose";

export type GetTrainerNotificationResponse = {
    id: Types.ObjectId;
    message: string;
    leido: boolean;
    date: Date;
};
