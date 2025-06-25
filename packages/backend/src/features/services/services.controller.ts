import { Request, Response } from "express";
import { ServicesService } from "./services.service";
import { GetServicesParams } from "./dtos";

// Type extension for authenticated requests
interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

export class ServicesController {
    private servicesService: ServicesService;

    constructor() {
        this.servicesService = new ServicesService();
    }

    createService = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const trainerId = req.user?.id; // Assuming you have auth middleware setting user
            if (!trainerId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }

            const service = await this.servicesService.createService(trainerId, req.body);
            res.status(201).json(service);
        } catch (error) {
            res.status(400).json({
                message: error instanceof Error ? error.message : "Create service failed",
            });
        }
    };

    getServices = async (req: Request, res: Response): Promise<void> => {
        try {
            // Convert query params to the correct types
            const params: GetServicesParams = {
                category: req.query.category as string | undefined,
                zone: req.query.zone as string | undefined,
                minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
                maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
                minDuration: req.query.minDuration
                    ? Number(req.query.minDuration)
                    : undefined,
                maxDuration: req.query.maxDuration
                    ? Number(req.query.maxDuration)
                    : undefined,
                language: req.query.language as string | undefined,
                mode: req.query.mode as "online" | "in-person" | undefined,
                search: req.query.search as string | undefined,
            };

            const services = await this.servicesService.getServices(params);

            res.status(200).json(services);
        } catch (error) {
            res.status(400).json({
                message: error instanceof Error ? error.message : "Get services failed",
            });
        }
    };

    getUserServices = async (req: Request, res: Response): Promise<void> => {
        try {
            const authenticatedReq = req as AuthenticatedRequest;
            const user = authenticatedReq.user;

            // Convert query params to the correct types
            const params: GetServicesParams = {
                category: req.query.category as string | undefined,
                zone: req.query.zone as string | undefined,
                minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
                maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
                minDuration: req.query.minDuration
                    ? Number(req.query.minDuration)
                    : undefined,
                maxDuration: req.query.maxDuration
                    ? Number(req.query.maxDuration)
                    : undefined,
                language: req.query.language as string | undefined,
                mode: req.query.mode as "online" | "in-person" | undefined,
                search: req.query.search as string | undefined,
            };

            let services;

            // If user is authenticated and is a client, return their hired services
            // Otherwise, return all services with filters
            if (user && user.role === "cliente") {
                services = await this.servicesService.getClientServices(user.id, params);
            } else {
                services = await this.servicesService.getServices(params);
            }

            res.status(200).json(services);
        } catch (error) {
            res.status(400).json({
                message: error instanceof Error ? error.message : "Get services failed",
            });
        }
    };

    getServiceById = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const service = await this.servicesService.getServiceById(id);
            if (!service) {
                res.status(404).json({ message: "Service not found" });
                return;
            }
            res.status(200).json(service);
        } catch (error) {
            res.status(400).json({
                message: error instanceof Error ? error.message : "Get service failed",
            });
        }
    };

    getServicesByTrainerId = async (req: Request, res: Response): Promise<void> => {
        try {
            const { trainerId } = req.params;

            // Convert query params to the correct types (same as getServices)
            const params: GetServicesParams = {
                category: req.query.category as string | undefined,
                zone: req.query.zone as string | undefined,
                minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
                maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
                minDuration: req.query.minDuration
                    ? Number(req.query.minDuration)
                    : undefined,
                maxDuration: req.query.maxDuration
                    ? Number(req.query.maxDuration)
                    : undefined,
                language: req.query.language as string | undefined,
                mode: req.query.mode as "online" | "in-person" | undefined,
                search: req.query.search as string | undefined,
            };

            const services = await this.servicesService.getServicesByTrainerId(
                trainerId,
                params
            );
            res.status(200).json(services);
        } catch (error) {
            res.status(400).json({
                message:
                    error instanceof Error
                        ? error.message
                        : "Get trainer services failed",
            });
        }
    };

    deleteService = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const trainerId = req.user?.id; // Assuming you have auth middleware setting user

            if (!trainerId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }

            const result = await this.servicesService.deleteService(id, trainerId);
            console.log("Service deleted successfully:", result);
            res.status(200).json(result);
        } catch (error) {
            console.error("Delete service error:", error);
            res.status(400).json({
                message: error instanceof Error ? error.message : "Delete service failed",
            });
        }
    };

    updateService = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const trainerId = req.user?.id; // Assuming you have auth middleware setting user

            if (!trainerId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }

            const service = await this.servicesService.updateService(
                id,
                trainerId,
                req.body
            );
            res.status(200).json(service);
        } catch (error) {
            res.status(400).json({
                message: error instanceof Error ? error.message : "Update service failed",
            });
        }
    };

    getFilters = async (req: Request, res: Response): Promise<void> => {
        try {
            const filters = await this.servicesService.getFilters();
            res.status(200).json(filters);
        } catch (error) {
            res.status(400).json({
                message: error instanceof Error ? error.message : "Get filters failed",
            });
        }
    };

    getClientFilters = async (
        req: AuthenticatedRequest,
        res: Response
    ): Promise<void> => {
        try {
            const clientId = req.user?.id;
            if (!clientId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }

            const filters = await this.servicesService.getClientFilters(clientId);
            res.status(200).json(filters);
        } catch (error) {
            res.status(400).json({
                message:
                    error instanceof Error ? error.message : "Get client filters failed",
            });
        }
    };

    getTrainerFilters = async (
        req: AuthenticatedRequest,
        res: Response
    ): Promise<void> => {
        try {
            const trainerId = req.user?.id;
            if (!trainerId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }

            const filters = await this.servicesService.getTrainerFilters(trainerId);
            res.status(200).json(filters);
        } catch (error) {
            res.status(400).json({
                message:
                    error instanceof Error ? error.message : "Get trainer filters failed",
            });
        }
    };

    trackVisualization = async (
        req: AuthenticatedRequest,
        res: Response
    ): Promise<void> => {
        try {
            const { serviceId } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }

            await this.servicesService.trackVisualization(serviceId, userId);
            res.status(200).json({ message: "Visualization tracked successfully" });
        } catch (error) {
            res.status(400).json({
                message:
                    error instanceof Error ? error.message : "Track visualization failed",
            });
        }
    };

    getServiceClients = async (
        req: AuthenticatedRequest,
        res: Response
    ): Promise<void> => {
        try {
            const { serviceId } = req.params;
            const user = req.user;

            if (!user) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }

            // Only trainers can view clients for their services
            if (user.role !== "entrenador") {
                res.status(403).json({
                    message: "Forbidden: Only trainers can view service clients",
                });
                return;
            }

            const clients = await this.servicesService.getServiceClients(serviceId);
            res.status(200).json(clients);
        } catch (error) {
            res.status(400).json({
                message:
                    error instanceof Error ? error.message : "Get service clients failed",
            });
        }
    };
}

export const servicesController = new ServicesController();
