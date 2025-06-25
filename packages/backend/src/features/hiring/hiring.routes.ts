import { Router } from "express";
import { HiringController } from "./hiring.controller";
import {
  validateBody,
  validateParams,
} from "../../middleware/validation.middleware";
import { authenticateToken } from "../../middleware/auth.middleware";
import {
  createHiringSchema,
  updateHiringStatusSchema,
  hiringIdSchema,
  trainerIdSchema,
} from "./hiring.validation";
import { z } from "zod";

const router = Router();
const hiringController = new HiringController();

router.post(
  "/",
  authenticateToken,
  validateBody(createHiringSchema),
  hiringController.createHiring
);

router.post("/validate", authenticateToken, hiringController.canBookService);

router.get("/my", authenticateToken, hiringController.getMyHirings);

router.get(
  "/trainer/:trainerId",
  authenticateToken,
  validateParams(trainerIdSchema),
  hiringController.getTrainerHirings
);

router.get(
  "/:id",
  authenticateToken,
  validateParams(hiringIdSchema),
  hiringController.getHiringById
);

router.patch(
  "/:id/status",
  authenticateToken,
  validateParams(hiringIdSchema),
  validateBody(updateHiringStatusSchema),
  hiringController.updateHiringStatus
);

router.patch(
  "/:id/cancel",
  authenticateToken,
  validateParams(hiringIdSchema),
  hiringController.cancelHiring
);

router.patch(
  "/:id/confirm",
  authenticateToken,
  validateParams(hiringIdSchema),
  hiringController.confirmHiring
);

router.patch("/accept", authenticateToken, hiringController.acceptHiring);

router.patch("/reject", authenticateToken, hiringController.rejectHiring);

router.delete(
  "/:id",
  authenticateToken,
  validateParams(hiringIdSchema),
  hiringController.removeHiring
);

router.get(
  "/trainer/:trainerId/availability/:day",
  validateParams(
    z.object({
      trainerId: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format"),
      day: z.enum([
        "Domingo",
        "Lunes",
        "Martes",
        "Miercoles",
        "Jueves",
        "Viernes",
        "Sabado",
      ]),
    })
  ),
  hiringController.getTrainerAvailableSlots
);

export default router;
