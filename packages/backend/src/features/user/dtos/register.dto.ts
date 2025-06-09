export type RegisterDTO = {
  name: string;
  surname: string;
  email: string;
  password: string;
  birthDay: Date;
  role: "cliente" | "entrenador";
};

export type RegisterResultDTO = {
  message: string;
};
