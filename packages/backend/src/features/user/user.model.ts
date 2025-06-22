import mongoose from "mongoose";

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
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  birthDay: { type: Date, required: true },
  role: { type: String, required: true, enum: ["cliente", "entrenador"] },
  avatar: { type: String, required: false },
  avatarPath: { type: String, required: false }, // Store file path for deletion
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model<IUser>("User", userSchema);

export default User;
