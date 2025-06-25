import { Request, Response } from "express";
import { HiringService } from "./hiring.service";

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

export class HiringController {
    private hiringService: HiringService;

    constructor() {
        this.hiringService = new HiringService();
    }

    createHiring = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const clientId = req.user?.id;
            if (!clientId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }

            const hiring = await this.hiringService.createHiring(clientId, req.body);
            res.status(201).json(hiring);
        } catch (error) {
            res.status(400).json({
                message: error instanceof Error ? error.message : "Create hiring failed",
            });
        }
    };

    getMyHirings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }

            const hirings = await this.hiringService.getHiringsByClientId(userId);
            res.status(200).json(hirings);
        } catch (error) {
            res.status(400).json({
                message: error instanceof Error ? error.message : "Get hirings failed",
            });
        }
    };

    getTrainerHirings = async (
        req: AuthenticatedRequest,
        res: Response
    ): Promise<void> => {
        try {
            const { trainerId } = req.params;
            const userId = req.user?.id;

            // Check if the requesting user is the trainer
            if (userId !== trainerId) {
                res.status(403).json({ message: "Forbidden" });
                return;
            }

            const hirings = await this.hiringService.getHiringsByTrainerId(trainerId);
            res.status(200).json(hirings);
        } catch (error) {
            res.status(400).json({
                message:
                    error instanceof Error ? error.message : "Get trainer hirings failed",
            });
        }
    };

    getHiringById = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const hiring = await this.hiringService.getHiringById(id);

            if (!hiring) {
                res.status(404).json({ message: "Hiring not found" });
                return;
            }

            res.status(200).json(hiring);
        } catch (error) {
            res.status(400).json({
                message: error instanceof Error ? error.message : "Get hiring failed",
            });
        }
    };

    updateHiringStatus = async (
        req: AuthenticatedRequest,
        res: Response
    ): Promise<void> => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }

            const hiring = await this.hiringService.updateHiringStatus(
                id,
                status,
                userId
            );
            res.status(200).json(hiring);
        } catch (error) {
            res.status(400).json({
                message:
                    error instanceof Error
                        ? error.message
                        : "Update hiring status failed",
            });
        }
    };

    cancelHiring = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }

            const hiring = await this.hiringService.cancelHiring(id, userId);
            res.status(200).json(hiring);
        } catch (error) {
            res.status(400).json({
                message: error instanceof Error ? error.message : "Cancel hiring failed",
            });
        }
    };

    confirmHiring = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }

            const hiring = await this.hiringService.confirmHiring(id, userId);
            res.status(200).json(hiring);
        } catch (error) {
            res.status(400).json({
                message: error instanceof Error ? error.message : "Confirm hiring failed",
            });
        }
    };

    getTrainerAvailableSlots = async (req: Request, res: Response): Promise<void> => {
        try {
            const { trainerId, day } = req.params;

            const availableSlots = await this.hiringService.getTrainerAvailableSlots(
                trainerId,
                day
            );
            res.status(200).json({ availableSlots });
        } catch (error) {
            res.status(400).json({
                message:
                    error instanceof Error ? error.message : "Get available slots failed",
            });
        }
    };

    canBookService = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const clientId = req.user?.id;
            if (!clientId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }

            const { serviceId, day, time } = req.body;

            if (!serviceId || !day || !time) {
                res.status(400).json({
                    message: "Service ID, day, and time are required",
                });
                return;
            }

            const result = await this.hiringService.canBookService(
                clientId,
                serviceId,
                day,
                time
            );
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({
                message:
                    error instanceof Error ? error.message : "Booking validation failed",
            });
        }
    };

    removeHiring = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const clientId = req.user?.id;
            if (!clientId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }

            const { id } = req.params;

            const result = await this.hiringService.removeHiring(id, clientId);
            res.status(200).json({
                message: "Hiring removed successfully",
                hiring: result,
            });
        } catch (error) {
            res.status(400).json({
                message: error instanceof Error ? error.message : "Remove hiring failed",
            });
        }
    };

    acceptHiring = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const trainerId = req.user?.id;
            if (!trainerId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }

            const { clientId, serviceId } = req.body;

            if (!clientId || !serviceId) {
                res.status(400).json({
                    message: "Client ID and Service ID are required",
                });
                return;
            }

            const hiring = await this.hiringService.acceptHiringByClientAndService(
                clientId,
                serviceId,
                trainerId
            );
            res.status(200).json(hiring);
        } catch (error) {
            res.status(400).json({
                message: error instanceof Error ? error.message : "Accept hiring failed",
            });
        }
    };

    rejectHiring = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const trainerId = req.user?.id;
            if (!trainerId) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }

            const { clientId, serviceId } = req.body;

            if (!clientId || !serviceId) {
                res.status(400).json({
                    message: "Client ID and Service ID are required",
                });
                return;
            }

            const hiring = await this.hiringService.rejectHiringByClientAndService(
                clientId,
                serviceId,
                trainerId
            );
            res.status(200).json(hiring);
        } catch (error) {
            res.status(400).json({
                message: error instanceof Error ? error.message : "Reject hiring failed",
            });
        }
    };
}
