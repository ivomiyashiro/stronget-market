import { Request, Response } from "express";
import { TrainersService } from "./trainers.service";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class TrainersController {
  private trainersService: TrainersService;

  constructor() {
    this.trainersService = new TrainersService();
  }

  getTrainerStatistics = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (userId !== id) {
        res.status(403).json({
          message: "Access denied. You can only view your own statistics.",
        });
        return;
      }

      const stats = await this.trainersService.getTrainerStatistics(id);
      if (!stats) {
        res.status(404).json({ message: "Trainer not found" });
        return;
      }
      res.status(200).json(stats);
    } catch (error) {
      res.status(400).json({
        message:
          error instanceof Error ? error.message : "Get statistics failed",
      });
    }
  };

  getTrainerNotifications = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (userId !== id) {
        res.status(403).json({
          message: "Access denied. You can only view your own notifications.",
        });
        return;
      }

      const notifications = await this.trainersService.getTrainerNotifications(
        id
      );
      res.status(200).json(notifications);
    } catch (error) {
      res.status(400).json({
        message:
          error instanceof Error ? error.message : "Get notifications failed",
      });
    }
  };

  updateSeenNotifications = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (userId !== id) {
        res.status(403).json({
          message: "Access denied. You can only update your own notifications.",
        });
        return;
      }

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

  markNotificationAsRead = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id, notificationId } = req.params;
      const userId = req.user?.id;

      if (userId !== id) {
        res.status(403).json({
          message: "Access denied. You can only update your own notifications.",
        });
        return;
      }

      await this.trainersService.markNotificationAsRead(id, notificationId);
      res.status(200).json({ message: "Notification marked as read" });
    } catch (error) {
      res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Mark notification as read failed",
      });
    }
  };
}
