import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectId = z.string().refine((val) => objectIdRegex.test(val), {
    message: "Fecha inválida",
});

const cardNumberRegex = /^\d{16}$/;
const cardNumber = z
    .string()
    .refine((val) => cardNumberRegex.test(val.replace(/\s/g, "")), {
        message: "Número de tarjeta inválido",
    });

const cvvRegex = /^\d{3,4}$/;
const cvv = z.string().refine((val) => cvvRegex.test(val), {
    message: "CVV inválido",
});

export const createHiringSchema = z.object({
    serviceId: objectId,
    day: z.string().min(1, "Día inválido"),
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
    status: z.enum(["pending", "confirmed", "cancelled", "rejected", "completed"], {
        errorMap: () => ({
            message:
                "El estado debe ser uno de: pending, confirmed, cancelled, rejected, completed",
        }),
    }),
});

export const hiringIdSchema = z.object({
    id: objectId,
});

export const trainerIdSchema = z.object({
    trainerId: objectId,
});
