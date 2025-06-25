import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { config } from "../../config/index";
import Archive from "./archives.model";
import Hiring from "../hiring/hiring.model";
import { Types } from "mongoose";
import { UploadFileRequestDTO } from "./dtos";
import path from "path";
import crypto from "crypto";

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

export class ArchivesService implements StorageService {
    private supabase: SupabaseClient;
    private readonly bucketName = "archives";

    constructor() {
        this.supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey);
        this.ensureBucketExists();
    }

    private async ensureBucketExists(): Promise<void> {
        try {
            const { data: buckets, error: listError } =
                await this.supabase.storage.listBuckets();

            if (listError) {
                console.warn("Error listing buckets:", listError.message);
                return;
            }

            const bucketExists = buckets?.some(
                (bucket) => bucket.name === this.bucketName
            );

            if (!bucketExists) {
                const { error: createError } = await this.supabase.storage.createBucket(
                    this.bucketName,
                    {
                        public: false,
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
                        fileSizeLimit: 10485760,
                    }
                );

                if (createError) {
                    console.error("Error creating archives bucket:", createError.message);
                } else {
                    console.log(
                        `Private bucket '${this.bucketName}' created successfully`
                    );
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
                    upsert: false,
            });

        if (error) {
            throw new Error(`Supabase upload error: ${error.message}`);
        }

        return key;
    }

    async deleteFile(key: string): Promise<void> {
        const { error } = await this.supabase.storage.from(this.bucketName).remove([key]);

        if (error) {
            throw new Error(`Supabase delete error: ${error.message}`);
        }
    }

    getFileUrl(key: string): string {
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

    async uploadFileWithMetadata(
        file: MulterFile,
        requestData: UploadFileRequestDTO & { uploadedBy: string }
    ) {
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

        const hiring = await Hiring.findById(requestData.hiringId);
        if (!hiring) {
            throw new Error("Hiring not found");
        }

        const fileExtension = path.extname(file.originalname);
        const fileName = `${crypto.randomUUID()}${fileExtension}`;
        const fileKey = `hirings/${requestData.hiringId}/${fileName}`;

        try {
            const storagePath = await this.uploadFile(file, fileKey);

            const archive = new Archive({
                hiringId: new Types.ObjectId(requestData.hiringId),
                uploadedBy: new Types.ObjectId(requestData.uploadedBy),
                fileName,
                originalName: file.originalname,
                fileSize: file.size,
                mimeType: file.mimetype,
                fileUrl: storagePath,
                fileKey,
            });

            await archive.save();

            const populatedArchive = await archive.populate("uploadedBy", "name surname");

            try {
                const signedUrl = await this.getSignedUrl(archive.fileKey, 3600);
                return {
                    ...populatedArchive.toObject(),
                    downloadUrl: signedUrl,
                };
            } catch (error) {
                console.error(
                    `Error generating signed URL for ${archive.fileKey}:`,
                    error
                );
                return {
                    ...populatedArchive.toObject(),
                    downloadUrl: null,
                };
            }
        } catch (error) {
            console.log(error);
            throw new Error(
                `File upload failed: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        }
    }

    async getFilesByHiring(hiringId: string) {
        const archives = await Archive.find({
            hiringId: new Types.ObjectId(hiringId),
            isActive: true,
        })
            .populate("uploadedBy", "name surname")
            .sort({ uploadDate: -1 });

        const archivesWithUrls = await Promise.all(
            archives.map(async (archive) => {
                try {
                    const signedUrl = await this.getSignedUrl(archive.fileKey, 3600);
                    return {
                        ...archive.toObject(),
                        downloadUrl: signedUrl,
                    };
                } catch (error) {
                    console.error(
                        `Error generating signed URL for ${archive.fileKey}:`,
                        error
                    );
                    return {
                        ...archive.toObject(),
                        downloadUrl: null,
                    };
                }
            })
        );

        return archivesWithUrls;
    }

    async getFileById(fileId: string) {
        const archive = await Archive.findById(fileId)
            .populate("uploadedBy", "name surname")
            .populate("hiringId");

        if (!archive || !archive.isActive) {
            throw new Error("File not found");
        }

        try {
            const signedUrl = await this.getSignedUrl(archive.fileKey, 3600);
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

    async deleteFileById(fileId: string) {
        const archive = await Archive.findById(fileId);

        if (!archive || !archive.isActive) {
            throw new Error("File not found");
        }

        try {
            await this.deleteFile(archive.fileKey);

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

    async getUserFiles() {
        const archives = await Archive.find({
            isActive: true,
        })
            .populate("uploadedBy", "name surname")
            .populate("hiringId", "date status")
            .sort({ uploadDate: -1 });

        const archivesWithUrls = await Promise.all(
            archives.map(async (archive) => {
                try {
                    const signedUrl = await this.getSignedUrl(archive.fileKey, 3600);
                    return {
                        ...archive.toObject(),
                        downloadUrl: signedUrl,
                    };
                } catch (error) {
                    console.error(
                        `Error generating signed URL for ${archive.fileKey}:`,
                        error
                    );
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
