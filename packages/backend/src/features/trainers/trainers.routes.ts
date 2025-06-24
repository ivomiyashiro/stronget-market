import { Router } from "express";
import { TrainersController } from "./trainers.controller";
import { validateParams } from "../../middleware/validation.middleware";
import { authenticateToken, requireRole } from "../../middleware/auth.middleware";
import { getTrainerSchema, updateSeenNotificationsSchema } from "./trainers.validation";

const router = Router();
const trainersController = new TrainersController();

router.get(
    "/:id/statistics",
    authenticateToken,
    requireRole(["entrenador"]),
    validateParams(getTrainerSchema),
    trainersController.getTrainerStatistics
);
router.get(
    "/:id/notifications",
    authenticateToken,
    requireRole(["entrenador"]),
    validateParams(getTrainerSchema),
    trainersController.getTrainerNotifications
);
router.put(
    "/:id/notifications/seen",
    authenticateToken,
    requireRole(["entrenador"]),
    validateParams(updateSeenNotificationsSchema),
    trainersController.updateSeenNotifications
);

export default router;
