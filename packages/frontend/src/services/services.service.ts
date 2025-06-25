import { baseService } from "./base.service";

export interface CreateServiceRequest {
  category: string;
  description: string;
  duration: number;
  price: number;
  mode: "online" | "in-person";
  zone: string;
  language: string;
  maxPeople: number;
  status?: "active" | "inactive";
  availability: {
    day: string;
    startTime: string;
  }[];
}

export interface Service {
  id: string;
  trainerName: string;
  category: string;
  description: string;
  duration: number;
  language: string;
  mode: "online" | "in-person";
  pendings: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
  }[];
  price: number;
  rating: number;
  totalReviews: number;
  trainerImage: string;
  visualizations: number;
  zone: string;
  clients: number;
  maxPeople: number;
  status: "active" | "inactive";
  availability: {
    day: string;
    startTime: string;
  }[];
  trainerId: string;
  hiringId?: string; // Optional hiring ID for client services
  hiringStatus?: "pending" | "confirmed" | "cancelled" | "rejected" | "completed"; // Optional hiring status for client services
}

export interface GetServicesParams {
  category?: string[];
  zone?: string[];
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
  language?: string[];
  mode?: "online" | "in-person" | "both";
  trainerId?: string;
  rating?: number[];
  search?: string;
}

export interface GetServicesResponse {
  services: Service[];
  total: number;
}

export interface ServiceClient {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  hiringId: string;
  status: "pending" | "confirmed" | "cancelled" | "rejected" | "completed";
  day: string;
  time: string;
  birthDate: Date;
}

export class ServicesService {
  async createService(data: CreateServiceRequest): Promise<Service> {
    return await baseService.post<Service>("/services", data);
  }

  async getServices(params?: GetServicesParams): Promise<Service[]> {
    const queryParams: Record<string, string> = {};

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams[key] = value.toString();
        }
      });
    }

    return await baseService.get<Service[]>("/services", queryParams);
  }

  async getServiceById(id: string): Promise<Service> {
    return await baseService.get<Service>(`/services/${id}`);
  }

  async getServicesByTrainerId(
    id: string,
    params?: GetServicesParams
  ): Promise<Service[]> {
    const queryParams: Record<string, string> = {};

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams[key] = value.toString();
        }
      });
    }

    return await baseService.get<Service[]>(
      `/services/trainer/${id}`,
      queryParams
    );
  }

  async updateService(
    id: string,
    data: Partial<CreateServiceRequest>
  ): Promise<Service> {
    return await baseService.put<Service>(`/services/${id}`, data);
  }

  async deleteService(id: string): Promise<{ message: string }> {
    return await baseService.delete<{ message: string }>(`/services/${id}`);
  }

  async getUserServices(params?: GetServicesParams): Promise<Service[]> {
    const queryParams: Record<string, string> = {};

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams[key] = value.toString();
        }
      });
    }

    return await baseService.get<Service[]>("/users/services", queryParams);
  }

  async trackVisualization(serviceId: string): Promise<{ message: string }> {
    return await baseService.post<{ message: string }>(`/services/${serviceId}/track-visualization`);
  }

  async getServiceClients(serviceId: string): Promise<ServiceClient[]> {
    return await baseService.get<ServiceClient[]>(`/services/${serviceId}/clients`);
  }
}

// Create singleton instance
export const servicesService = new ServicesService();
