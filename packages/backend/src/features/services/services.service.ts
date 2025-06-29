import Service from "./services.model";
import { Types } from "mongoose";
import {
  CreateServiceRequestDTO,
  GetServicesParams,
  GetServicesResponseDTO,
  UpdateServiceRequestDTO,
  GetFiltersResponseDTO,
  GetServiceClientsResponseDTO,
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

  async getServices(
    params: GetServicesParams
  ): Promise<GetServicesResponseDTO[]> {
    const query: any = { isActive: true };

    if (params.category) query.category = { $in: params.category.split(",") };
    if (params.zone) query.zone = { $in: params.zone.split(",") };
    if (params.mode) query.mode = { $in: params.mode.split(",") };
    if (params.language) query.language = { $in: params.language.split(",") };

    if (params.minPrice) query.price = { $gte: params.minPrice };
    if (params.maxPrice) {
      query.price = { ...query.price, $lte: params.maxPrice };
    }
    if (params.minDuration) query.duration = { $gte: params.minDuration };
    if (params.maxDuration) {
      query.duration = { ...query.duration, $lte: params.maxDuration };
    }

    let services;

    if (params.search) {
      const matchingTrainers = await User.find({
        $or: [
          { name: { $regex: params.search, $options: "i" } },
          { surname: { $regex: params.search, $options: "i" } },
        ],
      }).select("_id");

      const trainerIds = matchingTrainers.map((trainer) => trainer._id);

      query.$or = [
        { description: { $regex: params.search, $options: "i" } },
        { category: { $regex: params.search, $options: "i" } },
        { zone: { $regex: params.search, $options: "i" } },
        { language: { $regex: params.search, $options: "i" } },
        { mode: { $regex: params.search, $options: "i" } },
        { trainerId: { $in: trainerIds } },
      ];
    }

    services = await Service.find({ ...query, status: "active" })
      .populate(
        "trainerId",
        "name surname profileImage averageCalification avatar"
      )
      .sort({ createdAt: -1 });

    if (services.length === 0) {
      return [];
    }

    const servicesWithStats = await Promise.all(
      services.map(async (service: any) => {
        const pendings = await Hiring.countDocuments({
          serviceId: service._id,
          status: "pending",
        });

        const pendingHirings = await Hiring.find({
          serviceId: service._id,
          status: "pending",
        }).populate("clientId", "name email avatar");

        const validPendingHirings = pendingHirings.filter(
          (hiring: any) => hiring.clientId !== null
        );

        const pendingUsers = validPendingHirings.map((hiring: any) => ({
          id: hiring.clientId._id,
          name: `${hiring.clientId.name}`,
          email: hiring.clientId.email,
          avatarUrl: hiring.clientId.avatar || "",
          hiringId: hiring._id,
        }));

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
          trainerName: `${trainer?.name || ""} ${
            trainer?.surname || ""
          }`.trim(),
          category: service.category,
          description: service.description,
          duration: service.duration,
          price: service.price,
          mode: service.mode,
          zone: service.zone,
          language: service.language,
          maxPeople: service.maxPeople,
          status: service.status,
          availability: service.availability,
          trainerImage: trainer?.avatar || "",
          rating: ratingResult[0]?.average || 0,
          pendings: pendingUsers,
          totalReviews: totalReviews,
          visualizations: service.visualizations,
          clients: clients,
          trainerId: trainer?._id || new Types.ObjectId(),
          files: [],
        };
      })
    );

    return servicesWithStats;
  }

  async getClientServices(
    clientId: string,
    params: GetServicesParams = {}
  ): Promise<GetServicesResponseDTO[]> {
    const hiringQuery: any = {
      clientId: new Types.ObjectId(clientId),
    };

    const hirings = await Hiring.find(hiringQuery).populate({
      path: "serviceId",
      select:
        "category description duration price mode zone language availability trainerId visualizations isActive status",
      populate: {
        path: "trainerId",
        select: "name surname avatar",
      },
    });

    if (hirings.length === 0) {
      return [];
    }

    const validHirings = hirings.filter(
      (hiring: any) => hiring.serviceId !== null
    );

    if (validHirings.length === 0) {
      return [];
    }

    let filteredHirings = validHirings;

    if (
      params.category ||
      params.zone ||
      params.mode ||
      params.language ||
      params.minPrice ||
      params.maxPrice ||
      params.minDuration ||
      params.maxDuration ||
      params.search
    ) {
      filteredHirings = validHirings.filter((hiring: any) => {
        const service = hiring.serviceId;
        const trainer = service.trainerId;

        if (params.category) {
          const categories = params.category.split(",");
          if (!categories.includes(service.category)) return false;
        }

        if (params.zone) {
          const zones = params.zone.split(",");
          if (!zones.includes(service.zone)) return false;
        }

        if (params.mode) {
          const modes = params.mode.split(",");
          if (!modes.includes(service.mode)) return false;
        }

        if (params.language) {
          const languages = params.language.split(",");
          if (!languages.includes(service.language)) return false;
        }

        if (params.minPrice && service.price < params.minPrice) return false;
        if (params.maxPrice && service.price > params.maxPrice) return false;

        if (params.minDuration && service.duration < params.minDuration)
          return false;
        if (params.maxDuration && service.duration > params.maxDuration)
          return false;

        if (params.search) {
          const searchTerm = params.search.toLowerCase();
          const trainerName = `${trainer?.name || ""} ${
            trainer?.surname || ""
          }`.toLowerCase();

          const matchesSearch =
            service.description.toLowerCase().includes(searchTerm) ||
            service.category.toLowerCase().includes(searchTerm) ||
            service.zone.toLowerCase().includes(searchTerm) ||
            service.language.toLowerCase().includes(searchTerm) ||
            service.mode.toLowerCase().includes(searchTerm) ||
            trainerName.includes(searchTerm);

          if (!matchesSearch) return false;
        }

        return true;
      });
    }

    const servicesIds = filteredHirings.map((hiring: any) =>
      hiring.serviceId._id.toString()
    );

    const servicesWithStats = await Promise.all(
      servicesIds.map(async (serviceId: string) => {
        const hiring = filteredHirings.find(
          (h: any) => h.serviceId._id.toString() === serviceId
        );

        if (!hiring) return null;

        const service = hiring.serviceId as any;
        const trainer = service.trainerId as any;

        const pendings = await Hiring.countDocuments({
          serviceId: new Types.ObjectId(serviceId),
          status: "pending",
        });

        const totalReviews = await Review.countDocuments({
          serviceId: new Types.ObjectId(serviceId),
        });

        const ratingResult = await Review.aggregate([
          { $match: { serviceId: new Types.ObjectId(serviceId) } },
          { $group: { _id: null, average: { $avg: "$calification" } } },
        ]);

        const clients = await Hiring.countDocuments({
          serviceId: new Types.ObjectId(serviceId),
        });

        return {
          id: service._id,
          trainerName: `${trainer?.name || ""} ${
            trainer?.surname || ""
          }`.trim(),
          category: service.category,
          description: service.description,
          duration: service.duration,
          price: service.price,
          mode: service.mode,
          zone: service.zone,
          language: service.language,
          maxPeople: service.maxPeople,
          status: service.status,
          availability: service.availability || [],
          trainerImage: trainer?.avatar || "",
          rating: ratingResult[0]?.average || 0,
          pendings: pendings,
          totalReviews: totalReviews,
          visualizations: service.visualizations || 0,
          clients: clients,
          trainerId: trainer?._id || new Types.ObjectId(),
          hiringId: hiring._id,
          hiringStatus: hiring.status,
          files: [] as string[],
        };
      })
    );

    return servicesWithStats.filter(
      (service) => service !== null
    ) as unknown as GetServicesResponseDTO[];
  }

  async getServiceById(id: string): Promise<GetServicesResponseDTO> {
    const service = await Service.findById(id).populate(
      "trainerId",
      "name surname profileImage averageCalification avatar"
    );

    if (!service) {
      throw new Error("Service not found");
    }

    const pendingHirings = await Hiring.find({
      serviceId: service._id,
      status: "pending",
    }).populate("clientId", "name email avatar");

    const pendingUsers = pendingHirings.map((hiring: any) => ({
      id: hiring.clientId._id,
      name: `${hiring.clientId.name}`,
      email: hiring.clientId.email,
      avatarUrl: hiring.clientId.avatar || "",
      hiringId: hiring._id,
    }));

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
      trainerName: `${trainer?.name} ${trainer?.surname}`,
      category: service.category as string,
      description: service.description as string,
      duration: service.duration as number,
      price: service.price as number,
      mode: service.mode as "online" | "in-person",
      zone: service.zone as string,
      language: service.language as string,
      maxPeople: service.maxPeople as number,
      status: service.status as "active" | "inactive",
      availability: service.availability as {
        day: string;
        startTime: string;
      }[],
      trainerImage: trainer?.avatar || "",
      rating: ratingResult[0]?.average || 0,
      pendings: pendingUsers,
      totalReviews: totalReviews,
      visualizations: service.visualizations as number,
      clients: clients,
      trainerId: trainer?._id || new Types.ObjectId(),
      files: [] as string[],
    };
  }

  async getServicesByTrainerId(
    trainerId: string,
    params: GetServicesParams = {}
  ): Promise<GetServicesResponseDTO[]> {
    const query: any = {
      trainerId: new Types.ObjectId(trainerId),
      isActive: true,
    };

    if (params.category) query.category = { $in: params.category.split(",") };
    if (params.zone) query.zone = { $in: params.zone.split(",") };
    if (params.mode) query.mode = { $in: params.mode.split(",") };
    if (params.language) query.language = { $in: params.language.split(",") };

    if (params.minPrice) query.price = { $gte: params.minPrice };
    if (params.maxPrice) {
      query.price = { ...query.price, $lte: params.maxPrice };
    }
    if (params.minDuration) query.duration = { $gte: params.minDuration };
    if (params.maxDuration) {
      query.duration = { ...query.duration, $lte: params.maxDuration };
    }

    let services;

    if (params.search) {
      const matchingTrainers = await User.find({
        $or: [
          { name: { $regex: params.search, $options: "i" } },
          { surname: { $regex: params.search, $options: "i" } },
        ],
      }).select("_id");

      const trainerIds = matchingTrainers.map((trainer) => trainer._id);

      query.$or = [
        { description: { $regex: params.search, $options: "i" } },
        { category: { $regex: params.search, $options: "i" } },
        { zone: { $regex: params.search, $options: "i" } },
        { language: { $regex: params.search, $options: "i" } },
        { mode: { $regex: params.search, $options: "i" } },
        { trainerId: { $in: trainerIds } },
      ];
    }

    services = await Service.find(query)
      .populate(
        "trainerId",
        "name surname profileImage averageCalification avatar"
      )
      .sort({ createdAt: -1 });

    if (services.length === 0) {
      return [];
    }

    const servicesWithStats = await Promise.all(
      services.map(async (service: any) => {
        const pendings = await Hiring.countDocuments({
          serviceId: service._id,
          status: "pending",
        });

        const pendingHirings = await Hiring.find({
          serviceId: service._id,
          status: "pending",
        }).populate("clientId", "name email avatar");

        const pendingUsers = pendingHirings.map((hiring: any) => ({
          id: hiring.clientId._id,
          name: `${hiring.clientId.name}`,
          email: hiring.clientId.email,
          avatarUrl: hiring.clientId.avatar || "",
          hiringId: hiring._id,
        }));

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
          trainerName: `${trainer?.name} ${trainer?.surname}`,
          category: service.category,
          description: service.description,
          duration: service.duration,
          price: service.price,
          mode: service.mode,
          zone: service.zone,
          language: service.language,
          maxPeople: service.maxPeople,
          status: service.status,
          availability: service.availability,
          trainerImage: trainer?.avatar || "",
          rating: ratingResult[0]?.average || 0,
          pendings: pendingUsers,
          totalReviews: totalReviews,
          visualizations: service.visualizations,
          clients: clients,
          trainerId: trainer?._id || new Types.ObjectId(),
          files: [] as string[],
        };
      })
    );

    return servicesWithStats as unknown as GetServicesResponseDTO[];
  }

  async deleteService(id: string, trainerId: string) {
    console.log("Searching for service to delete:", {
      serviceId: id,
      trainerId,
      serviceObjectId: new Types.ObjectId(id),
      trainerObjectId: new Types.ObjectId(trainerId),
    });

    const service = await Service.findOne({
      _id: new Types.ObjectId(id),
      trainerId: new Types.ObjectId(trainerId),
    });

    if (!service) {
      const serviceExists = await Service.findById(id);

      throw new Error(
        "Service not found or you don't have permission to delete it"
      );
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
      throw new Error(
        "Service not found or you don't have permission to update it"
      );
    }

    Object.assign(service, serviceData);
    await service.save();
    return service;
  }

  async getFilters(): Promise<GetFiltersResponseDTO> {
    const priceStats = await Service.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
    ]);

    const zones = await Service.distinct("zone", { isActive: true });

    const languages = await Service.distinct("language", { isActive: true });

    const categories = await Service.distinct("category", { isActive: true });

    const durationStats = await Service.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          minDuration: { $min: "$duration" },
          maxDuration: { $max: "$duration" },
        },
      },
    ]);

    return {
      minPrice: priceStats[0]?.minPrice || 0,
      maxPrice: priceStats[0]?.maxPrice || 0,
      zones: zones.sort() as string[],
      languages: languages.sort() as string[],
      categories: categories.sort() as string[],
      minDuration: durationStats[0]?.minDuration || 0,
      maxDuration: durationStats[0]?.maxDuration || 0,
    };
  }

  async getClientFilters(clientId: string): Promise<GetFiltersResponseDTO> {
    const hirings = await Hiring.find({
      clientId: new Types.ObjectId(clientId),
      status: "confirmed",
    }).populate("serviceId");

    if (hirings.length === 0) {
      return {
        minPrice: 0,
        maxPrice: 0,
        zones: [],
        languages: [],
        categories: [],
        minDuration: 0,
        maxDuration: 0,
      };
    }

    const serviceIds = hirings.map((hiring: any) => hiring.serviceId._id);

    const priceStats = await Service.aggregate([
      { $match: { _id: { $in: serviceIds }, isActive: true } },
      {
        $group: {
          _id: null,
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
    ]);

    const zones = await Service.distinct("zone", {
      _id: { $in: serviceIds },
      isActive: true,
    });

    const languages = await Service.distinct("language", {
      _id: { $in: serviceIds },
      isActive: true,
    });

    const categories = await Service.distinct("category", {
      _id: { $in: serviceIds },
      isActive: true,
    });

    const durationStats = await Service.aggregate([
      { $match: { _id: { $in: serviceIds }, isActive: true } },
      {
        $group: {
          _id: null,
          minDuration: { $min: "$duration" },
          maxDuration: { $max: "$duration" },
        },
      },
    ]);

    return {
      minPrice: priceStats[0]?.minPrice || 0,
      maxPrice: priceStats[0]?.maxPrice || 0,
      zones: zones.sort() as string[],
      languages: languages.sort() as string[],
      categories: categories.sort() as string[],
      minDuration: durationStats[0]?.minDuration || 0,
      maxDuration: durationStats[0]?.maxDuration || 0,
    };
  }

  async getTrainerFilters(trainerId: string): Promise<GetFiltersResponseDTO> {
    const priceStats = await Service.aggregate([
      {
        $match: {
          trainerId: new Types.ObjectId(trainerId),
          isActive: true,
        },
      },
      {
        $group: {
          _id: null,
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
    ]);

    const zones = await Service.distinct("zone", {
      trainerId: new Types.ObjectId(trainerId),
      isActive: true,
    });

    const languages = await Service.distinct("language", {
      trainerId: new Types.ObjectId(trainerId),
      isActive: true,
    });

    const categories = await Service.distinct("category", {
      trainerId: new Types.ObjectId(trainerId),
      isActive: true,
    });

    const durationStats = await Service.aggregate([
      {
        $match: {
          trainerId: new Types.ObjectId(trainerId),
          isActive: true,
        },
      },
      {
        $group: {
          _id: null,
          minDuration: { $min: "$duration" },
          maxDuration: { $max: "$duration" },
        },
      },
    ]);

    return {
      minPrice: priceStats[0]?.minPrice || 0,
      maxPrice: priceStats[0]?.maxPrice || 0,
      zones: zones.sort() as string[],
      languages: languages.sort() as string[],
      categories: categories.sort() as string[],
      minDuration: durationStats[0]?.minDuration || 0,
      maxDuration: durationStats[0]?.maxDuration || 0,
    };
  }

  async trackVisualization(serviceId: string, userId: string): Promise<void> {
    const service = await Service.findById(serviceId);

    if (!service) {
      throw new Error("Service not found");
    }

    if (service.trainerId && service.trainerId.toString() === userId) {
      return;
    }

    const userObjectId = new Types.ObjectId(userId);
    const hasViewed = service.viewedBy.some(
      (viewerId: any) => viewerId.toString() === userId
    );

    if (!hasViewed) {
      service.viewedBy.push(userObjectId);
      service.visualizations = service.viewedBy.length;
      await service.save();
    }
  }

  async getServiceClients(
    serviceId: string
  ): Promise<GetServiceClientsResponseDTO> {
    const hirings = await Hiring.find({
      serviceId: new Types.ObjectId(serviceId),
    }).populate("clientId", "name email birthDate avatar");

    const clients = hirings.map((hiring: any) => ({
      id: hiring.clientId._id,
      name: `${hiring.clientId.name}`,
      email: hiring.clientId.email,
      birthDate: hiring.clientId.birthDate,
      avatarUrl: hiring.clientId.avatar || "",
      hiringId: hiring._id,
      status: hiring.status,
      day: hiring.day,
      time: hiring.time,
    }));

    return clients;
  }
}
