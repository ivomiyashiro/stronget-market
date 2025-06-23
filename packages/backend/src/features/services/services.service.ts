import Service from "./services.model";
import { Types } from "mongoose";
import {
  CreateServiceRequestDTO,
  GetServicesParams,
  GetServicesResponseDTO,
  UpdateServiceRequestDTO,
} from "./dtos";
import Hiring from "../hiring/hiring.model";
import Review from "../reviews/reviews.model";
import User from "../user/user.model";

export class ServicesService {
  async createService(trainerId: string, serviceData: CreateServiceRequestDTO) {
    const service = new Service({
      ...serviceData,
      trainerId: new Types.ObjectId(trainerId),
    });
    await service.save();
    return service;
  }

  async getServices(params: GetServicesParams): Promise<GetServicesResponseDTO[]> {
    const query: any = { isActive: true };

    if (params.category) query.category = params.category;
    if (params.zone) query.zone = params.zone;
    if (params.mode) query.mode = params.mode;
    if (params.language) query.language = params.language;
    if (params.minPrice) query.price = { $gte: params.minPrice };
    if (params.maxPrice) {
      query.price = { ...query.price, $lte: params.maxPrice };
    }
    if (params.duration) query.duration = params.duration;

    const services = await Service.find(query)
      .populate("trainerId", "name surname profileImage averageCalification avatar")
      .sort({ createdAt: -1 });

    if (services.length === 0) {
      return [];
    }

    // Get statistics for each service
    const servicesWithStats = await Promise.all(
      services.map(async (service: any) => {
        const pendings = await Hiring.countDocuments({
          serviceId: service._id,
          status: "pending",
        });

        const totalReviews = await Review.countDocuments({
          serviceId: service._id,
        });

        const ratingResult = await Review.aggregate([
          { $match: { serviceId: service._id } },
          { $group: { _id: null, average: { $avg: "$calification" } } },
        ]);

        const clients = await Hiring.countDocuments({
          serviceId: service._id,
        });

        const trainer = (await User.findById(service.trainerId)) as any;

        return {
          id: service._id,
          category: service.category,
          description: service.description,
          duration: service.duration,
          price: service.price,
          mode: service.mode,
          zone: service.zone,
          language: service.language,
          availability: service.availability,
          trainerImage: trainer?.avatar || "",
          rating: ratingResult[0]?.average || 0,
          pendings: pendings,
          totalReviews: totalReviews,
          visualizations: service.visualizations,
          clients: clients,
          trainerId: trainer?._id || new Types.ObjectId(),
        };
      })
    );

    return servicesWithStats;
  }

  async getServiceById(id: string): Promise<GetServicesResponseDTO> {
    const service = await Service.findById(id).populate(
      "trainerId",
      "name surname profileImage averageCalification avatar"
    );

    if (!service) {
      throw new Error("Service not found");
    }

    const pendings = await Hiring.countDocuments({
      serviceId: service._id,
      status: "pending",
    });

    const totalReviews = await Review.countDocuments({
      serviceId: service._id,
    });

    const ratingResult = await Review.aggregate([
      { $match: { serviceId: service._id } },
      { $group: { _id: null, average: { $avg: "$calification" } } },
    ]);

    const clients = await Hiring.countDocuments({
      serviceId: service._id,
    });

    const trainer = (await User.findById(service.trainerId)) as any;

    return {
      id: service._id,
      category: service.category,
      description: service.description,
      duration: service.duration,
      price: service.price,
      mode: service.mode,
      zone: service.zone,
      language: service.language,
      availability: service.availability,
      trainerImage: trainer?.avatar || "",
      rating: ratingResult[0]?.average || 0,
      pendings: pendings,
      totalReviews: totalReviews,
      visualizations: service.visualizations,
      clients: clients,
      trainerId: trainer?._id || new Types.ObjectId(),
    };
  }

  async getServicesByTrainerId(trainerId: string) {
    const services = await Service.find({
      trainerId: new Types.ObjectId(trainerId),
      isActive: true,
    })
      .populate("trainerId", "name surname profileImage averageCalification avatar")
      .sort({ createdAt: -1 });

    if (services.length === 0) {
      return [];
    }

    // Get statistics for each service
    const servicesWithStats = await Promise.all(
      services.map(async (service: any) => {
        const pendings = await Hiring.countDocuments({
          serviceId: service._id,
          status: "pending",
        });

        const totalReviews = await Review.countDocuments({
          serviceId: service._id,
        });

        const ratingResult = await Review.aggregate([
          { $match: { serviceId: service._id } },
          { $group: { _id: null, average: { $avg: "$calification" } } },
        ]);

        const clients = await Hiring.countDocuments({
          serviceId: service._id,
        });

        const trainer = (await User.findById(service.trainerId)) as any;

        return {
          id: service._id,
          category: service.category,
          description: service.description,
          duration: service.duration,
          price: service.price,
          mode: service.mode,
          zone: service.zone,
          language: service.language,
          availability: service.availability,
          trainerImage: trainer?.avatar || "",
          rating: ratingResult[0]?.average || 0,
          pendings: pendings,
          totalReviews: totalReviews,
          visualizations: service.visualizations,
          clients: clients,
          trainerId: trainer?._id || new Types.ObjectId(),
        };
      })
    );

    return servicesWithStats;
  }

  async deleteService(id: string, trainerId: string) {
    const service = await Service.findOne({
      _id: new Types.ObjectId(id),
      trainerId: new Types.ObjectId(trainerId),
    });

    if (!service) {
      throw new Error("Service not found or you don't have permission to delete it");
    }

    await Service.findByIdAndDelete(id);
    return { message: "Service deleted successfully" };
  }

  async updateService(
    id: string,
    trainerId: string,
    serviceData: UpdateServiceRequestDTO
  ) {
    const service = await Service.findOne({
      _id: new Types.ObjectId(id),
      trainerId: new Types.ObjectId(trainerId),
    });

    if (!service) {
      throw new Error("Service not found or you don't have permission to update it");
    }

    Object.assign(service, serviceData);
    await service.save();
    return service;
  }
}
