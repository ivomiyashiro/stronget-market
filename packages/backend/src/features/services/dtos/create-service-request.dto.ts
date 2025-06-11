export type CreateServiceRequestDTO = {
    category: string;
    description: string;
    duration: number;
    price: number;
    mode: "online" | "in-person";
    zone: string;
    language: string;
};
