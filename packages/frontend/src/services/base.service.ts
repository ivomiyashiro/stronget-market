import { config } from "@/config";

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

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    return this.request<T>("GET", url);
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>("POST", url, data);
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>("PUT", url, data);
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>("PATCH", url, data);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>("DELETE", url);
  }

  private handleTokenExpiration(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  }

  private async request<T>(
    method: string,
    url: string,
    data?: unknown
  ): Promise<T> {
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
    } as Record<string, string>;

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

      if (response.status === 204) {
        return {} as T;
      }

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          const errorMessage = result.message || result.error || "";
          if (
            errorMessage.includes("token") ||
            errorMessage.includes("expired") ||
            errorMessage.includes("invalid") ||
            errorMessage.includes("Unauthorized") ||
            errorMessage.includes("Forbidden")
          ) {
            this.handleTokenExpiration();
            throw new ApiError(
              response.status,
              "Session expired. Please log in again."
            );
          }
        }

        throw new ApiError(
          response.status,
          result.error || result.message || "Unknown error"
        );
      }

      return result as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, (error as Error).message || "Request failed");
    }
  }

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

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

export const baseService = new BaseService();
