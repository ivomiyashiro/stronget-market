import multer from "multer";
import { Request, Response, NextFunction } from "express";

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Solo se permiten archivos de imagen"));
    }
};

// Configure multer with options
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});

// File filter for archives (documents, images, compressed files)
const archiveFileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "image/jpeg",
        "image/png",
        "image/gif",
        "application/zip",
        "application/x-rar-compressed",
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Tipo de archivo no permitido. Tipos permitidos: PDF, DOCX, DOC, TXT, imágenes, ZIP, RAR"
            )
        );
    }
};

// Configure multer for archives
const archiveUpload = multer({
    storage,
    fileFilter: archiveFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit for archives
    },
});

// Middleware for single avatar upload
export const uploadAvatar = upload.single("avatar");

// Middleware for single archive file upload
export const uploadArchiveFile = archiveUpload.single("file");

// Error handling middleware for multer
export const handleUploadError = (
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res
                .status(400)
                .json({ error: "El archivo es demasiado grande. Máximo 10MB." });
        }
        if (error.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({ error: "Campo de archivo inesperado." });
        }
    }

    if (error.message === "Solo se permiten archivos de imagen") {
        return res.status(400).json({ error: error.message });
    }

    if (error.message.includes("Tipo de archivo no permitido")) {
        return res.status(400).json({ error: error.message });
    }

    next(error);
};
