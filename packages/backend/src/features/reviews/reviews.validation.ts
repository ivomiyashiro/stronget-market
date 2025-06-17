import { z } from "zod";

// Custom validator for MongoDB ObjectId
const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectId = z.string().refine((val) => objectIdRegex.test(val), {
  message: "Invalid ObjectId format",
});

export const createReviewSchema = z.object({
  serviceId: objectId,
  trainerId: objectId,
  calification: z
    .number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),
  comments: z
    .string()
    .min(10, "Comments must be at least 10 characters")
    .max(500, "Comments cannot exceed 500 characters"),
});

export const updateReviewSchema = z.object({
  calification: z
    .number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5")
    .optional(),
  comments: z
    .string()
    .min(10, "Comments must be at least 10 characters")
    .max(500, "Comments cannot exceed 500 characters")
    .optional(),
});

export const reviewIdSchema = z.object({
  id: objectId,
});

export const serviceReviewsSchema = z.object({
  serviceId: objectId,
});

export const trainerReviewsSchema = z.object({
  trainerId: objectId,
});
