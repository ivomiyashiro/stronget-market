import { BaseService } from "./base.service";
import { config } from "@/config";

export interface ArchiveFile {
    _id: string;
    originalName: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    uploadDate: string;
    downloadUrl: string;
    uploadedBy: {
        name: string;
        surname: string;
    };
}

export interface UploadFileRequest {
    hiringId: string;
}

export class ArchivesService extends BaseService {
    private readonly endpoint = "/archives";

    /**
     * Get files by hiring ID
     */
    async getFilesByHiring(hiringId: string): Promise<ArchiveFile[]> {
        return this.get<ArchiveFile[]>(`${this.endpoint}/hiring/${hiringId}`);
    }

    /**
     * Upload a file for a hiring
     */
    async uploadFile(hiringId: string, file: File): Promise<ArchiveFile> {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("hiringId", hiringId);

        // Use fetch directly for file upload
        const response = await fetch(`${config.apiUrl}${this.endpoint}/upload`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${this.getAuthToken()}`,
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Delete a file
     */
    async deleteFile(fileId: string): Promise<{ message: string }> {
        return this.delete<{ message: string }>(`${this.endpoint}/${fileId}`);
    }

    /**
     * Get file by ID
     */
    async getFileById(fileId: string): Promise<ArchiveFile> {
        return this.get<ArchiveFile>(`${this.endpoint}/${fileId}`);
    }

    /**
     * Get user files
     */
    async getUserFiles(): Promise<ArchiveFile[]> {
        return this.get<ArchiveFile[]>(`${this.endpoint}/my`);
    }

    private getAuthToken(): string {
        return localStorage.getItem("token") || "";
    }
}

export const archivesService = new ArchivesService();
