import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes/index.js";
import { config } from "./config/index.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", routes);

app.use(
  (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
      message: "Something went wrong!",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
);

app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;
