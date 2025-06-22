import { Router } from "express";
import { ServicesController } from "./services.controller";
import {
  validateBody,
  validateParams,
} from "../../middleware/validation.middleware";
import {
  createServiceSchema,
  updateServiceSchema,
  serviceIdSchema,
  trainerIdSchema,
  getServicesParamsSchema,
} from "./services.validation";

const router = Router();
const servicesController = new ServicesController();

// Create a new service
router.post(
  "/",
  validateBody(createServiceSchema),
  servicesController.createService
);

// Get all services with filters
router.get(
  "/",
  validateParams(getServicesParamsSchema),
  servicesController.getServices
);

// Get service by ID
router.get(
  "/:id",
  validateParams(serviceIdSchema),
  servicesController.getServiceById
);

// Get services by trainer ID
router.get(
  "/trainer/:trainerId",
  validateParams(trainerIdSchema),
  servicesController.getServicesByTrainerId
);

// Update service
router.put(
  "/:id",
  validateBody(updateServiceSchema),
  validateParams(serviceIdSchema),
  servicesController.updateService
);

// Delete service
router.delete(
  "/:id",
  validateParams(serviceIdSchema),
  servicesController.deleteService
);

export default router;
