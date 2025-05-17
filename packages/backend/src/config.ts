import { config as dotenvConfig } from "dotenv";

dotenvConfig();

export const config = {
  port: process.env.PORT || 3030,
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  },
  baseUrl: process.env.BASE_URL || "http://localhost:3030",
  apiVersion: process.env.API_VERSION || "v1",
};
