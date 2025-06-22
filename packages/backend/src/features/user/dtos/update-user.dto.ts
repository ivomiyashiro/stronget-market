export type UpdateUserDTO = {
  name: string;
  surname: string;
  email: string;
  birthDay: Date;
  role: "cliente" | "entrenador";
  avatar?: string;
};

export type UpdateUserResultDTO = UpdateUserDTO;
