export type UpdateUserDTO = {
  name: string;
  surname: string;
  email: string;
  password: string;
  birthDay: Date;
  role: "cliente" | "entrenador";
};

export type UpdateUserResultDTO = UpdateUserDTO;
