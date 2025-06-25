import { z } from "zod";
import { Types } from "mongoose";

// Custom validator for MongoDB ObjectId
const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectId = z.string().refine((val) => objectIdRegex.test(val), {
    message: "Invalid ObjectId format",
});

export const getTrainerSchema = z.object({
    id: objectId,
});

export const updateSeenNotificationsSchema = z.object({
    id: objectId,
});

export const markNotificationAsReadSchema = z.object({
    id: objectId,
    notificationId: objectId,
});
