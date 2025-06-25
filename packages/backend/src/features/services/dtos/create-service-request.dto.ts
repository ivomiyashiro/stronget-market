export type CreateServiceRequestDTO = {
  categoryId: string;
  description: string;
  duration: number;
  price: number;
  mode: "online" | "in-person";
  zone: string;
  language: string;
  maxPeople: number;
  availability: {
    day: string;
    startTime: string;
  }[];
};
