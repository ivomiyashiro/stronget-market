import { baseService } from "./base.service";

export interface CreateServiceRequest {
  category: string;
  description: string;
  duration: number;
  price: number;
  mode: "online" | "in-person";
  zone: string;
  language: string;
  availability: {
    day: string;
    startTime: string;
  }[];
}

export interface Service {
  id: string;
  category: string;
  description: string;
  duration: number;
  language: string;
  mode: "online" | "in-person";
  pendings: number;
  price: number;
  rating: number;
  totalReviews: number;
  trainerImage: string;
  visualizations: number;
  zone: string;
  clients: number;
  availability: {
    day: string;
    startTime: string;
  }[];
  trainerId: string;
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
}

export interface GetServicesResponse {
  services: Service[];
  total: number;
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

    return await baseService.get<Service[]>(`/services/trainer/${id}`, queryParams);
  }

  async updateService(id: string, data: Partial<CreateServiceRequest>): Promise<Service> {
    return await baseService.put<Service>(`/services/${id}`, data);
  }

  async deleteService(id: string): Promise<{ message: string }> {
    return await baseService.delete<{ message: string }>(`/services/${id}`);
  }
}

// Create singleton instance
export const servicesService = new ServicesService();
