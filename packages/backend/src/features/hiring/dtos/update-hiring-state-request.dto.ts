export type UpdateHiringStateRequestDTO = {
    state: "pending" | "confirmed" | "cancelled";
}


export type UpdateHiringStateResponseDTO = {
    id: string;
    serviceId: string;
    date: Date;
    state: "pending" | "confirmed" | "cancelled";
    client: {
        id: string;
        name: string;
    },
    trainer: {
        id: string;
        name: string;
    }
}