import mongoose from "mongoose";

export interface INotification {
    _id: mongoose.Types.ObjectId;
    message: string;
    leido: boolean;
    date: Date;
}

export interface IUser {
    _id: string;
    name: string;
    surname: string;
    email: string;
    password: string;
    birthDay: Date;
    role: "cliente" | "entrenador";
    avatar?: string;
    avatarPath?: string;
    notifications?: INotification[];
    createdAt: Date;
    updatedAt: Date;
}

const notificationSchema = new mongoose.Schema({
    message: { type: String, required: true },
    leido: { type: Boolean, default: false },
    date: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    birthDay: { type: Date, required: true },
    role: { type: String, required: true, enum: ["cliente", "entrenador"] },
    avatar: { type: String, required: false },
    avatarPath: { type: String, required: false }, // Store file path for deletion
    notifications: { type: [notificationSchema], required: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model<IUser>("User", userSchema);

export default User;
