import { useState } from "react";
import { Dumbbell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import userService from "@/services/user.service";

const PasswordRecovery = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [pin, setPin] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            setError("Por favor ingresa tu email");
            return;
        }

        if (!pin.trim()) {
            setError("Por favor ingresa tu PIN de recuperación");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            await userService.initiatePasswordReset({ email, pin });

            sessionStorage.setItem("resetEmail", email);
            navigate("/restore-password");
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Error al iniciar la recuperación"
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="flex h-full items-center justify-center">
            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4 rounded-lg border p-8"
            >
                <div className="flex justify-center">
                    <Dumbbell className="size-10 text-primary " />
                </div>
                <h1 className="text-center text-3xl font-bold break-words max-w-sm">
                    ¿Olvidaste tu contraseña?
                </h1>
                <Label className="text-center text-muted-foreground text-1xl break-words max-w-sm">
                    Ingresa tu email y usa tu PIN de recuperación para restablecer tu
                    contraseña.
                </Label>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    <Label htmlFor="email">
                        Email<span className="text-red-500">*</span>
                    </Label>
                    <Input
                        type="email"
                        placeholder="Ej: example@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="email">
                        PIN<span className="text-red-500">*</span>
                    </Label>
                    <Input
                        type="password"
                        placeholder="Ej: 1234"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        required
                    />
                </div>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Iniciando recuperación..." : "Continuar"}
                </Button>
                <Link to="/login" className="font-normal text-center">
                    ¿Ya tenes cuenta?{" "}
                    <span className="font-bold underline">Iniciar sesión</span>
                </Link>
                <Link to="/sign-up" className="font-normal text-center">
                    No tenés cuenta?{" "}
                    <span className="font-bold underline">Registrate</span>
                </Link>
            </form>
        </section>
    );
};

export default PasswordRecovery;
