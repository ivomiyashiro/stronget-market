import Review from "./reviews.model";
import Hiring from "../hiring/hiring.model";
import Service from "../services/services.model";
import { Types } from "mongoose";
import { CreateReviewRequestDTO, UpdateReviewRequestDTO } from "./dtos";

export class ReviewsService {
  async createReview(userId: string, reviewData: CreateReviewRequestDTO) {
    // Check if user has hired this service and it's confirmed
    const hiring = await Hiring.findOne({
      clientId: new Types.ObjectId(userId),
      serviceId: new Types.ObjectId(reviewData.serviceId),
      status: "confirmed",
    });

    if (!hiring) {
      throw new Error("You can only review services you have hired and confirmed");
    }

    // Check if user already reviewed this service
    const existingReview = await Review.findOne({
      userId: new Types.ObjectId(userId),
      serviceId: new Types.ObjectId(reviewData.serviceId),
    });

    if (existingReview) {
      throw new Error("You have already reviewed this service");
    }

    const review = new Review({
      ...reviewData,
      userId: new Types.ObjectId(userId),
      serviceId: new Types.ObjectId(reviewData.serviceId),
      trainerId: new Types.ObjectId(reviewData.trainerId),
    });

    await review.save();

    // Update service rating
    await this.updateServiceRating(reviewData.serviceId);

    return review.populate([
      { path: "userId", select: "name surname" },
      { path: "trainerId", select: "name surname" },
      { path: "serviceId", select: "category description" },
    ]);
  }

  async getReviewsByService(serviceId: string) {
    return Review.find({ serviceId: new Types.ObjectId(serviceId) })
      .populate("userId", "name surname")
      .sort({ date: -1 });
  }

  async getReviewsByTrainer(trainerId: string) {
    return Review.find({ trainerId: new Types.ObjectId(trainerId) })
      .populate([
        { path: "userId", select: "name surname" },
        { path: "serviceId", select: "category description" },
      ])
      .sort({ date: -1 });
  }

  async getReviewById(id: string) {
    return Review.findById(id).populate([
      { path: "userId", select: "name surname" },
      { path: "trainerId", select: "name surname" },
      { path: "serviceId", select: "category description" },
    ]);
  }

  async updateReview(id: string, userId: string, reviewData: UpdateReviewRequestDTO) {
    const review = await Review.findOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });

    if (!review) {
      throw new Error("Review not found or you don't have permission to update it");
    }

    Object.assign(review, reviewData, { updatedAt: new Date() });
    await review.save();

    // Update service rating if calification changed
    if (reviewData.calification !== undefined) {
      await this.updateServiceRating(review.serviceId.toString());
    }

    return review.populate([
      { path: "userId", select: "name surname" },
      { path: "trainerId", select: "name surname" },
      { path: "serviceId", select: "category description" },
    ]);
  }

  async deleteReview(id: string, userId: string) {
    const review = await Review.findOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });

    if (!review) {
      throw new Error("Review not found or you don't have permission to delete it");
    }

    const serviceId = review.serviceId.toString();
    await Review.findByIdAndDelete(id);

    // Update service rating after deletion
    await this.updateServiceRating(serviceId);

    return { message: "Review deleted successfully" };
  }

  private async updateServiceRating(serviceId: string) {
    const reviews = await Review.find({ serviceId: new Types.ObjectId(serviceId) });

    if (reviews.length === 0) {
      await Service.findByIdAndUpdate(serviceId, {
        rating: 0,
        totalReviews: 0,
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.calification, 0);
    const averageRating = totalRating / reviews.length;

    await Service.findByIdAndUpdate(serviceId, {
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews: reviews.length,
    });
  }
}
