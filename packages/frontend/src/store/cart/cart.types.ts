export interface CartService {
    id: string;
    trainerName: string;
    category: string;
    price: number;
    duration: number;
    zone: string;
    language: string;
    mode: string;
    selectedDay: string;
    selectedTime: string;
    description: string;
    trainerImage?: string;
}

export interface CartState {
    service: CartService | null;
    isLoading: boolean;
    error: string | null;
}
