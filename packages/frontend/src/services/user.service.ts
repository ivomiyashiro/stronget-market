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

export interface AuthResponse {
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  token?: string;
}

export class UserService extends BaseService {
  constructor() {
    super();
  }

  async getUser(id: string) {
    return this.get(`/users/${id}`);
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    return this.post("/users/register", data);
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
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
