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
  getFilters: async (): Promise<FiltersResponse> => {
    return await baseService.get<FiltersResponse>("/services/filters");
  },
};
