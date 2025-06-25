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

        const trainer = await User.findById((service.trainerId as any)._id);
        if (!trainer) {
            throw new Error("Trainer not found");
        }

        await this.validateTrainerAvailability(
            (service.trainerId as any)._id.toString(),
            hiringData.serviceId,
            hiringData.day,
            hiringData.time,
            service.duration as number
        );

        if (clientId === (service.trainerId as any)._id.toString()) {
            throw new Error("You cannot book your own service");
        }

        const hiring = new Hiring({
            ...hiringData,
            clientId: new Types.ObjectId(clientId),
            trainerId: (service.trainerId as any)._id,
            status: "pending",
        });

        await hiring.save();

        trainer.notifications?.push({
            message: `Nuevo pedido de reserva para tu servicio ${service.category} el ${hiringData.day} a las ${hiringData.time}`,
            leido: false,
            date: new Date(),
        } as any);
        await trainer.save();

                
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

        const todayIndex = today.getDay();
        let daysToAdd = targetDayIndex - todayIndex;
        if (daysToAdd <= 0) {
            daysToAdd += 7;
        }

        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + daysToAdd);

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
        const [requestedHours, requestedMinutes] = time.split(":").map(Number);
        if (isNaN(requestedHours) || isNaN(requestedMinutes)) {
            throw new Error("Formato de hora inválido");
        }

        const requestedStartMinutes = requestedHours * 60 + requestedMinutes;
        const requestedEndMinutes = requestedStartMinutes + serviceDuration;

        const existingBookings = await Hiring.find({
            trainerId: new Types.ObjectId(trainerId),
            day: day,
            time: { $gte: time },
            status: { $in: ["pending", "confirmed"] },
            serviceId: new Types.ObjectId(serviceId),
        }).populate("serviceId", "duration");

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

        const currentStatus = hiring.status;
        const isTrainer = (hiring.trainerId as any)._id.toString() === userId;
        const isClient = (hiring.clientId as any)._id.toString() === userId;

        if (!isTrainer && !isClient) {
            throw new Error("No tienes permisos para actualizar esta reserva");
        }

        const allowedTransitions: Record<
            string,
            { from: string[]; allowedBy: string[] }
        > = {
            confirmed: {
                from: ["pending"],
                allowedBy: ["trainer"],
            },
            cancelled: {
                from: ["pending", "confirmed"],
                allowedBy: ["client", "trainer"],
            },
            rejected: {
                from: ["pending"],
                allowedBy: ["trainer"],
            },
            completed: {
                from: ["confirmed"],
                allowedBy: ["trainer"],
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

        if (status === "confirmed" && currentStatus === "pending") {
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

        const trainer = await User.findById((hiring.trainerId as any)._id);
        if (trainer && !isTrainer) {
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
        const hiring = await Hiring.findOne({
            clientId: new Types.ObjectId(clientId),
            serviceId: new Types.ObjectId(serviceId),
            trainerId: new Types.ObjectId(trainerId),
            status: "pending",
        }).populate("clientId", "name email");

        if (!hiring) {
            throw new Error("Pending hiring not found");
        }

        hiring.status = "confirmed";
        hiring.updatedAt = new Date();
        await hiring.save();

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
        const hiring = await Hiring.findOne({
            clientId: new Types.ObjectId(clientId),
            serviceId: new Types.ObjectId(serviceId),
            trainerId: new Types.ObjectId(trainerId),
            status: "pending",
        }).populate("clientId", "name email");

        if (!hiring) {
            throw new Error("Pending hiring not found");
        }

        hiring.status = "rejected";
        hiring.updatedAt = new Date();
        await hiring.save();

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
        const hiring = await Hiring.findById(id)
            .populate("clientId", "name")
            .populate("trainerId", "name")
            .populate("serviceId", "category");

        if (!hiring) {
            throw new Error("Hiring not found");
        }

        if ((hiring.clientId as any)._id.toString() !== clientId) {
            throw new Error("You can only remove your own hirings");
        }

        const allowedStatuses = ["pending", "confirmed"];
        if (!allowedStatuses.includes(hiring.status)) {
            throw new Error(`Cannot cancel hiring with status: ${hiring.status}`);
        }

        const scheduledDateTime = this.parseDateTime(hiring.day, hiring.time);
        const now = new Date();
        const minCancellationTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        if (scheduledDateTime <= minCancellationTime) {
            throw new Error(
                "No puedes cancelar la reserva menos de 24 horas antes de la hora programada"
            );
        }

        hiring.status = "cancelled";
        hiring.updatedAt = new Date();
        await hiring.save();

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
        const bookings = await Hiring.find({
            trainerId: new Types.ObjectId(trainerId),
            day: day,
            status: { $in: ["pending", "confirmed"] },
        })
            .populate("serviceId", "duration")
            .sort({ time: 1 });

        const workStartHour = 9;
        const workEndHour = 21;
        const slotDurationMinutes = 60;

        const availableSlots: string[] = [];

        for (let hour = workStartHour; hour < workEndHour; hour++) {
            const timeSlot = `${hour.toString().padStart(2, "0")}:00`;
            const slotStartMinutes = hour * 60;
            const slotEndMinutes = slotStartMinutes + slotDurationMinutes;

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

            if (clientId === (service.trainerId as any)._id.toString()) {
                return {
                    canBook: false,
                    reason: "No puedes reservar tu propio servicio",
                };
            }

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

            const requestedDateTime = this.parseDateTime(day, time);
            const now = new Date();
            const minBookingTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);

            if (requestedDateTime <= minBookingTime) {
                return {
                    canBook: false,
                    reason: "La reserva debe ser como mínimo 2 horas en adelante, por favor selecciona una hora válida",
                };
            }

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
