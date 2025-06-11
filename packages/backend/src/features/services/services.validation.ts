import { z } from "zod";

// Custom validator for MongoDB ObjectId
const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectId = z.string().refine((val) => objectIdRegex.test(val), {
    message: "Invalid ObjectId format",
});

export const createServiceSchema = z.object({
    category: z.string().min(1, "Category is required"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    duration: z.number().min(15, "Duration must be at least 15 minutes"),
    price: z.number().min(0, "Price must be positive"),
    mode: z.enum(["online", "in-person"], {
        errorMap: () => ({ message: 'Mode must be "online" or "in-person"' }),
    }),
    zone: z.string().min(1, "Zone is required"),
    language: z.string().min(1, "Language is required"),
});

export const getServicesParamsSchema = z.object({
    category: z.string().optional(),
    zone: z.string().optional(),
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
    duration: z.number().optional(),
    language: z.string().optional(),
    mode: z.enum(["online", "in-person"]).optional(),
});

export const serviceIdSchema = z.object({
    id: objectId,
});
