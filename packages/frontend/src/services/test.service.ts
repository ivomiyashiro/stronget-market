import { baseService } from "./base.service";

export interface RootResponse {
  message?: string;
  status?: string;
  version?: string;
  [key: string]: unknown;
}

export class TestService {
  async getServerInfo(): Promise<RootResponse> {
    try {
      return await baseService.get<RootResponse>("/");
    } catch (error) {
      console.error("Error fetching server info:", error);
      return { message: "Failed to fetch server info" };
    }
  }
}

// Create singleton instance
export const testService = new TestService();
