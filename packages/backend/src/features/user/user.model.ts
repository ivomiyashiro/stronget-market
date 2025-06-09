import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  birthDay: { type: Date, required: true },
  role: { type: String, required: true, enum: ["cliente", "entrenador"] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

export default User;
