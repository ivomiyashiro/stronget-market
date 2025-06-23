export type GetServicesParams = {
  category?: string;
  zone?: string;
  minPrice?: number;
  maxPrice?: number;
  duration?: number;
  language?: string;
  mode?: "online" | "in-person";
};
