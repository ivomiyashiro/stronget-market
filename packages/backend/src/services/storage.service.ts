import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { config } from "../config/index";

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export class StorageService {
  private supabase: SupabaseClient;
  private readonly bucketName = "avatars";

  constructor() {
    this.supabase = createClient(
      config.supabase.url,
      config.supabase.serviceRoleKey
    );
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
            public: true,
            allowedMimeTypes: [
              "image/jpeg",
              "image/jpg",
              "image/png",
              "image/webp",
            ],
            fileSizeLimit: 5242880,
          }
        );

        if (createError) {
          console.error("Error creating bucket:", createError.message);
        } else {
          console.log(
            `Public bucket '${this.bucketName}' created successfully`
          );
        }
      }
    } catch (error) {
      console.error("Error ensuring bucket exists:", error);
    }
  }

  async uploadAvatar(
    userId: string,
    file: MulterFile
  ): Promise<{ url: string; path: string }> {
    const fileExt = file.originalname.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      throw new Error(`Error uploading file: ${error.message}`);
    }

    const { data: publicUrlData } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);

    return {
      url: publicUrlData.publicUrl,
      path: filePath,
    };
  }

  async deleteAvatar(filePath: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .remove([filePath]);

    if (error) {
      throw new Error(`Error deleting file: ${error.message}`);
    }
  }

  async updateAvatar(
    userId: string,
    file: MulterFile,
    oldFilePath?: string
  ): Promise<{ url: string; path: string }> {
    if (oldFilePath) {
      try {
        await this.deleteAvatar(oldFilePath);
      } catch (error) {
        console.warn("Failed to delete old avatar:", error);
      }
    }

    return this.uploadAvatar(userId, file);
  }

  getPublicUrl(filePath: string): string {
    const { data } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
}
