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
        duration: req.query.duration ? Number(req.query.duration) : undefined,
        language: req.query.language as string | undefined,
        mode: req.query.mode as "online" | "in-person" | undefined,
      };

      const services = await this.servicesService.getServices(params);
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
      const services = await this.servicesService.getServicesByTrainerId(trainerId);
      res.status(200).json(services);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "Get trainer services failed",
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
      res.status(200).json(result);
    } catch (error) {
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

      const service = await this.servicesService.updateService(id, trainerId, req.body);
      res.status(200).json(service);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "Update service failed",
      });
    }
  };
}
