import { BaseService } from "./base.service";

export interface RegisterRequest {
  name: string;
  surname: string;
  email: string;
  password: string;
  birthDay: Date;
  role: "cliente" | "entrenador";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    surname: string;
    email: string;
    birthDay: string;
    role: "cliente" | "entrenador";
    profileImage?: string;
  };
}

export class UserService extends BaseService {
  constructor() {
    super();
  }

  async getUser(id: string) {
    return this.get(`/users/${id}`);
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return this.post("/users/register", data);
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    return this.post("/users/login", data);
  }

  async updateUser(id: string, data: Partial<RegisterRequest>) {
    return this.put(`/users/${id}`, data);
  }

  async deleteUser(id: string) {
    return this.delete(`/users/${id}`);
  }
}

export default new UserService();
