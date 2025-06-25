import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "./user.model";
import { config } from "../../config/index";
import { StorageService } from "../../services/storage.service";
import {
  RegisterDTO,
  RegisterResultDTO,
  LoginDTO,
  LoginResultDTO,
  UpdateUserDTO,
  UpdateUserResultDTO,
  PasswordResetDTO,
  DeleteUserResultDTO,
  UploadAvatarResultDTO,
  DeleteAvatarResultDTO,
} from "./dtos/index";

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export class UserService {
  private readonly saltRounds = 10;
  private storageService: StorageService;

  constructor() {
    this.storageService = new StorageService();
  }

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
        avatar: user.avatar || "",
        role: user.role,
        createdAt: user.createdAt,
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
      {
        name: updateData.name,
        surname: updateData.surname,
        birthDay: updateData.birthDay,
        role: updateData.role,
        avatar: updateData.avatar,
        updatedAt: new Date(),
      },
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
      avatar: updatedUser.avatar || "",
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

  async uploadAvatar(userId: string, file: MulterFile): Promise<UploadAvatarResultDTO> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("Usuario no encontrado.");
    }

    // Delete old avatar if exists
    if (user.avatarPath) {
      try {
        await this.storageService.deleteAvatar(user.avatarPath);
      } catch (error) {
        console.warn("Failed to delete old avatar:", error);
      }
    }

    // Upload new avatar
    const { url, path } = await this.storageService.uploadAvatar(userId, file);

    // Update user with new avatar URL and path
    await User.findByIdAndUpdate(userId, {
      avatar: url,
      avatarPath: path,
      updatedAt: new Date(),
    });

    return {
      message: "Avatar subido exitosamente.",
      avatarUrl: url,
    };
  }

  async deleteAvatar(userId: string): Promise<DeleteAvatarResultDTO> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("Usuario no encontrado.");
    }

    if (!user.avatarPath) {
      throw new Error("El usuario no tiene avatar para eliminar.");
    }

    // Delete from storage
    await this.storageService.deleteAvatar(user.avatarPath);

    // Update user to remove avatar
    await User.findByIdAndUpdate(userId, {
      avatar: null,
      avatarPath: null,
      updatedAt: new Date(),
    });

    return { message: "Avatar eliminado exitosamente." };
  }

  async getUserById(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("Usuario no encontrado.");
    }

    return {
      id: user._id.toString(),
      name: user.name,
      surname: user.surname,
      email: user.email,
      birthDay: user.birthDay,
      avatar: user.avatar || "",
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}
