export type CreateHiringRequestDTO = {
    serviceId: string;
    day: string;
    time: string;
    payment: {
        name: string;
        cardNumber: string;
        expiry: string;
        cvv: string;
    };
};

export type CreateHiringResponseDTO = {
    id: string;
    serviceId: string;
    day: string;
    time: string;
    client: {
        id: string;
        name: string;
    };
    trainer: {
        id: string;
        name: string;
    };
};
