export type UpdateServiceRequestDTO = {
  category?: string;
  description?: string;
  duration?: number;
  price?: number;
  mode?: "online" | "in-person";
  zone?: string;
  language?: string;
  maxPeople?: number;
  availability?: {
    day: string;
    startTime: string;
  }[];
};
