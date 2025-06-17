import Hiring from "./hiring.model";
import Service from "../services/services.model";
import { Types } from "mongoose";
import { CreateHiringRequestDTO, CreateHiringResponseDTO } from "./dtos";

export class HiringService {
  async createHiring(
    clientId: string,
    hiringData: CreateHiringRequestDTO
  ): Promise<CreateHiringResponseDTO> {
    // Get service to obtain trainer info
    const service = await Service.findById(hiringData.serviceId).populate(
      "trainerId",
      "name"
    );

    if (!service) {
      throw new Error("Service not found");
    }

    const hiring = new Hiring({
      ...hiringData,
      clientId: new Types.ObjectId(clientId),
      trainerId: (service.trainerId as any)._id,
    });

    await hiring.save();

    // Populate for response
    const populatedHiring = await Hiring.findById(hiring._id)
      .populate("clientId", "name")
      .populate("trainerId", "name");

    return {
      id: (populatedHiring as any)._id.toString(),
      serviceId: (populatedHiring as any).serviceId.toString(),
      date: (populatedHiring as any).date,
      client: {
        id: (populatedHiring as any).clientId._id.toString(),
        name: (populatedHiring as any).clientId.name,
      },
      trainer: {
        id: (populatedHiring as any).trainerId._id.toString(),
        name: (populatedHiring as any).trainerId.name,
      },
    };
  }

  async getHiringsByClientId(clientId: string) {
    return Hiring.find({ clientId: new Types.ObjectId(clientId) })
      .populate("serviceId", "category description duration price")
      .populate("trainerId", "name surname profileImage")
      .sort({ date: -1 });
  }

  async getHiringsByTrainerId(trainerId: string) {
    return Hiring.find({ trainerId: new Types.ObjectId(trainerId) })
      .populate("serviceId", "category description duration price")
      .populate("clientId", "name surname profileImage")
      .sort({ date: -1 });
  }

  async getHiringById(id: string) {
    return Hiring.findById(id)
      .populate("serviceId", "category description duration price")
      .populate("clientId", "name surname profileImage")
      .populate("trainerId", "name surname profileImage");
  }

  async updateHiringStatus(id: string, status: string, userId: string) {
    const hiring = await Hiring.findById(id);

    if (!hiring) {
      throw new Error("Hiring not found");
    }

    // Check if user has permission to update (client or trainer)
    const isOwner =
      hiring.clientId.toString() === userId || hiring.trainerId.toString() === userId;
    if (!isOwner) {
      throw new Error("You don't have permission to update this hiring");
    }

    hiring.status = status as any;
    hiring.updatedAt = new Date();
    await hiring.save();

    return hiring;
  }

  async cancelHiring(id: string, userId: string) {
    return this.updateHiringStatus(id, "cancelled", userId);
  }
}
