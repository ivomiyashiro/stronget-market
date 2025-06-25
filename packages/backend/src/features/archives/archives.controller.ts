import { Request, Response } from "express";
import { ArchivesService } from "./archives.service";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class ArchivesController {
  private archivesService: ArchivesService;

  constructor() {
    this.archivesService = new ArchivesService();
  }

  uploadFile = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const file = req.file;
      if (!file) {
        res.status(400).json({ message: "No file uploaded" });
        return;
      }

      const archive = await this.archivesService.uploadFileWithMetadata(file, {
        ...req.body,
        uploadedBy: userId,
      });
      res.status(201).json(archive);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "File upload failed",
      });
    }
  };

  getFilesByHiring = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const { hiringId } = req.params;
      const files = await this.archivesService.getFilesByHiring(hiringId);
      res.status(200).json(files);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "Get files failed",
      });
    }
  };

  getFileById = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const { id } = req.params;
      const file = await this.archivesService.getFileById(id);
      if (!file) {
        res.status(404).json({ message: "File not found" });
        return;
      }
      res.status(200).json(file);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "Get file failed",
      });
    }
  };

  deleteFile = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const { id } = req.params;
      const result = await this.archivesService.deleteFileById(id);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "Delete file failed",
      });
    }
  };

  getUserFiles = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const files = await this.archivesService.getUserFiles();
      res.status(200).json(files);
    } catch (error) {
      res.status(400).json({
        message:
          error instanceof Error ? error.message : "Get user files failed",
      });
    }
  };
}
