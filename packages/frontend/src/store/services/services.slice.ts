import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { ServicesState } from "./services.types";
import type { Service } from "@/services/services.service";
import {
  createService,
  getServices,
  getServiceById,
  getServicesByTrainerId,
  updateService,
  deleteService,
} from "./services.thunks";

const initialState: ServicesState = {
  services: [],
  currentService: null,
  total: 0,
  isLoading: false,
  error: null,
  createLoading: false,
  createError: null,
  updateLoading: false,
  updateError: null,
  deleteLoading: false,
  deleteError: null,
};

export const servicesSlice = createSlice({
  name: "services",
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
    },
    clearCurrentService: (state) => {
      state.currentService = null;
    },
    setCurrentService: (state, action: PayloadAction<Service>) => {
      state.currentService = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Create Service
    builder
      .addCase(createService.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createService.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createError = null;
        // Add the new service to the list
        state.services.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createService.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload as string;
      });

    // Get Services
    builder
      .addCase(getServices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getServices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.services = action.payload.services;
        state.total = action.payload.total;
      })
      .addCase(getServices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Service By ID
    builder
      .addCase(getServiceById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getServiceById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.currentService = action.payload;
      })
      .addCase(getServiceById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Services By Trainer ID
    builder
      .addCase(getServicesByTrainerId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getServicesByTrainerId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.services = action.payload;
        state.total = action.payload.length;
      })
      .addCase(getServicesByTrainerId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Service
    builder
      .addCase(updateService.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateService.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateError = null;
        // Update the service in the list
        const index = state.services.findIndex((service) => service.id === action.payload.id);
        if (index !== -1) {
          state.services[index] = action.payload;
        }
        // Update current service if it's the one being updated
        if (state.currentService?.id === action.payload.id) {
          state.currentService = action.payload;
        }
      })
      .addCase(updateService.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload as string;
      });

    // Delete Service
    builder
      .addCase(deleteService.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = null;
        // Remove the service from the list
        state.services = state.services.filter((service) => service.id !== action.payload.id);
        state.total -= 1;
        // Clear current service if it's the one being deleted
        if (state.currentService?.id === action.payload.id) {
          state.currentService = null;
        }
      })
      .addCase(deleteService.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload as string;
      });
  },
});

export const { clearErrors, clearCurrentService, setCurrentService } = servicesSlice.actions;
export default servicesSlice.reducer; 