export type GetFiltersResponseDTO = {
  minPrice: number;
  maxPrice: number;
  zones: string[];
  languages: string[];
  categories: string[];
  minDuration: number;
  maxDuration: number;
};
