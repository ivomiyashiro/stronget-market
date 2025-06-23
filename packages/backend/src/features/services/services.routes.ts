import { Router } from "express";
import { ServicesController } from "./services.controller";
import { validateBody, validateParams } from "../../middleware/validation.middleware";
import { authenticateToken, requireRole } from "../../middleware/auth.middleware";
import {
  createServiceSchema,
  updateServiceSchema,
  serviceIdSchema,
  trainerIdSchema,
  getServicesParamsSchema,
} from "./services.validation";

const router = Router();
const servicesController = new ServicesController();

// Get filters for services
router.get("/filters", servicesController.getFilters);

// Create a new service
router.post(
  "/",
  authenticateToken,
  requireRole(["entrenador"]),
  validateBody(createServiceSchema),
  servicesController.createService
);

// Get all services with filters
router.get("/", validateParams(getServicesParamsSchema), servicesController.getServices);

// Get service by ID
router.get("/:id", validateParams(serviceIdSchema), servicesController.getServiceById);

// Get services by trainer ID
router.get(
  "/trainer/:trainerId",
  validateParams(trainerIdSchema),
  servicesController.getServicesByTrainerId
);

// Update service
router.put(
  "/:id",
  authenticateToken,
  requireRole(["entrenador"]),
  validateBody(updateServiceSchema),
  validateParams(serviceIdSchema),
  servicesController.updateService
);

// Delete service
router.delete(
  "/:id",
  authenticateToken,
  requireRole(["entrenador"]),
  validateParams(serviceIdSchema),
  servicesController.deleteService
);

export default router;
