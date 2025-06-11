import mongoose, { Types } from "mongoose";

const notificationSchema = new mongoose.Schema({
    message: { type: String, required: true },
    leido: { type: Boolean, default: false },
    date: { type: Date, default: Date.now },
});

const trainerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    specialty: { type: String, required: true },
    experience: { type: String, required: true },
    averageCalification: { type: Number, default: 0 },
    profileImage: { type: String },
    totalServices: { type: Number, default: 0 },
    totalClients: { type: Number, default: 0 },
    visits: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    performance: { type: Number, default: 0 },
    notifications: [notificationSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Trainer = mongoose.model("Trainer", trainerSchema);

export default Trainer;
