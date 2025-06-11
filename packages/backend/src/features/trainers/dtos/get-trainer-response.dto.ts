import { Types } from "mongoose";

export type GetTrainerResponseDTO = {
    id: Types.ObjectId;
    name: string;
    surname: string;
    specialty: string;
    experience: string;
    averageCalification: number;
    profileImage: string;
};
