import { baseService } from "./base.service";

export interface FiltersResponse {
    minPrice: number;
    maxPrice: number;
    zones: string[];
    languages: string[];
    categories: string[];
    minDuration: number;
    maxDuration: number;
}

export const filtersService = {
    // Landing page filters (all filters)
    getFilters: async (): Promise<FiltersResponse> => {
        return await baseService.get<FiltersResponse>("/services/filters");
    },

    // Client filters (only filters for confirmed services)
    getClientFilters: async (): Promise<FiltersResponse> => {
        return await baseService.get<FiltersResponse>("/services/filters/client");
    },

    // Trainer filters (only filters for trainer's services)
    getTrainerFilters: async (): Promise<FiltersResponse> => {
        return await baseService.get<FiltersResponse>("/services/filters/trainer");
    },
};
