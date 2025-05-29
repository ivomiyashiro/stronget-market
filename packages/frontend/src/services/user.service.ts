import { BaseService } from "./base.service";

export class UserService extends BaseService {
  constructor() {
    super();
  }

  async getUser(id: string) {
    return this.get(`/users/${id}`);
  }
}

export default new UserService();
