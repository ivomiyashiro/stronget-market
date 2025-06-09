import mongoose from "mongoose";
import { config } from "../config/index.js";

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongoUri as string);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});

export default connectDB;
