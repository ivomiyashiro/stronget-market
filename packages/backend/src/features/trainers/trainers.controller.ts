import { Request, Response } from "express";
import { TrainersService } from "./trainers.service";

export class TrainersController {
    private trainersService: TrainersService;

    constructor() {
        this.trainersService = new TrainersService();
    }

    getTrainerById = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const trainer = await this.trainersService.getTrainerById(id);
            if (!trainer) {
                res.status(404).json({ message: "Trainer not found" });
                return;
            }
            res.status(200).json(trainer);
        } catch (error) {
            res.status(400).json({
                message: error instanceof Error ? error.message : "Get trainer failed",
            });
        }
    };

    getTrainerStatistics = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const stats = await this.trainersService.getTrainerStatistics(id);
            if (!stats) {
                res.status(404).json({ message: "Trainer not found" });
                return;
            }
            res.status(200).json(stats);
        } catch (error) {
            res.status(400).json({
                message: error instanceof Error ? error.message : "Get statistics failed",
            });
        }
    };

    getTrainerNotifications = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const notifications = await this.trainersService.getTrainerNotifications(id);
            res.status(200).json(notifications);
        } catch (error) {
            res.status(400).json({
                message:
                    error instanceof Error ? error.message : "Get notifications failed",
            });
        }
    };

    updateSeenNotifications = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            await this.trainersService.updateSeenNotifications(id);
            res.status(200).json({ message: "Notifications marked as seen" });
        } catch (error) {
            res.status(400).json({
                message:
                    error instanceof Error
                        ? error.message
                        : "Update notifications failed",
            });
        }
    };
}
