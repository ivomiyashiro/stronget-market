import { BaseService } from "./base.service";

export interface CreateHiringRequest {
    serviceId: string;
    day: string;
    time: string;
    payment: {
        name: string;
        cardNumber: string;
        expiry: string;
        cvv: string;
    };
}

export interface CreateHiringResponse {
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
}

export interface HiringItem {
    id: string;
    serviceId: {
        _id: string;
        category: string;
        description: string;
        duration: number;
        price: number;
    };
    trainerId: {
        name: string;
        surname: string;
        profileImage?: string;
    };
    day: string;
    time: string;
    status: "pending" | "confirmed" | "cancelled" | "rejected" | "completed";
    createdAt: string;
    updatedAt: string;
}

export interface RemoveHiringResponse {
    message: string;
    hiring: {
        id: string;
        message: string;
        scheduledTime: string;
    };
}

export class HiringService extends BaseService {
    private readonly endpoint = "/hirings";

    /**
     * Create a new hiring
     */
    async createHiring(data: CreateHiringRequest): Promise<CreateHiringResponse> {
        return this.post<CreateHiringResponse>(this.endpoint, data);
    }

    /**
     * Get my hirings as a client
     */
    async getMyHirings(): Promise<HiringItem[]> {
        return this.get<HiringItem[]>(`${this.endpoint}/my`);
    }

    /**
     * Get hiring by ID
     */
    async getHiringById(id: string): Promise<HiringItem> {
        return this.get<HiringItem>(`${this.endpoint}/${id}`);
    }

    /**
     * Cancel a hiring
     */
    async cancelHiring(id: string): Promise<HiringItem> {
        return this.patch<HiringItem>(`${this.endpoint}/${id}/cancel`);
    }

    /**
     * Remove a hiring (completely delete it)
     */
    async removeHiring(id: string): Promise<RemoveHiringResponse> {
        return this.delete<RemoveHiringResponse>(`${this.endpoint}/${id}`);
    }

    /**
     * Update hiring status (complete or cancel)
     */
    async updateHiringStatus(
        hiringId: string,
        status: "completed" | "cancelled"
    ): Promise<HiringItem> {
        return this.patch<HiringItem>(`${this.endpoint}/${hiringId}/status`, {
            status,
        });
    }

    /**
     * Validate if a service can be booked
     */
    async canBookService(
        serviceId: string,
        day: string,
        time: string
    ): Promise<{ canBook: boolean; reason?: string }> {
        return this.post<{ canBook: boolean; reason?: string }>(
            `${this.endpoint}/validate`,
            {
                serviceId,
                day,
                time,
            }
        );
    }

    /**
     * Get available slots for a trainer on a specific day
     */
    async getTrainerAvailableSlots(
        trainerId: string,
        day: string
    ): Promise<{ availableSlots: string[] }> {
        return this.get<{ availableSlots: string[] }>(
            `${this.endpoint}/trainer/${trainerId}/availability/${day}`
        );
    }

    /**
     * Accept a hiring (trainers only)
     */
    async acceptHiring(clientId: string, serviceId: string): Promise<HiringItem> {
        return this.patch<HiringItem>(`${this.endpoint}/accept`, {
            clientId,
            serviceId,
        });
    }

    /**
     * Reject a hiring (trainers only)
     */
    async rejectHiring(clientId: string, serviceId: string): Promise<HiringItem> {
        return this.patch<HiringItem>(`${this.endpoint}/reject`, {
            clientId,
            serviceId,
        });
    }
}

export const hiringService = new HiringService();
