export type GetServicesParams = {
  category?: string;
  zone?: string;
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
  language?: string;
  mode?: "online" | "in-person";
  search?: string;
};
