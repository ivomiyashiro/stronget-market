export type LoginDTO = {
  email: string;
  password: string;
};

export type LoginResultDTO = {
  token: string;
  user: {
    id: string;
    name: string;
    surname: string;
    email: string;
    birthDay: Date;
    avatar?: string;
    role: "cliente" | "entrenador";
    createdAt: Date;
  };
};
