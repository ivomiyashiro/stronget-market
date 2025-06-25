import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import {
  createService,
  getServices,
  getServiceById,
  getServicesByTrainerId,
  updateService,
  deleteService,
} from "./services.thunks";
import {
  clearErrors,
  clearCurrentService,
  setCurrentService,
} from "./services.slice";
import type {
  CreateServiceRequest,
  GetServicesParams,
  Service,
} from "@/services/services.service";

// Selectors
export const useServicesState = () =>
  useSelector((state: RootState) => state.services);

export const useServices = () =>
  useSelector((state: RootState) => state.services.services);

export const useCurrentService = () =>
  useSelector((state: RootState) => state.services.currentService);

export const useServicesLoading = () =>
  useSelector((state: RootState) => state.services.isLoading);

export const useServicesError = () =>
  useSelector((state: RootState) => state.services.error);

export const useCreateServiceLoading = () =>
  useSelector((state: RootState) => state.services.createLoading);

export const useCreateServiceError = () =>
  useSelector((state: RootState) => state.services.createError);

export const useUpdateServiceLoading = () =>
  useSelector((state: RootState) => state.services.updateLoading);

export const useUpdateServiceError = () =>
  useSelector((state: RootState) => state.services.updateError);

export const useDeleteServiceLoading = () =>
  useSelector((state: RootState) => state.services.deleteLoading);

export const useDeleteServiceError = () =>
  useSelector((state: RootState) => state.services.deleteError);

// Actions
export const useServicesActions = () => {
  const dispatch = useDispatch<AppDispatch>();

  return {
    createService: (
      data: CreateServiceRequest,
      onSuccess?: () => void,
      onError?: (error: string) => void
    ) => dispatch(createService({ data, onSuccess, onError })),

    getServices: (params?: GetServicesParams) => dispatch(getServices(params)),

    getServiceById: (id: string) => dispatch(getServiceById(id)),

    getServicesByTrainerId: (trainerId: string, params?: GetServicesParams) =>
      dispatch(getServicesByTrainerId({ id: trainerId, params })),

    updateService: (
      id: string,
      data: Partial<CreateServiceRequest>,
      onSuccess?: () => void,
      onError?: (error: string) => void
    ) => dispatch(updateService({ id, data, onSuccess, onError })),

    deleteService: (
      id: string,
      onSuccess?: () => void,
      onError?: (error: string) => void
    ) => dispatch(deleteService({ id, onSuccess, onError })),

    clearErrors: () => dispatch(clearErrors()),

    clearCurrentService: () => dispatch(clearCurrentService()),

    setCurrentService: (service: Service) =>
      dispatch(setCurrentService(service)),
  };
};
