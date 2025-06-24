import { config } from "@/config";

/**
 * Base service for handling API requests
 */
export class BaseService {
    private baseUrl: string;
    private defaultHeaders: HeadersInit;

    constructor(baseUrl: string = config.apiUrl) {
        this.baseUrl = baseUrl;
        this.defaultHeaders = {
            "Content-Type": "application/json",
            Accept: "application/json",
        };
    }

    /**
     * Perform a GET request
     */
    async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
        const url = this.buildUrl(endpoint, params);
        return this.request<T>("GET", url);
    }

    /**
     * Perform a POST request
     */
    async post<T>(endpoint: string, data?: unknown): Promise<T> {
        const url = this.buildUrl(endpoint);
        return this.request<T>("POST", url, data);
    }

    /**
     * Perform a PUT request
     */
    async put<T>(endpoint: string, data?: unknown): Promise<T> {
        const url = this.buildUrl(endpoint);
        return this.request<T>("PUT", url, data);
    }

    /**
     * Perform a PATCH request
     */
    async patch<T>(endpoint: string, data?: unknown): Promise<T> {
        const url = this.buildUrl(endpoint);
        return this.request<T>("PATCH", url, data);
    }

    /**
     * Perform a DELETE request
     */
    async delete<T>(endpoint: string): Promise<T> {
        const url = this.buildUrl(endpoint);
        return this.request<T>("DELETE", url);
    }

    /**
     * Handle token expiration by clearing localStorage and redirecting to login
     */
    private handleTokenExpiration(): void {
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login page
        window.location.href = '/login';
    }

    /**
     * Core request method
     */
    private async request<T>(method: string, url: string, data?: unknown): Promise<T> {
        const headers: Record<string, string> = { ...this.defaultHeaders } as Record<
            string,
            string
        >;

        // Add authorization header if token exists
        const token = localStorage.getItem("token");
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const options: RequestInit = {
            method,
            headers,
            credentials: "include",
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);

            // Handle non-JSON responses (like no content 204)
            if (response.status === 204) {
                return {} as T;
            }

            const result = await response.json();

            if (!response.ok) {
                // Handle token expiration (401 Unauthorized or 403 Forbidden)
                if (response.status === 401 || response.status === 403) {
                    // Check if the error message indicates token issues
                    const errorMessage = result.message || result.error || "";
                    if (
                        errorMessage.includes("token") || 
                        errorMessage.includes("expired") || 
                        errorMessage.includes("invalid") ||
                        errorMessage.includes("Unauthorized") ||
                        errorMessage.includes("Forbidden")
                    ) {
                        this.handleTokenExpiration();
                        throw new ApiError(response.status, "Session expired. Please log in again.");
                    }
                }
                
                throw new ApiError(response.status, result.error || result.message || "Unknown error");
            }

            return result as T;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(500, (error as Error).message || "Request failed");
        }
    }

    /**
     * Build URL with optional query parameters
     */
    private buildUrl(endpoint: string, params?: Record<string, string>): string {
        const url = new URL(`${this.baseUrl}${endpoint}`, window.location.origin);

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                url.searchParams.append(key, value);
            });
        }

        return url.toString();
    }
}

/**
 * Custom API error with status code
 */
export class ApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
        this.name = "ApiError";
    }
}

/**
 * Create a singleton instance of the base service
 */
export const baseService = new BaseService();
