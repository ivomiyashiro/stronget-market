import { Router } from "express";
import { ReviewsController } from "./reviews.controller";
import { validateBody, validateParams } from "../../middleware/validation.middleware";
import { authenticateToken } from "../../middleware/auth.middleware";
import {
    createReviewSchema,
    updateReviewSchema,
    reviewIdSchema,
    serviceReviewsSchema,
    trainerReviewsSchema,
} from "./reviews.validation";

const router = Router();
const reviewsController = new ReviewsController();

// Create a new review
router.post(
    "/",
    authenticateToken,
    validateBody(createReviewSchema),
    reviewsController.createReview
);

// Get reviews by service ID
router.get(
    "/service/:serviceId",
    validateParams(serviceReviewsSchema),
    reviewsController.getReviewsByService
);

// Get reviews by trainer ID
router.get(
    "/trainer/:trainerId",
    validateParams(trainerReviewsSchema),
    reviewsController.getReviewsByTrainer
);

// Get review by ID
router.get("/:id", validateParams(reviewIdSchema), reviewsController.getReviewById);

// Update review
router.put(
    "/:id",
    authenticateToken,
    validateParams(reviewIdSchema),
    validateBody(updateReviewSchema),
    reviewsController.updateReview
);

// Delete review
router.delete(
    "/:id",
    authenticateToken,
    validateParams(reviewIdSchema),
    reviewsController.deleteReview
);

export default router;
