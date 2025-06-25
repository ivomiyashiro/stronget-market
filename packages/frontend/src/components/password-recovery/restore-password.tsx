import { useState, useEffect } from "react";
import { Dumbbell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import userService from "@/services/user.service";

const RestorePassword = () => {
    const navigate = useNavigate();
    const [pin, setPin] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        const email = sessionStorage.getItem("resetEmail");
        if (!email) {
            navigate("/password-recovery");
        }
    }, [navigate]);

    const validatePassword = (password: string): string => {
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (password.length < 8) {
            return "La contraseña debe tener al menos 8 caracteres";
        }
        if (!hasLowerCase) {
            return "La contraseña debe contener al menos 1 minúscula";
        }
        if (!hasNumber) {
            return "La contraseña debe contener al menos 1 número";
        }
        if (!hasSpecialChar) {
            return "La contraseña debe contener al menos 1 caracter especial";
        }
        return "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const email = sessionStorage.getItem("resetEmail");

        if (!email) {
            navigate("/password-recovery");
            return;
        }

        // Validate PIN
        if (!pin.trim()) {
            setError("Por favor ingresa tu PIN de recuperación");
            return;
        }

        // Validate password
        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        // Validate confirm password
        if (newPassword !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        setIsLoading(true);
        setError("");
        setSuccessMessage("");

        try {
            const response = await userService.resetPasswordWithPin({
                email,
                pin,
                newPassword,
            });

            setSuccessMessage(response.message);

            // Clear session storage
            sessionStorage.removeItem("resetEmail");

            // Redirect to login after success
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Error al restablecer la contraseña"
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="flex h-full items-center justify-center">
            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-6 rounded-lg border p-8"
            >
                <div className="flex justify-center">
                    <Dumbbell className="size-10 text-primary " />
                </div>
                <h1 className="text-center text-3xl font-bold break-words max-w-sm">
                    Recuperar contraseña
                </h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                        {successMessage}
                    </div>
                )}

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="pin">
                            PIN<span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="text"
                            placeholder="Ej: 1234"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="password">
                            Nueva contraseña<span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="password"
                            placeholder="Nueva contraseña"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="confirmPassword">
                            Confirmar contraseña<span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="password"
                            placeholder="Repetir contraseña"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <Label className="text-sm flex-end">
                    * 8 caracteres, 1 minúscula, 1 número y un caracter especial
                </Label>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Restableciendo..." : "Restablecer contraseña"}
                </Button>

                <button
                    type="button"
                    onClick={() => navigate("/password-recovery")}
                    className="text-sm text-muted-foreground hover:underline"
                >
                    ← Volver al inicio
                </button>
            </form>
        </section>
    );
};

export default RestorePassword;
