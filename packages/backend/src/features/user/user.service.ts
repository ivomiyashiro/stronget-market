import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "./user.model.js";
import { config } from "../../config/index.js";
import {
  RegisterDTO,
  RegisterResultDTO,
  LoginDTO,
  LoginResultDTO,
  UpdateUserDTO,
  UpdateUserResultDTO,
  PasswordResetDTO,
  DeleteUserResultDTO,
} from "./dtos/index.js";

export class UserService {
  private readonly saltRounds = 10;

  async register(userData: RegisterDTO): Promise<RegisterResultDTO> {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error("El usuario ya existe con este email.");
    }

    const hashedPassword = await bcrypt.hash(userData.password, this.saltRounds);

    const user = new User({
      ...userData,
      password: hashedPassword,
    });

    await user.save();

    return { message: "Usuario registrado exitosamente." };
  }

  async login(loginData: LoginDTO): Promise<LoginResultDTO> {
    const user = await User.findOne({ email: loginData.email });
    if (!user) {
      throw new Error("Credenciales inválidas.");
    }

    const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
    if (!isPasswordValid) {
      throw new Error("Credenciales inválidas.");
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: "24h" }
    );

    return {
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        surname: user.surname,
        email: user.email,
        birthDay: user.birthDay,
        role: user.role,
      },
    };
  }

  async updateUser(
    userId: string,
    updateData: UpdateUserDTO
  ): Promise<UpdateUserResultDTO> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("Usuario no encontrado.");
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error("Error al actualizar el usuario.");
    }

    return {
      name: updatedUser.name,
      surname: updatedUser.surname,
      email: updatedUser.email,
      birthDay: updatedUser.birthDay,
      role: updatedUser.role,
    };
  }

  async deleteUser(userId: string): Promise<DeleteUserResultDTO> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("Usuario no encontrado.");
    }

    await User.findByIdAndDelete(userId);
    return { message: "Usuario eliminado exitosamente." };
  }

  async passwordRecovery(
    passwordResetData: PasswordResetDTO
  ): Promise<{ message: string }> {
    const user = await User.findOne({ email: passwordResetData.email });
    if (!user) {
      throw new Error("Usuario no encontrado.");
    }

    const hashedPassword = await bcrypt.hash(
      passwordResetData.newPassword,
      this.saltRounds
    );

    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      updatedAt: new Date(),
    });

    return { message: "Contraseña actualizada exitosamente." };
  }
}
