export type UpdateHiringStateRequestDTO = {
  status: "pending" | "confirmed" | "cancelled" | "rejected" | "completed";
};

export type UpdateHiringStateResponseDTO = {
  id: string;
  serviceId: string;
  date: Date;
  status: "pending" | "confirmed" | "cancelled" | "rejected" | "completed";
  client: {
    id: string;
    name: string;
  };
  trainer: {
    id: string;
    name: string;
  };
};
