import { z } from "zod";

// Custom validator for MongoDB ObjectId
const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectId = z.string().refine((val) => objectIdRegex.test(val), {
  message: "Invalid ObjectId format",
});

// Custom validator for credit card number (basic)
const cardNumberRegex = /^\d{16}$/;
const cardNumber = z
  .string()
  .refine((val) => cardNumberRegex.test(val.replace(/\s/g, "")), {
    message: "Invalid card number format",
  });

// Custom validator for expiry date (MM/YY)
const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
const expiry = z.string().refine((val) => expiryRegex.test(val), {
  message: "Invalid expiry format (MM/YY)",
});

// Custom validator for CVV
const cvvRegex = /^\d{3,4}$/;
const cvv = z.string().refine((val) => cvvRegex.test(val), {
  message: "Invalid CVV format",
});

export const createHiringSchema = z.object({
  serviceId: objectId,
  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    })
    .transform((val) => new Date(val)),
  payment: z.object({
    name: z.string().min(2, "Cardholder name must be at least 2 characters"),
    cardNumber: cardNumber,
    expiry: expiry,
    cvv: cvv,
  }),
});

export const updateHiringStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled", "completed"], {
    errorMap: () => ({
      message: "Status must be one of: pending, confirmed, cancelled, completed",
    }),
  }),
});

export const hiringIdSchema = z.object({
  id: objectId,
});

export const trainerIdSchema = z.object({
  trainerId: objectId,
});
