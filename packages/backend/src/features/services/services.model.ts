import mongoose, { Types } from "mongoose";

const serviceSchema = new mongoose.Schema({
    trainerId: { type: Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true }, // in minutes
    price: { type: Number, required: true },
    mode: { type: String, enum: ["online", "in-person"], required: true },
    zone: { type: String, required: true },
    language: { type: String, required: true },
    maxPeople: { type: Number, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    availability: [
        {
            day: { type: String, required: true },
            startTime: { type: String, required: true },
        },
    ],
    visualizations: { type: Number, default: 0 },
    viewedBy: [{ type: Types.ObjectId, ref: "User" }], // Track which users have viewed this service
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Index for efficient querying
serviceSchema.index({ category: 1, zone: 1, price: 1 });

const Service = mongoose.model("Service", serviceSchema);

export default Service;
