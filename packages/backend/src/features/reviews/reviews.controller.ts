import { Request, Response } from "express";
import { ReviewsService } from "./reviews.service";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class ReviewsController {
  private reviewsService: ReviewsService;

  constructor() {
    this.reviewsService = new ReviewsService();
  }

  createReview = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const review = await this.reviewsService.createReview(userId, req.body);
      res.status(201).json(review);
    } catch (error) {
      res.status(400).json({
        message:
          error instanceof Error ? error.message : "Create review failed",
      });
    }
  };

  getReviewsByService = async (req: Request, res: Response): Promise<void> => {
    try {
      const { serviceId } = req.params;
      const reviews = await this.reviewsService.getReviewsByService(serviceId);
      res.status(200).json(reviews);
    } catch (error) {
      res.status(400).json({
        message:
          error instanceof Error ? error.message : "Get service reviews failed",
      });
    }
  };

  getReviewsByTrainer = async (req: Request, res: Response): Promise<void> => {
    try {
      const { trainerId } = req.params;
      const reviews = await this.reviewsService.getReviewsByTrainer(trainerId);
      res.status(200).json(reviews);
    } catch (error) {
      res.status(400).json({
        message:
          error instanceof Error ? error.message : "Get trainer reviews failed",
      });
    }
  };

  getReviewById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const review = await this.reviewsService.getReviewById(id);
      if (!review) {
        res.status(404).json({ message: "Review not found" });
        return;
      }
      res.status(200).json(review);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "Get review failed",
      });
    }
  };

  updateReview = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const review = await this.reviewsService.updateReview(
        id,
        userId,
        req.body
      );
      res.status(200).json(review);
    } catch (error) {
      res.status(400).json({
        message:
          error instanceof Error ? error.message : "Update review failed",
      });
    }
  };

  deleteReview = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const result = await this.reviewsService.deleteReview(id, userId);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        message:
          error instanceof Error ? error.message : "Delete review failed",
      });
    }
  };

  respondToReview = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const trainerId = req.user?.id;
      const { response } = req.body;
      if (!trainerId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      if (!response || typeof response !== "string" || !response.trim()) {
        res.status(400).json({ message: "Response is required" });
        return;
      }
      const updatedReview = await this.reviewsService.respondToReview(
        id,
        trainerId,
        response.trim()
      );
      res.status(200).json(updatedReview);
    } catch (error) {
      res.status(400).json({
        message:
          error instanceof Error ? error.message : "Respond to review failed",
      });
    }
  };
}
