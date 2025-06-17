import { Router } from "express";
import { HiringController } from "./hiring.controller";
import { validateBody, validateParams } from "../../middleware/validation.middleware";
import {
  createHiringSchema,
  updateHiringStatusSchema,
  hiringIdSchema,
  trainerIdSchema,
} from "./hiring.validation";

const router = Router();
const hiringController = new HiringController();

// Create a new hiring
router.post("/", validateBody(createHiringSchema), hiringController.createHiring);

// Get my hirings (as client)
router.get("/my", hiringController.getMyHirings);

// Get hirings for a specific trainer
router.get(
  "/trainer/:trainerId",
  validateParams(trainerIdSchema),
  hiringController.getTrainerHirings
);

// Get hiring by ID
router.get("/:id", validateParams(hiringIdSchema), hiringController.getHiringById);

// Update hiring status
router.patch(
  "/:id/status",
  validateParams(hiringIdSchema),
  validateBody(updateHiringStatusSchema),
  hiringController.updateHiringStatus
);

// Cancel hiring
router.patch(
  "/:id/cancel",
  validateParams(hiringIdSchema),
  hiringController.cancelHiring
);

export default router;
