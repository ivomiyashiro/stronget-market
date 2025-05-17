import { config } from "@/config.js";

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
   * Core request method
   */
  private async request<T>(
    method: string,
    url: string,
    data?: unknown
  ): Promise<T> {
    const options: RequestInit = {
      method,
      headers: this.defaultHeaders,
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
        throw new ApiError(response.status, result.error || "Unknown error");
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
