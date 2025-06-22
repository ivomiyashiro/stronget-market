import type { Service, CreateServiceRequest } from "@/services/services.service";

export interface ServicesState {
  services: Service[];
  currentService: Service | null;
  total: number;
  isLoading: boolean;
  error: string | null;
  createLoading: boolean;
  createError: string | null;
  updateLoading: boolean;
  updateError: string | null;
  deleteLoading: boolean;
  deleteError: string | null;
}

export interface CreateServicePayload {
  data: CreateServiceRequest;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export interface UpdateServicePayload {
  id: string;
  data: Partial<CreateServiceRequest>;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export interface DeleteServicePayload {
  id: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
} 