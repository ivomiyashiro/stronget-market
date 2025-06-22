import Archive from "./archives.model";
import Hiring from "../hiring/hiring.model";
import { Types } from "mongoose";
import { UploadFileRequestDTO } from "./dtos";
import path from "path";
import crypto from "crypto";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { config } from "../../config/index";

// Third-party storage service interface
interface StorageService {
  uploadFile(file: any, key: string): Promise<string>;
  deleteFile(key: string): Promise<void>;
  getFileUrl(key: string): string;
}

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

// Supabase Storage implementation
class SupabaseStorageService implements StorageService {
  private supabase: SupabaseClient;
  private readonly bucketName = "archives";

  constructor() {
    this.supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey);
    this.ensureBucketExists();
  }

  private async ensureBucketExists(): Promise<void> {
    try {
      // Check if bucket exists
      const { data: buckets, error: listError } =
        await this.supabase.storage.listBuckets();

      if (listError) {
        console.warn("Error listing buckets:", listError.message);
        return;
      }

      const bucketExists = buckets?.some((bucket) => bucket.name === this.bucketName);

      if (!bucketExists) {
        // Create public bucket for archives
        const { error: createError } = await this.supabase.storage.createBucket(
          this.bucketName,
          {
            public: false, // Private bucket for sensitive documents
            allowedMimeTypes: [
              "application/pdf",
              "application/msword",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              "text/plain",
              "image/jpeg",
              "image/png",
              "image/gif",
              "application/zip",
              "application/x-rar-compressed",
            ],
            fileSizeLimit: 10485760, // 10MB
          }
        );

        if (createError) {
          console.error("Error creating archives bucket:", createError.message);
        } else {
          console.log(`Private bucket '${this.bucketName}' created successfully`);
        }
      }
    } catch (error) {
      console.error("Error ensuring archives bucket exists:", error);
    }
  }

  async uploadFile(file: MulterFile, key: string): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(key, file.buffer, {
        contentType: file.mimetype,
        upsert: false, // Don't overwrite existing files
      });

    if (error) {
      throw new Error(`Supabase upload error: ${error.message}`);
    }

    // For private buckets, we'll store the path and generate signed URLs when needed
    return key;
  }

  async deleteFile(key: string): Promise<void> {
    const { error } = await this.supabase.storage.from(this.bucketName).remove([key]);

    if (error) {
      throw new Error(`Supabase delete error: ${error.message}`);
    }
  }

  getFileUrl(key: string): string {
    // For private buckets, return the key - we'll generate signed URLs when needed
    return key;
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .createSignedUrl(key, expiresIn);

    if (error) {
      throw new Error(`Error creating signed URL: ${error.message}`);
    }

    return data.signedUrl;
  }
}

// AWS S3 implementation (kept for fallback)
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
  private storageService: SupabaseStorageService;

  constructor() {
    this.storageService = new SupabaseStorageService();
  }

  async uploadFile(userId: string, file: MulterFile, requestData: UploadFileRequestDTO) {
    // Validate file type
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

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error(
        "File type not supported. Supported types: PDF, DOCX, DOC, TXT, images, ZIP, RAR"
      );
    }

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
      // Upload to Supabase storage
      const storagePath = await this.storageService.uploadFile(file, fileKey);

      // Save metadata to DB
      const archive = new Archive({
        hiringId: new Types.ObjectId(requestData.hiringId),
        uploadedBy: new Types.ObjectId(userId),
        fileName,
        originalName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        fileUrl: storagePath, // Store the storage path
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

    const archives = await Archive.find({
      hiringId: new Types.ObjectId(hiringId),
      isActive: true,
    })
      .populate("uploadedBy", "name surname")
      .sort({ uploadDate: -1 });

    // Generate signed URLs for file access
    const archivesWithUrls = await Promise.all(
      archives.map(async (archive) => {
        try {
          const signedUrl = await this.storageService.getSignedUrl(archive.fileKey, 3600); // 1 hour expiry
          return {
            ...archive.toObject(),
            downloadUrl: signedUrl,
          };
        } catch (error) {
          console.error(`Error generating signed URL for ${archive.fileKey}:`, error);
          return {
            ...archive.toObject(),
            downloadUrl: null,
          };
        }
      })
    );

    return archivesWithUrls;
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

    // Generate signed URL for file download
    try {
      const signedUrl = await this.storageService.getSignedUrl(archive.fileKey, 3600);
      return {
        ...archive.toObject(),
        downloadUrl: signedUrl,
      };
    } catch (error) {
      console.error(`Error generating signed URL for ${archive.fileKey}:`, error);
      return {
        ...archive.toObject(),
        downloadUrl: null,
      };
    }
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
      // Delete from Supabase storage
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
    const archives = await Archive.find({
      uploadedBy: new Types.ObjectId(userId),
      isActive: true,
    })
      .populate("hiringId", "date status")
      .sort({ uploadDate: -1 });

    // Generate signed URLs for user's files
    const archivesWithUrls = await Promise.all(
      archives.map(async (archive) => {
        try {
          const signedUrl = await this.storageService.getSignedUrl(archive.fileKey, 3600);
          return {
            ...archive.toObject(),
            downloadUrl: signedUrl,
          };
        } catch (error) {
          console.error(`Error generating signed URL for ${archive.fileKey}:`, error);
          return {
            ...archive.toObject(),
            downloadUrl: null,
          };
        }
      })
    );

    return archivesWithUrls;
  }
}
