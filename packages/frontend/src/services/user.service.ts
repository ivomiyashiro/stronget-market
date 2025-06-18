import { BaseService } from "./base.service";

export type RegisterDTO = {
    name: string;
    surname: string;
    email: string;
    password: string;
    birthDay: Date;
    role: "cliente" | "entrenador";
};

export class UserService extends BaseService {
    constructor() {
        super();
    }

    async getUser(id: string) {
        return this.get(`/users/${id}`);
    }

    async registerUser(data: RegisterDTO) {
        return this.post("/users/register", data);
    }
}

export default new UserService();
