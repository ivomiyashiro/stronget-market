import { z } from "zod";

export const registerSchema = z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    surname: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    birthDay: z.string().transform((str) => new Date(str)),
    recoverPasswordPin: z.string().min(4, "El PIN debe tener al menos 4 caracteres"),
    role: z.enum(["cliente", "entrenador"], {
        errorMap: () => ({ message: 'El rol debe ser "cliente" o "entrenador"' }),
    }),
});

export const loginSchema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(1, "La contraseña es requerida"),
});

export const updateUserSchema = z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
    surname: z.string().min(2, "El apellido debe tener al menos 2 caracteres").optional(),
    email: z.string().email("Email inválido").optional(),
    password: z
        .string()
        .min(6, "La contraseña debe tener al menos 6 caracteres")
        .optional(),
    birthDay: z
        .string()
        .transform((str) => new Date(str))
        .optional(),
    role: z
        .enum(["cliente", "entrenador"], {
            errorMap: () => ({ message: 'El rol debe ser "cliente" o "entrenador"' }),
        })
        .optional(),
});

// Legacy password recovery (keep for backward compatibility)
export const passwordRecoverySchema = z.object({
    email: z.string().email("Email inválido"),
    newPassword: z
        .string()
        .min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
});

// New PIN-based recovery schemas
export const initiatePasswordResetSchema = z.object({
    email: z.string().email("Email inválido"),
    pin: z.string().min(4, "El PIN debe tener al menos 4 caracteres"),
});

export const verifyPinSchema = z.object({
    email: z.string().email("Email inválido"),
    pin: z.string().min(4, "El PIN debe tener al menos 4 caracteres"),
});

export const resetPasswordWithPinSchema = z.object({
    email: z.string().email("Email inválido"),
    pin: z.string().min(4, "El PIN debe tener al menos 4 caracteres"),
    newPassword: z
        .string()
        .min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
});
