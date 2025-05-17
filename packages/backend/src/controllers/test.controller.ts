import { Request, Response } from "express";

export const testController = async (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "Stronget Market API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
};
