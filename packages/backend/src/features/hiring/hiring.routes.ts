import { Router } from "express";
import { HiringController } from "./hiring.controller";
import { validateBody, validateParams } from "../../middleware/validation.middleware";
import {
  createHiringSchema,
  updateHiringStatusSchema,
  hiringIdSchema,
  trainerIdSchema,
} from "./hiring.validation";
import { z } from "zod";

const router = Router();
const hiringController = new HiringController();

// Create a new hiring
router.post("/", validateBody(createHiringSchema), hiringController.createHiring);

// Validate if a service can be booked
router.post("/validate", hiringController.canBookService);

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

// Confirm hiring (trainers only)
router.patch(
  "/:id/confirm",
  validateParams(hiringIdSchema),
  hiringController.confirmHiring
);

// Get trainer available slots for a specific date
router.get(
  "/trainer/:trainerId/availability/:date",
  validateParams(
    z.object({
      trainerId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format"),
      date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),
    })
  ),
  hiringController.getTrainerAvailableSlots
);

export default router;
