import { Router } from "express";
import { HiringController } from "./hiring.controller";
import { validateBody, validateParams } from "../../middleware/validation.middleware";
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

// Create a new hiring
router.post(
    "/",
    authenticateToken,
    validateBody(createHiringSchema),
    hiringController.createHiring
);

// Validate if a service can be booked
router.post("/validate", authenticateToken, hiringController.canBookService);

// Get my hirings (as client)
router.get("/my", authenticateToken, hiringController.getMyHirings);

// Get hirings for a specific trainer
router.get(
    "/trainer/:trainerId",
    authenticateToken,
    validateParams(trainerIdSchema),
    hiringController.getTrainerHirings
);

// Get hiring by ID
router.get(
    "/:id",
    authenticateToken,
    validateParams(hiringIdSchema),
    hiringController.getHiringById
);

// Update hiring status
router.patch(
    "/:id/status",
    authenticateToken,
    validateParams(hiringIdSchema),
    validateBody(updateHiringStatusSchema),
    hiringController.updateHiringStatus
);

// Cancel hiring
router.patch(
    "/:id/cancel",
    authenticateToken,
    validateParams(hiringIdSchema),
    hiringController.cancelHiring
);

// Confirm hiring (trainers only)
router.patch(
    "/:id/confirm",
    authenticateToken,
    validateParams(hiringIdSchema),
    hiringController.confirmHiring
);

// Accept hiring by client and service (trainers only)
router.patch(
    "/accept",
    authenticateToken,
    hiringController.acceptHiring
);

// Reject hiring by client and service (trainers only)
router.patch(
    "/reject",
    authenticateToken,
    hiringController.rejectHiring
);

// Remove hiring (clients only - completely removes the hiring)
router.delete(
    "/:id",
    authenticateToken,
    validateParams(hiringIdSchema),
    hiringController.removeHiring
);

// Get trainer available slots for a specific day
router.get(
    "/trainer/:trainerId/availability/:day",
    validateParams(
        z.object({
            trainerId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format"),
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
