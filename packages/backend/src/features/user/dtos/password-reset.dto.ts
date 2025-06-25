export type PasswordResetDTO = {
    email: string;
    newPassword: string;
};

export type InitiatePasswordResetDTO = {
    email: string;
    pin: string;
};

export type VerifyPinDTO = {
    email: string;
    pin: string;
};

export type ResetPasswordWithPinDTO = {
    email: string;
    pin: string;
    newPassword: string;
};
