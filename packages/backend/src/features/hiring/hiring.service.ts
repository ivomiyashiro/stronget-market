import Hiring from "./hiring.model";
import Service from "../services/services.model";
import User from "../user/user.model";
import { Types } from "mongoose";
import { CreateHiringRequestDTO, CreateHiringResponseDTO } from "./dtos";

export class HiringService {
    async createHiring(
        clientId: string,
        hiringData: CreateHiringRequestDTO
    ): Promise<CreateHiringResponseDTO> {
        // Get service and validate it exists and is active
        const service = await Service.findById(hiringData.serviceId).populate(
            "trainerId",
            "name"
        );

        if (!service) {
            throw new Error("Service not found");
        }

        if (!service.isActive) {
            throw new Error("Service is no longer available");
        }

        // Verify trainer exists
        const trainer = await User.findById((service.trainerId as any)._id);
        if (!trainer) {
            throw new Error("Trainer not found");
        }

        // Check trainer availability for the requested day/time slot
        await this.validateTrainerAvailability(
            (service.trainerId as any)._id.toString(),
            hiringData.serviceId,
            hiringData.day,
            hiringData.time,
            service.duration as number
        );

        // Prevent client from booking their own service (if they're also a trainer)
        if (clientId === (service.trainerId as any)._id.toString()) {
            throw new Error("You cannot book your own service");
        }

        const hiring = new Hiring({
            ...hiringData,
            clientId: new Types.ObjectId(clientId),
            trainerId: (service.trainerId as any)._id,
            status: "pending", // Always starts as pending
        });

        await hiring.save();

        // Add notification to trainer about new booking request
        trainer.notifications?.push({
            message: `Nuevo pedido de reserva para tu servicio ${service.category} el ${hiringData.day} a las ${hiringData.time}`,
            leido: false,
            date: new Date(),
        } as any);
        await trainer.save();

        // Populate for response
        const populatedHiring = await Hiring.findById(hiring._id)
            .populate("clientId", "name")
            .populate("trainerId", "name");

        return {
            id: (populatedHiring as any)._id.toString(),
            serviceId: (populatedHiring as any).serviceId.toString(),
            day: (populatedHiring as any).day,
            time: (populatedHiring as any).time,
            client: {
                id: (populatedHiring as any).clientId._id.toString(),
                name: (populatedHiring as any).clientId.name,
            },
            trainer: {
                id: (populatedHiring as any).trainerId._id.toString(),
                name: (populatedHiring as any).trainerId.name,
            },
        };
    }

    private parseDateTime(day: string, time: string): Date {
        // Parse day (e.g., "Monday", "Tuesday", etc.) and time (e.g., "14:30")
        const today = new Date();
        const dayNames = [
            "Domingo",
            "Lunes",
            "Martes",
            "Miercoles",
            "Jueves",
            "Viernes",
            "Sabado",
        ];
        const targetDayIndex = dayNames.indexOf(day);

        if (targetDayIndex === -1) {
            throw new Error("Día inválido");
        }

        // Find the next occurrence of this day
        const todayIndex = today.getDay();
        let daysToAdd = targetDayIndex - todayIndex;
        if (daysToAdd <= 0) {
            daysToAdd += 7; // Next week
        }

        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + daysToAdd);

        // Parse time
        const [hours, minutes] = time.split(":").map(Number);
        if (isNaN(hours) || isNaN(minutes)) {
            throw new Error("Formato de hora inválido");
        }

