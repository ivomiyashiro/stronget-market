import mongoose, { Types } from "mongoose";

const hiringSchema = new mongoose.Schema({
  serviceId: { type: Types.ObjectId, ref: "Service", required: true },
  clientId: { type: Types.ObjectId, ref: "User", required: true },
  trainerId: { type: Types.ObjectId, ref: "Trainer", required: true },
  date: { type: Date, required: true },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed"],
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
hiringSchema.index({ clientId: 1, date: -1 });
hiringSchema.index({ trainerId: 1, date: -1 });
hiringSchema.index({ serviceId: 1 });

const Hiring = mongoose.model("Hiring", hiringSchema);

export default Hiring;
