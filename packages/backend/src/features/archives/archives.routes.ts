import { Router } from "express";
import { ArchivesController } from "./archives.controller";
import {
  validateBody,
  validateParams,
} from "../../middleware/validation.middleware";
import { authenticateToken } from "../../middleware/auth.middleware";
import {
  uploadArchiveFile,
  handleUploadError,
} from "../../middleware/upload.middleware";
import {
  uploadFileSchema,
  getFilesByHiringSchema,
  fileIdSchema,
  deleteFileSchema,
} from "./archives.validation";

const router = Router();
const archivesController = new ArchivesController();

router.post(
  "/upload",
  authenticateToken,
  uploadArchiveFile,
  handleUploadError,
  validateBody(uploadFileSchema),
  archivesController.uploadFile
);

router.get(
  "/hiring/:hiringId",
  authenticateToken,
  validateParams(getFilesByHiringSchema),
  archivesController.getFilesByHiring
);

router.get(
  "/:id",
  authenticateToken,
  validateParams(fileIdSchema),
  archivesController.getFileById
);

router.delete(
  "/:id",
  authenticateToken,
  validateParams(deleteFileSchema),
  archivesController.deleteFile
);

router.get("/", authenticateToken, archivesController.getUserFiles);

export default router;
