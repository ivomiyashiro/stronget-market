import { Types } from "mongoose";

export type GetServicesResponseDTO = {
  id: Types.ObjectId;
  category: string;
  description: string;
  duration: number;
  price: number;
  mode: "online" | "in-person";
  zone: string;
  language: string;
  trainerImage: string;
};
