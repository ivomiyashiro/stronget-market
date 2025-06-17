import mongoose, { Types } from "mongoose";

const reviewSchema = new mongoose.Schema({
  serviceId: { type: Types.ObjectId, ref: "Service", required: true },
  userId: { type: Types.ObjectId, ref: "User", required: true },
  trainerId: { type: Types.ObjectId, ref: "Trainer", required: true },
  calification: { type: Number, required: true, min: 1, max: 5 },
  comments: { type: String, required: true },
  date: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Index for efficient querying
reviewSchema.index({ serviceId: 1, date: -1 });
reviewSchema.index({ trainerId: 1, date: -1 });
reviewSchema.index({ userId: 1, serviceId: 1 }, { unique: true }); // Prevent duplicate reviews

const Review = mongoose.model("Review", reviewSchema);

export default Review;
