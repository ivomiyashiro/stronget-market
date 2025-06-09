import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)),
  NODE_ENV: z.enum(["development", "production", "test"]),
  MONGODB_URI: z.string().url("Invalid MongoDB URI"),
  JWT_SECRET: z.string(),
  FRONTEND_URL: z.string().url("Invalid frontend URL"),
});

const envValidation = envSchema.safeParse(process.env);

if (!envValidation.success) {
  envValidation.error.errors.forEach((error) => {
    console.error(`  ${error.path.join(".")}: ${error.message}`);
  });
  process.exit(1);
}

const env = envValidation.data;

export const config = {
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  mongoUri: env.MONGODB_URI,
  jwtSecret: env.JWT_SECRET,
  frontendUrl: env.FRONTEND_URL,
};
