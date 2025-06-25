import { Router } from "express";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../../middleware/validation.middleware";
import {
  authenticateToken,
  requireRole,
  optionalAuthentication,
} from "../../middleware/auth.middleware";
import {
  createServiceSchema,
  updateServiceSchema,
  serviceIdSchema,
  serviceIdParamSchema,
  trainerIdSchema,
  getServicesParamsSchema,
} from "./services.validation";
import { servicesController } from "./services.controller";

const router = Router();

router.get("/filters", servicesController.getFilters);

router.get(
  "/filters/client",
  authenticateToken,
  requireRole(["cliente"]),
  servicesController.getClientFilters
);

router.get(
  "/filters/trainer",
  authenticateToken,
  requireRole(["entrenador"]),
  servicesController.getTrainerFilters
);

router.post(
  "/",
  authenticateToken,
  requireRole(["entrenador"]),
  validateBody(createServiceSchema),
  servicesController.createService
);

router.get("/", optionalAuthentication, servicesController.getServices);

router.get(
  "/:id",
  validateParams(serviceIdSchema),
  servicesController.getServiceById
);

router.get(
  "/trainer/:trainerId",
  validateParams(trainerIdSchema),
  servicesController.getServicesByTrainerId
);

router.put(
  "/:id",
  authenticateToken,
  requireRole(["entrenador"]),
  validateBody(updateServiceSchema),
  validateParams(serviceIdSchema),
  servicesController.updateService
);

router.delete(
  "/:id",
  authenticateToken,
  requireRole(["entrenador"]),
  validateParams(serviceIdSchema),
  servicesController.deleteService
);

router.post(
  "/:serviceId/track-visualization",
  authenticateToken,
  validateParams(serviceIdParamSchema),
  servicesController.trackVisualization
);

router.get(
  "/:serviceId/clients",
  authenticateToken,
  requireRole(["entrenador"]),
  validateParams(serviceIdParamSchema),
  servicesController.getServiceClients
);

export default router;
