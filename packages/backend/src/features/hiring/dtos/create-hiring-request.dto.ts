export type CreateHiringRequestDTO = {
    serviceId: string;
    date: Date;
    payment: {
        name: string;
        cardNumber: string;
        expiry: string;
        cvv: string;
    }
};

export type CreateHiringResponseDTO = {
    id: string;
    serviceId: string;
    date: Date;
    client: {
        id: string;
        name: string;
    },
    trainer: {
        id: string;
        name: string;
    }
}