import { z } from "zod";

// Custom validator for MongoDB ObjectId
const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectId = z.string().refine((val) => objectIdRegex.test(val), {
    message: "Fecha inválida",
});

// Custom validator for credit card number (basic)
const cardNumberRegex = /^\d{16}$/;
const cardNumber = z
    .string()
    .refine((val) => cardNumberRegex.test(val.replace(/\s/g, "")), {
        message: "Número de tarjeta inválido",
    });

// Custom validator for CVV
const cvvRegex = /^\d{3,4}$/;
const cvv = z.string().refine((val) => cvvRegex.test(val), {
    message: "CVV inválido",
});

export const createHiringSchema = z.object({
    serviceId: objectId,
    day: z.enum(
        ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"],
        {
            errorMap: () => ({ message: "Día inválido" }),
        }
    ),
    time: z.string().refine((val) => /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val), {
        message: "Formato de hora inválido (HH:MM)",
    }),
    payment: z.object({
        name: z.string().min(2, "El nombre del titular debe tener al menos 2 caracteres"),
        cardNumber: cardNumber,
        expiry: z
            .string()
            .min(5, "La fecha de expiración debe tener al menos 5 caracteres"),
        cvv: cvv,
    }),
});

export const updateHiringStatusSchema = z.object({
    status: z.enum(["pending", "confirmed", "cancelled", "completed"], {
        errorMap: () => ({
            message:
                "El estado debe ser uno de: pending, confirmed, cancelled, completed",
        }),
    }),
});

export const hiringIdSchema = z.object({
    id: objectId,
});

export const trainerIdSchema = z.object({
    trainerId: objectId,
});
