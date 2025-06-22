import { Request, Response } from "express";
import { UserService } from "./user.service";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.userService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "Registration failed",
      });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.userService.login(req.body);
      res.status(200).json(result);
    } catch (error) {
      res.status(401).json({
        message: error instanceof Error ? error.message : "Login failed",
      });
    }
  };

  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.userService.updateUser(id, req.body);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "Update failed",
      });
    }
  };

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.userService.deleteUser(id);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "Delete failed",
      });
    }
  };

  passwordRecovery = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.userService.passwordRecovery(req.body);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "Password recovery failed",
      });
    }
  };

  uploadAvatar = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!req.file) {
        res.status(400).json({ message: "No se proporcionó ningún archivo" });
        return;
      }

      const result = await this.userService.uploadAvatar(id, req.file);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "Avatar upload failed",
      });
    }
  };

  deleteAvatar = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.userService.deleteAvatar(id);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "Avatar delete failed",
      });
    }
  };
}
