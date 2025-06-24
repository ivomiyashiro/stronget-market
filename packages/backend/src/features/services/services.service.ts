import Service from "./services.model";
import { Types } from "mongoose";
import {
    CreateServiceRequestDTO,
    GetServicesParams,
    GetServicesResponseDTO,
    UpdateServiceRequestDTO,
    GetFiltersResponseDTO,
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
            // First, find trainers that match the search term
            const matchingTrainers = await User.find({
                $or: [
                    { name: { $regex: params.search, $options: "i" } },
                    { surname: { $regex: params.search, $options: "i" } },
                ],
            }).select("_id");

            const trainerIds = matchingTrainers.map((trainer) => trainer._id);

            // Add trainer search to the query
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
                    trainerName: `${trainer?.name} ${trainer?.surname}`,
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
            trainerName: `${trainer?.name} ${trainer?.surname}`,
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

    async getServicesByTrainerId(
        trainerId: string,
        params: GetServicesParams = {}
    ): Promise<GetServicesResponseDTO[]> {
        // Build query with trainer filter and additional filters
        const query: any = {
            trainerId: new Types.ObjectId(trainerId),
            isActive: true,
        };

        // Apply the same filtering logic as getServices
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
            // First, find trainers that match the search term
            const matchingTrainers = await User.find({
                $or: [
                    { name: { $regex: params.search, $options: "i" } },
                    { surname: { $regex: params.search, $options: "i" } },
                ],
            }).select("_id");

            const trainerIds = matchingTrainers.map((trainer) => trainer._id);

            // Add trainer search to the query
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
                    trainerName: `${trainer?.name} ${trainer?.surname}`,
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
            // Let's also check if the service exists at all
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
        // Get min and max prices
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

        // Get unique zones
        const zones = await Service.distinct("zone", { isActive: true });

        // Get unique languages
        const languages = await Service.distinct("language", { isActive: true });

        // Get unique categories
        const categories = await Service.distinct("category", { isActive: true });

        // Get min and max duration
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
            zones: zones.sort(),
            languages: languages.sort(),
            categories: categories.sort(),
            minDuration: durationStats[0]?.minDuration || 0,
            maxDuration: durationStats[0]?.maxDuration || 0,
        };
    }
}
