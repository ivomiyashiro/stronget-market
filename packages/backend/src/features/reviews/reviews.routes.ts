import { Router } from "express";
import { ReviewsController } from "./reviews.controller";
import {
  validateBody,
  validateParams,
} from "../../middleware/validation.middleware";
import { authenticateToken } from "../../middleware/auth.middleware";
import {
  createReviewSchema,
  updateReviewSchema,
  reviewIdSchema,
  serviceReviewsSchema,
  trainerReviewsSchema,
  reviewResponseSchema,
} from "./reviews.validation";

const router = Router();
const reviewsController = new ReviewsController();

router.post(
  "/",
  authenticateToken,
  validateBody(createReviewSchema),
  reviewsController.createReview
);

router.get(
  "/service/:serviceId",
  validateParams(serviceReviewsSchema),
  reviewsController.getReviewsByService
);

router.get(
  "/trainer/:trainerId",
  validateParams(trainerReviewsSchema),
  reviewsController.getReviewsByTrainer
);

router.patch(
  "/:id/response",
  authenticateToken,
  validateParams(reviewIdSchema),
  validateBody(reviewResponseSchema),
  reviewsController.respondToReview
);

router.get(
  "/:id",
  validateParams(reviewIdSchema),
  reviewsController.getReviewById
);

router.put(
  "/:id",
  authenticateToken,
  validateParams(reviewIdSchema),
  validateBody(updateReviewSchema),
  reviewsController.updateReview
);

router.delete(
  "/:id",
  authenticateToken,
  validateParams(reviewIdSchema),
  reviewsController.deleteReview
);

export default router;
