export type RegisterDTO = {
    name: string;
    surname: string;
    email: string;
    password: string;
    birthDay: Date;
    recoverPasswordPin: string;
    role: "cliente" | "entrenador";
};

export type RegisterResultDTO = {
    message: string;
};
