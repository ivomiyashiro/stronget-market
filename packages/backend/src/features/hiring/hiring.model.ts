import mongoose, { Types } from "mongoose";

const hiringSchema = new mongoose.Schema({
    serviceId: { type: Types.ObjectId, ref: "Service", required: true },
    clientId: { type: Types.ObjectId, ref: "User", required: true },
    trainerId: { type: Types.ObjectId, ref: "User", required: true },
    day: { type: String, required: true },
    time: { type: String, required: true },
    status: {
        type: String,
        enum: ["pending", "confirmed", "cancelled", "rejected", "completed"],
        default: "pending",
    },
    payment: {
        name: { type: String, required: true },
        cardNumber: { type: String, required: true },
        expiry: { type: String, required: true },
        cvv: { type: String, required: true },
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Index for efficient querying
hiringSchema.index({ clientId: 1, day: 1, time: 1 });
hiringSchema.index({ trainerId: 1, day: 1, time: 1 });
hiringSchema.index({ serviceId: 1 });

const Hiring = mongoose.model("Hiring", hiringSchema);

export default Hiring;
