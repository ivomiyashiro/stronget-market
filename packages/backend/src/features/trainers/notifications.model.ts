import mongoose, { Types } from "mongoose";

const notificationSchema = new mongoose.Schema({
    message: { type: String, required: true },
    leido: { type: Boolean, default: false },
    date: { type: Date, default: Date.now },
});
