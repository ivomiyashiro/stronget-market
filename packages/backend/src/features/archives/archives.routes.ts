import { Router } from "express";
import { ArchivesController } from "./archives.controller";
import {
  validateBody,
  validateParams,
} from "../../middleware/validation.middleware";
import {
  uploadFileSchema,
  getFilesByHiringSchema,
  fileIdSchema,
  deleteFileSchema,
} from "./archives.validation";

const router = Router();
const archivesController = new ArchivesController();

// Upload file for a hiring
// Note: In production, add multer middleware here: archivesController.uploadMiddleware
router.post("/upload", validateBody(uploadFileSchema), archivesController.uploadFile);

// Get files by hiring ID
router.get(
  "/hiring/:hiringId",
  validateParams(getFilesByHiringSchema),
  archivesController.getFilesByHiring
);

// Get file by ID
router.get("/:id", validateParams(fileIdSchema), archivesController.getFileById);

// Delete file
router.delete("/:id", validateParams(deleteFileSchema), archivesController.deleteFile);

// Get current user's files
router.get("/", archivesController.getUserFiles);

export default router;
