import Hiring from "./hiring.model";
import Service from "../services/services.model";
import Trainer from "../trainers/trainers.model";
import { Types } from "mongoose";
import { CreateHiringRequestDTO, CreateHiringResponseDTO } from "./dtos";

export class HiringService {
  async createHiring(
    clientId: string,
    hiringData: CreateHiringRequestDTO
  ): Promise<CreateHiringResponseDTO> {
    // Validate booking date is in the future
    const bookingDate = new Date(hiringData.date);
    const now = new Date();
    const minBookingTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours minimum advance booking

    if (bookingDate <= minBookingTime) {
      throw new Error("Booking must be at least 2 hours in advance");
    }

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
    const trainer = await Trainer.findById((service.trainerId as any)._id);
    if (!trainer) {
      throw new Error("Trainer not found");
    }

    // Check trainer availability for the requested date/time
    await this.validateTrainerAvailability(
      (service.trainerId as any)._id.toString(),
      bookingDate,
      service.duration
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
    trainer.notifications.push({
      message: `New booking request for your ${
        service.category
      } service on ${bookingDate.toLocaleDateString()}`,
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
      date: (populatedHiring as any).date,
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

  private async validateTrainerAvailability(
    trainerId: string,
    requestedDate: Date,
    serviceDuration: number
  ): Promise<void> {
    const requestedStart = new Date(requestedDate);
    const requestedEnd = new Date(requestedStart.getTime() + serviceDuration * 60 * 1000);

    // Find all confirmed or pending bookings for this trainer on the same day
    const startOfDay = new Date(requestedStart);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(requestedStart);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await Hiring.find({
      trainerId: new Types.ObjectId(trainerId),
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: { $in: ["pending", "confirmed"] },
    }).populate("serviceId", "duration");

    // Check for time conflicts
    for (const booking of existingBookings) {
      const bookingStart = new Date(booking.date);
      const bookingEnd = new Date(
        bookingStart.getTime() + (booking.serviceId as any).duration * 60 * 1000
      );

      // Check if there's any overlap
      const hasOverlap =
        (requestedStart >= bookingStart && requestedStart < bookingEnd) ||
        (requestedEnd > bookingStart && requestedEnd <= bookingEnd) ||
        (requestedStart <= bookingStart && requestedEnd >= bookingEnd);

      if (hasOverlap) {
        throw new Error(
          `Trainer is not available at ${requestedStart.toLocaleString()}. Please choose a different time.`
        );
      }
    }
  }

  async getHiringsByClientId(clientId: string) {
    return Hiring.find({ clientId: new Types.ObjectId(clientId) })
      .populate("serviceId", "category description duration price")
      .populate("trainerId", "name surname profileImage")
      .sort({ date: -1 });
  }

  async getHiringsByTrainerId(trainerId: string) {
    return Hiring.find({ trainerId: new Types.ObjectId(trainerId) })
      .populate("serviceId", "category description duration price")
      .populate("clientId", "name surname profileImage")
      .sort({ date: -1 });
  }

  async getHiringById(id: string) {
    return Hiring.findById(id)
      .populate("serviceId", "category description duration price")
      .populate("clientId", "name surname profileImage")
      .populate("trainerId", "name surname profileImage");
  }

  async updateHiringStatus(id: string, status: string, userId: string) {
    const hiring = await Hiring.findById(id)
      .populate("clientId", "name")
      .populate("trainerId", "name");

    if (!hiring) {
      throw new Error("Hiring not found");
    }

    // Validate status transitions and permissions
    const currentStatus = hiring.status;
    const isTrainer = hiring.trainerId.toString() === userId;
    const isClient = hiring.clientId.toString() === userId;

    if (!isTrainer && !isClient) {
      throw new Error("You don't have permission to update this hiring");
    }

    // Define allowed status transitions
    const allowedTransitions: Record<string, { from: string[]; allowedBy: string[] }> = {
      confirmed: {
        from: ["pending"],
        allowedBy: ["trainer"], // Only trainers can confirm
      },
      cancelled: {
        from: ["pending", "confirmed"],
        allowedBy: ["trainer", "client"], // Both can cancel
      },
      completed: {
        from: ["confirmed"],
        allowedBy: ["trainer", "client"], // Both can mark as completed
      },
    };

    const transition = allowedTransitions[status];
    if (!transition) {
      throw new Error(`Invalid status: ${status}`);
    }

    if (!transition.from.includes(currentStatus)) {
      throw new Error(`Cannot change status from ${currentStatus} to ${status}`);
    }

    const userRole = isTrainer ? "trainer" : "client";
    if (!transition.allowedBy.includes(userRole)) {
      throw new Error(
        `Only ${transition.allowedBy.join(" or ")} can set status to ${status}`
      );
    }

    // Additional validation for specific transitions
    if (status === "confirmed" && currentStatus === "pending") {
      // Re-validate availability when confirming (in case of concurrent bookings)
      const service = await Service.findById(hiring.serviceId);
      if (service) {
        await this.validateTrainerAvailability(
          hiring.trainerId.toString(),
          hiring.date,
          service.duration
        );
      }
    }

    hiring.status = status as any;
    hiring.updatedAt = new Date();
    await hiring.save();

    // Send notification to the other party
    const trainer = await Trainer.findById(hiring.trainerId);
    if (trainer && !isTrainer) {
      // Client updated status, notify trainer
      trainer.notifications.push({
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

  async getTrainerAvailableSlots(trainerId: string, date: string) {
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all bookings for this trainer on this date
    const bookings = await Hiring.find({
      trainerId: new Types.ObjectId(trainerId),
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: { $in: ["pending", "confirmed"] },
    })
      .populate("serviceId", "duration")
      .sort({ date: 1 });

    // Generate available slots (assuming 9 AM to 9 PM working hours)
    const workStart = new Date(targetDate);
    workStart.setHours(9, 0, 0, 0);

    const workEnd = new Date(targetDate);
    workEnd.setHours(21, 0, 0, 0);

    const availableSlots: Date[] = [];
    const slotDuration = 60; // 1 hour slots

    for (
      let time = new Date(workStart);
      time < workEnd;
      time.setTime(time.getTime() + slotDuration * 60 * 1000)
    ) {
      const slotStart = new Date(time);
      const slotEnd = new Date(time.getTime() + slotDuration * 60 * 1000);

      // Check if this slot conflicts with any booking
      const hasConflict = bookings.some((booking) => {
        const bookingStart = new Date(booking.date);
        const bookingEnd = new Date(
          bookingStart.getTime() + (booking.serviceId as any).duration * 60 * 1000
        );

        return (
          (slotStart >= bookingStart && slotStart < bookingEnd) ||
          (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
          (slotStart <= bookingStart && slotEnd >= bookingEnd)
        );
      });

      if (!hasConflict) {
        availableSlots.push(new Date(slotStart));
      }
    }

    return availableSlots;
  }

  async canBookService(
    clientId: string,
    serviceId: string,
    date: Date
  ): Promise<{ canBook: boolean; reason?: string }> {
    try {
      // Check if service exists and is active
      const service = await Service.findById(serviceId).populate("trainerId", "name");
      if (!service) {
        return { canBook: false, reason: "Service not found" };
      }

      if (!service.isActive) {
        return { canBook: false, reason: "Service is no longer available" };
      }

      // Check if client is trying to book their own service
      if (clientId === (service.trainerId as any)._id.toString()) {
        return { canBook: false, reason: "You cannot book your own service" };
      }

      // Check date validity
      const now = new Date();
      const minBookingTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      if (date <= minBookingTime) {
        return { canBook: false, reason: "Booking must be at least 2 hours in advance" };
      }

      // Check trainer availability
      await this.validateTrainerAvailability(
        (service.trainerId as any)._id.toString(),
        date,
        service.duration
      );

      return { canBook: true };
    } catch (error) {
      return {
        canBook: false,
        reason: error instanceof Error ? error.message : "Booking validation failed",
      };
    }
  }
}
