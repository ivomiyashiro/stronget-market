import mongoose, { Types } from "mongoose";

const archiveSchema = new mongoose.Schema({
  hiringId: { type: Types.ObjectId, ref: "Hiring", required: true },
  uploadedBy: { type: Types.ObjectId, ref: "User", required: true },
  fileName: { type: String, required: true },
  originalName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  mimeType: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileKey: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Index for efficient querying
archiveSchema.index({ hiringId: 1, uploadDate: -1 });
archiveSchema.index({ uploadedBy: 1, uploadDate: -1 });
archiveSchema.index({ fileKey: 1 }, { unique: true });

const Archive = mongoose.model("Archive", archiveSchema);

export default Archive;
