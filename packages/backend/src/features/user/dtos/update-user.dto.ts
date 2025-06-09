export type UpdateUserDTO = {
  name: string;
  surname: string;
  email: string;
  birthDay: Date;
  role: "cliente" | "entrenador";
};

export type UpdateUserResultDTO = UpdateUserDTO;