        targetDate.setHours(hours, minutes, 0, 0);
        return targetDate;
    }

    private async validateTrainerAvailability(
        trainerId: string,
        serviceId: string,
        day: string,
        time: string,
        serviceDuration: number
    ): Promise<void> {
        // Parse the requested time
        const [requestedHours, requestedMinutes] = time.split(":").map(Number);
        if (isNaN(requestedHours) || isNaN(requestedMinutes)) {
            throw new Error("Formato de hora inválido");
        }

        const requestedStartMinutes = requestedHours * 60 + requestedMinutes;
        const requestedEndMinutes = requestedStartMinutes + serviceDuration;

        // Find all confirmed or pending bookings for this trainer on the same day of the week
        const existingBookings = await Hiring.find({
            trainerId: new Types.ObjectId(trainerId),
            day: day,
            time: { $gte: time },
            status: { $in: ["pending", "confirmed"] },
            serviceId: new Types.ObjectId(serviceId),
        }).populate("serviceId", "duration");
        console.log(existingBookings);
        if (existingBookings.length > 0) {
            throw new Error(
                `El entrenador no está disponible el ${day} a las ${time}. El horario ya está ocupado.`
            );
        }
    }

    async getHiringsByClientId(clientId: string) {
        return Hiring.find({ clientId: new Types.ObjectId(clientId) })
            .populate("serviceId", "category description duration price _id")
            .populate("trainerId", "name surname profileImage")
            .sort({ day: 1, time: 1 });
    }

    async getHiringsByTrainerId(trainerId: string) {
        return Hiring.find({ trainerId: new Types.ObjectId(trainerId) })
            .populate("serviceId", "category description duration price")
            .populate("clientId", "name surname profileImage")
            .sort({ day: 1, time: 1 });
    }

    async getHiringById(id: string) {
        return Hiring.findById(id)
            .populate("serviceId", "category description duration price")
            .populate("clientId", "name surname profileImage")
            .populate("trainerId", "name surname profileImage");
    }

    async updateHiringStatus(id: string, status: string, userId: string) {
        const hiring = await Hiring.findById(id)
            .populate("clientId", "id name")
            .populate("trainerId", "id name");

        if (!hiring) {
            throw new Error("Hiring not found");
        }

        // Validate status transitions and permissions
        const currentStatus = hiring.status;
        const isTrainer = (hiring.trainerId as any)._id.toString() === userId;
        const isClient = (hiring.clientId as any)._id.toString() === userId;

        if (!isTrainer && !isClient) {
            throw new Error("No tienes permisos para actualizar esta reserva");
        }

        // Define allowed status transitions
        const allowedTransitions: Record<
            string,
            { from: string[]; allowedBy: string[] }
        > = {
            confirmed: {
                from: ["pending"],
                allowedBy: ["trainer"], // Only trainers can confirm
            },
            cancelled: {
                from: ["pending", "confirmed"],
                allowedBy: ["client", "trainer"], // Only clients and trainers can cancel
            },
            rejected: {
                from: ["pending"],
                allowedBy: ["trainer"], // Only trainers can reject
            },
            completed: {
                from: ["confirmed"],
                allowedBy: ["trainer"], // Both can mark as completed
            },
        };

        const transition = allowedTransitions[status];
        if (!transition) {
            throw new Error(`Estado inválido: ${status}`);
        }

        if (!transition.from.includes(currentStatus)) {
            throw new Error(
                `No puedes cambiar el estado de ${currentStatus} a ${status}`
            );
        }

        const userRole = isTrainer ? "trainer" : "client";
        if (!transition.allowedBy.includes(userRole)) {
            throw new Error(
                `Solo ${transition.allowedBy.join(
                    " o "
                )} puede cambiar el estado a ${status}`
            );
        }

        // Additional validation for specific transitions
        if (status === "confirmed" && currentStatus === "pending") {
            // Re-validate availability when confirming (in case of concurrent bookings)
            const service = await Service.findById(hiring.serviceId);
            if (service) {
                await this.validateTrainerAvailability(
                    (hiring.trainerId as any)._id.toString(),
                    hiring.serviceId as any,
                    hiring.day,
                    hiring.time,
                    service.duration as number
                );
            }
        }

        hiring.status = status as any;
        hiring.updatedAt = new Date();
        await hiring.save();

        // Send notification to the other party
        const trainer = await User.findById((hiring.trainerId as any)._id);
        if (trainer && !isTrainer) {
            // Client updated status, notify trainer
            trainer.notifications?.push({
                message: `Booking status updated to ${status} by ${
                    (hiring.clientId as any).name
                }`,
                leido: false,
                date: new Date(),
            } as any);
            await trainer.save();
        }

        return hiring;
    }

    async cancelHiring(id: string, userId: string) {
        return this.updateHiringStatus(id, "cancelled", userId);
    }

    async confirmHiring(id: string, trainerId: string) {
        return this.updateHiringStatus(id, "confirmed", trainerId);
    }

    async acceptHiringByClientAndService(
        clientId: string,
        serviceId: string,
        trainerId: string
    ) {
        // Find the hiring by client ID and service ID
        const hiring = await Hiring.findOne({
            clientId: new Types.ObjectId(clientId),
            serviceId: new Types.ObjectId(serviceId),
            trainerId: new Types.ObjectId(trainerId),
            status: "pending",
        }).populate("clientId", "name email");

        if (!hiring) {
            throw new Error("Pending hiring not found");
        }

        // Update the hiring status to confirmed
        hiring.status = "confirmed";
        hiring.updatedAt = new Date();
        await hiring.save();

        // Send notification to the client
        const client = await User.findById(clientId);
        if (client) {
            client.notifications?.push({
                message: `Tu reserva para el servicio ha sido aceptada`,
                leido: false,
                date: new Date(),
            } as any);
            await client.save();
        }

        return hiring;
    }

    async rejectHiringByClientAndService(
        clientId: string,
        serviceId: string,
        trainerId: string
    ) {
        // Find the hiring by client ID and service ID
        const hiring = await Hiring.findOne({
            clientId: new Types.ObjectId(clientId),
            serviceId: new Types.ObjectId(serviceId),
            trainerId: new Types.ObjectId(trainerId),
            status: "pending",
        }).populate("clientId", "name email");

        if (!hiring) {
            throw new Error("Pending hiring not found");
        }

        // Update the hiring status to rejected (trainer rejected the client)
        hiring.status = "rejected";
        hiring.updatedAt = new Date();
        await hiring.save();

        // Send notification to the client
        const client = await User.findById(clientId);
        if (client) {
            client.notifications?.push({
                message: `Tu reserva para el servicio ha sido rechazada`,
                leido: false,
                date: new Date(),
            } as any);
            await client.save();
        }

        return hiring;
    }

    async removeHiring(id: string, clientId: string) {
        // Find the hiring and validate it belongs to the client
        const hiring = await Hiring.findById(id)
            .populate("clientId", "name")
            .populate("trainerId", "name")
            .populate("serviceId", "category");

        if (!hiring) {
            throw new Error("Hiring not found");
        }

        // Verify the hiring belongs to the requesting client
        if ((hiring.clientId as any)._id.toString() !== clientId) {
            throw new Error("You can only remove your own hirings");
        }

        // Check if hiring can be cancelled based on status
        const allowedStatuses = ["pending", "confirmed"];
        if (!allowedStatuses.includes(hiring.status)) {
            throw new Error(`Cannot cancel hiring with status: ${hiring.status}`);
        }

        // Check if hiring is too close to the scheduled time (e.g., less than 24 hours)
        const scheduledDateTime = this.parseDateTime(hiring.day, hiring.time);
        const now = new Date();
        const minCancellationTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

        if (scheduledDateTime <= minCancellationTime) {
            throw new Error(
                "No puedes cancelar la reserva menos de 24 horas antes de la hora programada"
            );
        }

        // Change the hiring status to cancelled instead of deleting
        hiring.status = "cancelled";
        hiring.updatedAt = new Date();
        await hiring.save();

        // Notify the trainer about the cancellation
        const trainer = await User.findById(hiring.trainerId);
        if (trainer) {
            trainer.notifications?.push({
                message: `${(hiring.clientId as any).name} ha cancelado su reserva para ${
                    (hiring.serviceId as any).category
                } el ${hiring.day} a las ${hiring.time}`,
                leido: false,
                date: new Date(),
            } as any);
            await trainer.save();
        }

        return {
            id: hiring._id.toString(),
            message: "Reserva cancelada correctamente",
            scheduledTime: `${hiring.day} at ${hiring.time}`,
        };
    }

    async getTrainerAvailableSlots(trainerId: string, day: string) {
        // Get all active bookings for this trainer on this day of the week
        const bookings = await Hiring.find({
            trainerId: new Types.ObjectId(trainerId),
            day: day,
            status: { $in: ["pending", "confirmed"] }, // Only consider pending and confirmed bookings
        })
            .populate("serviceId", "duration")
            .sort({ time: 1 });

        // Generate available time slots (assuming 9 AM to 9 PM working hours)
        const workStartHour = 9;
        const workEndHour = 21;
        const slotDurationMinutes = 60; // 1 hour slots

        const availableSlots: string[] = [];

        for (let hour = workStartHour; hour < workEndHour; hour++) {
            const timeSlot = `${hour.toString().padStart(2, "0")}:00`;
            const slotStartMinutes = hour * 60;
            const slotEndMinutes = slotStartMinutes + slotDurationMinutes;

            // Check if this slot conflicts with any booking
            const hasConflict = bookings.some((booking) => {
                const [bookingHours, bookingMinutes] = booking.time
                    .split(":")
                    .map(Number);
                const bookingStartMinutes = bookingHours * 60 + bookingMinutes;
                const bookingEndMinutes =
                    bookingStartMinutes + ((booking.serviceId as any).duration as number);

                return (
                    (slotStartMinutes >= bookingStartMinutes &&
                        slotStartMinutes < bookingEndMinutes) ||
                    (slotEndMinutes > bookingStartMinutes &&
                        slotEndMinutes <= bookingEndMinutes) ||
                    (slotStartMinutes <= bookingStartMinutes &&
                        slotEndMinutes >= bookingEndMinutes)
                );
            });

            if (!hasConflict) {
                availableSlots.push(timeSlot);
            }
        }

        return availableSlots;
    }

    async canBookService(
        clientId: string,
        serviceId: string,
        day: string,
        time: string
    ): Promise<{ canBook: boolean; reason?: string }> {
        try {
            // Check if service exists and is active
            const service = await Service.findById(serviceId).populate(
                "trainerId",
                "name"
            );
            if (!service) {
                return { canBook: false, reason: "Servicio no encontrado" };
            }

            if (!service.isActive) {
                return { canBook: false, reason: "Servicio no disponible" };
            }

            // Check if client is trying to book their own service
            if (clientId === (service.trainerId as any)._id.toString()) {
                return {
                    canBook: false,
                    reason: "No puedes reservar tu propio servicio",
                };
            }

            // Validate day and time format
            const dayNames = [
                "Domingo",
                "Lunes",
                "Martes",
                "Miercoles",
                "Jueves",
                "Viernes",
                "Sabado",
            ];
            if (!dayNames.includes(day)) {
                return {
                    canBook: false,
                    reason: "Día inválido, por favor selecciona un día válido",
                };
            }

            const [hours, minutes] = time.split(":").map(Number);
            if (
                isNaN(hours) ||
                isNaN(minutes) ||
                hours < 0 ||
                hours > 23 ||
                minutes < 0 ||
                minutes > 59
            ) {
                return {
                    canBook: false,
                    reason: "Formato de hora inválido, por favor selecciona una hora válida",
                };
            }

            // Check if the requested time is at least 2 hours from now
            const requestedDateTime = this.parseDateTime(day, time);
            const now = new Date();
            const minBookingTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);

            if (requestedDateTime <= minBookingTime) {
                return {
                    canBook: false,
                    reason: "La reserva debe ser como mínimo 2 horas en adelante, por favor selecciona una hora válida",
                };
            }

            // Check trainer availability for this day/time slot
            await this.validateTrainerAvailability(
                (service.trainerId as any)._id.toString(),
                serviceId,
                day,
                time,
                service.duration as number
            );

            return { canBook: true };
        } catch (error) {
            return {
                canBook: false,
                reason:
                    error instanceof Error
                        ? error.message
                        : "Validación de reserva falló, por favor intenta nuevamente",
            };
        }
    }
}
