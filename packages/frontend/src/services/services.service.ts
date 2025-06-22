import { baseService } from "./base.service";

export interface CreateServiceRequest {
  category: string;
  description: string;
  duration: number;
  price: number;
  mode: "online" | "in-person";
  zone: string;
  language: string;
}

export interface Service {
  id: string;
  trainerId: string;
  category: string;
  title: string;
  description: string;
  duration: number;
  price: number;
  mode: "online" | "in-person";
  zone: string;
  language: string;
  rating: number;
  totalReviews: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetServicesParams {
  category?: string;
  zone?: string;
  minPrice?: number;
  maxPrice?: number;
  duration?: number;
  language?: string;
  mode?: "online" | "in-person";
}

export interface GetServicesResponse {
  services: Service[];
  total: number;
}

export class ServicesService {
  async createService(data: CreateServiceRequest): Promise<Service> {
    return await baseService.post<Service>("/services", data);
  }

  async getServices(params?: GetServicesParams): Promise<GetServicesResponse> {
    const queryParams: Record<string, string> = {};

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams[key] = value.toString();
        }
      });
    }

    return await baseService.get<GetServicesResponse>("/services", queryParams);
  }

  async getServiceById(id: string): Promise<Service> {
    return await baseService.get<Service>(`/services/${id}`);
  }

  async getServicesByTrainerId(id: string): Promise<Service[]> {
    return await baseService.get<Service[]>(`/services/trainer/${id}`);
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
}

// Create singleton instance
export const servicesService = new ServicesService();
