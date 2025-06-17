import { z } from "zod";

// Custom validator for MongoDB ObjectId
const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectId = z.string().refine((val) => objectIdRegex.test(val), {
  message: "Invalid ObjectId format",
});

export const uploadFileSchema = z.object({
  hiringId: objectId,
});

export const getFilesByHiringSchema = z.object({
  hiringId: objectId,
});

export const fileIdSchema = z.object({
  id: objectId,
});

export const deleteFileSchema = z.object({
  id: objectId,
});

// File validation for multer middleware
export const fileUploadValidation = {
  fileFilter: (req: any, file: any, cb: any) => {
    // Allow common file types
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "application/zip",
      "application/x-rar-compressed",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed"), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
};
