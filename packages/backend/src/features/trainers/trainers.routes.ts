import { Router } from "express";
import { TrainersController } from "./trainers.controller";
import { validateParams } from "../../middleware/validation.middleware";
import { getTrainerSchema, updateSeenNotificationsSchema } from "./trainers.validation";

const router = Router();
const trainersController = new TrainersController();

router.get("/:id", validateParams(getTrainerSchema), trainersController.getTrainerById);
router.get(
    "/:id/statistics",
    validateParams(getTrainerSchema),
    trainersController.getTrainerStatistics
);
router.get(
    "/:id/notifications",
    validateParams(getTrainerSchema),
    trainersController.getTrainerNotifications
);
router.put(
    "/:id/notifications/seen",
    validateParams(updateSeenNotificationsSchema),
    trainersController.updateSeenNotifications
);

export default router;
