import { createAsyncThunk } from "@reduxjs/toolkit";
import { servicesService } from "@/services/services.service";
import type { GetServicesParams } from "@/services/services.service";
import type {
  CreateServicePayload,
  UpdateServicePayload,
  DeleteServicePayload,
} from "./services.types";

export const createService = createAsyncThunk(
  "services/createService",
  async (payload: CreateServicePayload, { rejectWithValue }) => {
    try {
      const service = await servicesService.createService(payload.data);

      // Call success callback if provided
      if (payload.onSuccess) {
        payload.onSuccess();
      }

      return service;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create service";

      // Call error callback if provided
      if (payload.onError) {
        payload.onError(errorMessage);
      }

      return rejectWithValue(errorMessage);
    }
  }
);

export const getServices = createAsyncThunk(
  "services/getServices",
  async (params: GetServicesParams | undefined, { rejectWithValue }) => {
    try {
      const response = await servicesService.getServices(params);
      return response;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch services";
      return rejectWithValue(errorMessage);
    }
  }
);

export const getServiceById = createAsyncThunk(
  "services/getServiceById",
  async (id: string, { rejectWithValue }) => {
    try {
      const service = await servicesService.getServiceById(id);
      return service;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch service";
      return rejectWithValue(errorMessage);
    }
  }
);

export const getServicesByTrainerId = createAsyncThunk(
  "services/getServicesByTrainerId",
  async (id: string, { rejectWithValue }) => {
    try {
      const services = await servicesService.getServicesByTrainerId(id);
      return services;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch trainer services";
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateService = createAsyncThunk(
  "services/updateService",
  async (payload: UpdateServicePayload, { rejectWithValue }) => {
    try {
      const service = await servicesService.updateService(
        payload.id,
        payload.data
      );

      // Call success callback if provided
      if (payload.onSuccess) {
        payload.onSuccess();
      }

      return service;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update service";

      // Call error callback if provided
      if (payload.onError) {
        payload.onError(errorMessage);
      }

      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteService = createAsyncThunk(
  "services/deleteService",
  async (payload: DeleteServicePayload, { rejectWithValue }) => {
    try {
      const result = await servicesService.deleteService(payload.id);

      // Call success callback if provided
      if (payload.onSuccess) {
        payload.onSuccess();
      }

      return { id: payload.id, message: result.message };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete service";

      // Call error callback if provided
      if (payload.onError) {
        payload.onError(errorMessage);
      }

      return rejectWithValue(errorMessage);
    }
  }
);
