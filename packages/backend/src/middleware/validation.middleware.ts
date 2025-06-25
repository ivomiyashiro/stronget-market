import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

export const validateBody = (schema: z.ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessages = error.errors.map((err) => ({
                    field: err.path.join("."),
                    message: err.message,
                }));

                return res.status(400).json({
                    message: "Datos de entrada inválidos",
                    errors: errorMessages,
                });
            }

            return res.status(400).json({
                message: "Error de validación",
            });
        }
    };
};

export const validateParams = (schema: z.ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.params = schema.parse(req.params);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessages = error.errors.map((err) => ({
                    field: err.path.join("."),
                    message: err.message,
                }));

                return res.status(400).json({
                    message: "Parámetros inválidos",
                    errors: errorMessages,
                });
            }

            return res.status(400).json({
                message: "Error de validación de parámetros",
            });
        }
    };
};

export const validateQuery = (schema: z.ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.query = schema.parse(req.query);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessages = error.errors.map((err) => ({
                    field: err.path.join("."),
                    message: err.message,
                }));

                return res.status(400).json({
                    message: "Parámetros de consulta inválidos",
                    errors: errorMessages,
                });
            }

            return res.status(400).json({
                message: "Error de validación de parámetros de consulta",
            });
        }
    };
};
