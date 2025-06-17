import Archive from "./archives.model";
import Hiring from "../hiring/hiring.model";
import { Types } from "mongoose";
import { UploadFileRequestDTO } from "./dtos";
import path from "path";
import crypto from "crypto";

// Third-party storage service interface
interface StorageService {
  uploadFile(file: any, key: string): Promise<string>;
  deleteFile(key: string): Promise<void>;
  getFileUrl(key: string): string;
}

// AWS S3 implementation (you can replace with any cloud provider)
class S3StorageService implements StorageService {
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.AWS_S3_BUCKET || "stronget-market-files";
  }

  async uploadFile(file: any, key: string): Promise<string> {
    // TODO: Implement actual S3 upload
    // For now, return a mock URL
    return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
  }

  async deleteFile(key: string): Promise<void> {
    // TODO: Implement actual S3 delete
    console.log(`Deleting file: ${key}`);
  }

  getFileUrl(key: string): string {
    return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
  }
}

export class ArchivesService {
  private storageService: StorageService;

  constructor() {
    this.storageService = new S3StorageService();
  }

  async uploadFile(userId: string, file: any, requestData: UploadFileRequestDTO) {
    // Validate hiring exists and user has access
    const hiring = await Hiring.findOne({
      _id: new Types.ObjectId(requestData.hiringId),
      $or: [
        { clientId: new Types.ObjectId(userId) },
        { trainerId: new Types.ObjectId(userId) },
      ],
    });

    if (!hiring) {
      throw new Error(
        "Hiring not found or you don't have access to upload files for this hiring"
      );
    }

    // Generate unique file key
    const fileExtension = path.extname(file.originalname);
    const fileName = `${crypto.randomUUID()}${fileExtension}`;
    const fileKey = `hirings/${requestData.hiringId}/${fileName}`;

    try {
      // Upload to third-party service
      const fileUrl = await this.storageService.uploadFile(file, fileKey);

      // Save metadata to DB
      const archive = new Archive({
        hiringId: new Types.ObjectId(requestData.hiringId),
        uploadedBy: new Types.ObjectId(userId),
        fileName,
        originalName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        fileUrl,
        fileKey,
      });

      await archive.save();

      return archive.populate("uploadedBy", "name surname");
    } catch (error) {
      throw new Error(
        `File upload failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getFilesByHiring(userId: string, hiringId: string) {
    // Validate user has access to this hiring
    const hiring = await Hiring.findOne({
      _id: new Types.ObjectId(hiringId),
      $or: [
        { clientId: new Types.ObjectId(userId) },
        { trainerId: new Types.ObjectId(userId) },
      ],
    });

    if (!hiring) {
      throw new Error(
        "Hiring not found or you don't have access to view files for this hiring"
      );
    }

    return Archive.find({
      hiringId: new Types.ObjectId(hiringId),
      isActive: true,
    })
      .populate("uploadedBy", "name surname")
      .sort({ uploadDate: -1 });
  }

  async getFileById(userId: string, fileId: string) {
    const archive = await Archive.findById(fileId)
      .populate("uploadedBy", "name surname")
      .populate("hiringId");

    if (!archive || !archive.isActive) {
      throw new Error("File not found");
    }

    // Check if user has access to this file's hiring
    const hiring = await Hiring.findOne({
      _id: archive.hiringId,
      $or: [
        { clientId: new Types.ObjectId(userId) },
        { trainerId: new Types.ObjectId(userId) },
      ],
    });

    if (!hiring) {
      throw new Error("You don't have access to this file");
    }

    return archive;
  }

  async deleteFile(userId: string, fileId: string) {
    const archive = await Archive.findById(fileId);

    if (!archive || !archive.isActive) {
      throw new Error("File not found");
    }

    // Check if user uploaded this file or has access to the hiring
    const hiring = await Hiring.findOne({
      _id: archive.hiringId,
      $or: [
        { clientId: new Types.ObjectId(userId) },
        { trainerId: new Types.ObjectId(userId) },
      ],
    });

    if (!hiring && archive.uploadedBy.toString() !== userId) {
      throw new Error("You don't have permission to delete this file");
    }

    try {
      // Delete from third-party service
      await this.storageService.deleteFile(archive.fileKey);

      // Soft delete from DB
      archive.isActive = false;
      archive.updatedAt = new Date();
      await archive.save();

      return { message: "File deleted successfully" };
    } catch (error) {
      throw new Error(
        `File deletion failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async getUserFiles(userId: string) {
    return Archive.find({
      uploadedBy: new Types.ObjectId(userId),
      isActive: true,
    })
      .populate("hiringId", "date status")
      .sort({ uploadDate: -1 });
  }
}
