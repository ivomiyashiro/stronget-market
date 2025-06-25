import { BaseService } from "./base.service";
import { config } from "@/config";

export interface RegisterRequest {
    name: string;
    surname: string;
    email: string;
    password: string;
    birthDay: Date;
    recoverPasswordPin: string;
    role: "cliente" | "entrenador";
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterResponse {
    message: string;
}

export interface LoginResponse {
    token: string;
    user: {
        id: string;
        name: string;
        surname: string;
        email: string;
        birthDay: string;
        avatar?: string;
        role: "cliente" | "entrenador";
    };
}

export interface UploadAvatarResponse {
    message: string;
    avatarUrl: string;
}

export interface DeleteAvatarResponse {
    message: string;
}

// New PIN-based recovery interfaces
export interface InitiatePasswordResetRequest {
    email: string;
    pin: string;
}

export interface InitiatePasswordResetResponse {
    message: string;
}

export interface VerifyPinRequest {
    email: string;
    pin: string;
}

export interface VerifyPinResponse {
    message: string;
    valid: boolean;
}

export interface ResetPasswordWithPinRequest {
    email: string;
    pin: string;
    newPassword: string;
}

export interface ResetPasswordWithPinResponse {
    message: string;
}

export class UserService extends BaseService {
    constructor() {
        super();
    }

    async getUser(id: string) {
        return this.get(`/users/${id}`);
    }

    async register(data: RegisterRequest): Promise<RegisterResponse> {
        return this.post("/users/register", data);
    }

    async login(data: LoginRequest): Promise<LoginResponse> {
        return this.post("/users/login", data);
    }

    async updateUser(id: string, data: Partial<RegisterRequest>) {
        return this.put(`/users/${id}`, data);
    }

    async deleteUser(id: string) {
        return this.delete(`/users/${id}`);
    }

    async uploadAvatar(userId: string, file: File): Promise<UploadAvatarResponse> {
        const formData = new FormData();
        formData.append("avatar", file);

        // Use fetch directly for file upload to avoid JSON content-type header
        const token = localStorage.getItem("token");
        const response = await fetch(`${config.apiUrl}/users/${userId}/avatar`, {
            method: "POST",
            body: formData,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Upload failed");
        }

        return response.json();
    }

    async deleteAvatar(userId: string): Promise<DeleteAvatarResponse> {
        return this.delete(`/users/${userId}/avatar`);
    }

    // New PIN-based recovery methods
    async initiatePasswordReset(
        data: InitiatePasswordResetRequest
    ): Promise<InitiatePasswordResetResponse> {
        return this.post("/users/password-reset/initiate", data);
    }

    async verifyPin(data: VerifyPinRequest): Promise<VerifyPinResponse> {
        return this.post("/users/password-reset/verify-pin", data);
    }

    async resetPasswordWithPin(
        data: ResetPasswordWithPinRequest
    ): Promise<ResetPasswordWithPinResponse> {
        return this.post("/users/password-reset/reset", data);
    }

    private getAuthToken(): string | null {
        return localStorage.getItem("token");
    }
}

export default new UserService();
