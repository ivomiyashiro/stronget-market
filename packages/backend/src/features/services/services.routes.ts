import { Router } from "express";
import { validateBody, validateParams } from "../../middleware/validation.middleware";
import {
    authenticateToken,
    requireRole,
    optionalAuthentication,
} from "../../middleware/auth.middleware";
import {
    createServiceSchema,
    updateServiceSchema,
    serviceIdSchema,
    trainerIdSchema,
    getServicesParamsSchema,
} from "./services.validation";
import { servicesController } from "./services.controller";

const router = Router();

// Get filters for services (landing page - all filters)
router.get("/filters", servicesController.getFilters);

// Get filters for client services (only filters that client has confirmed)
router.get(
    "/filters/client",
    authenticateToken,
    requireRole(["cliente"]),
    servicesController.getClientFilters
);

// Get filters for trainer services (only filters for services created by the trainer)
router.get(
    "/filters/trainer",
    authenticateToken,
    requireRole(["entrenador"]),
    servicesController.getTrainerFilters
);

// Create a new service
router.post(
    "/",
    authenticateToken,
    requireRole(["entrenador"]),
    validateBody(createServiceSchema),
    servicesController.createService
);

// Get services - behavior depends on authenticated user:
// - If authenticated client: returns their hired services
// - Otherwise: returns all services with filters
router.get(
    "/",
    optionalAuthentication,
    validateParams(getServicesParamsSchema),
    servicesController.getServices
);

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

// Track service visualization
router.post(
    "/:serviceId/track-visualization",
    authenticateToken,
    validateParams(serviceIdSchema),
    servicesController.trackVisualization
);

export default router;
