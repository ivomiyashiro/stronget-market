import express, { Request, Response } from "express";
import cors from "cors";
import { config } from "./config.js";
import router from "./routes/index.js";

const app = express();
const PORT = config.port;

// Middleware
app.use(cors(config.cors));
app.use(express.json());

// API Routes
app.use(`/api/${config.apiVersion}`, router);

// Fallback route
app.use("*", (_req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at ${config.baseUrl}/api/${config.apiVersion}`);
});
