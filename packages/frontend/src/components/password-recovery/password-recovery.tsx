import { Dumbbell } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

const PasswordRecovery = () => {
  return (
    <section className="flex h-screen w-screen items-center justify-center">
      <form className="flex flex-col gap-4 rounded-lg border p-8">
        <div className="flex justify-center">
          <Dumbbell className="size-10 text-primary " />
        </div>
        <h1 className="text-center text-3xl font-bold break-words max-w-sm">
          ¿Olvidaste tu contraseña?
        </h1>
        <Label className="text-center text-muted-foreground text-1xl break-words max-w-sm">
          Te enviaremos un correo electrónico para que recuperes tu cuenta.
        </Label>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">
            Email<span className="text-red-500">*</span>
          </Label>
          <Input type="email" placeholder="Ej: example@gmail.com" />
        </div>
        <Button>Restablecer contraseña</Button>
        <Link to="/login" className="font-normal text-center">
          ¿Ya tenes cuenta?{" "}
          <span className="font-bold underline">Iniciar sesión</span>
        </Link>
        <Link to="/register" className="font-normal text-center">
          No tenés cuenta?{" "}
          <span className="font-bold underline">Registrate</span>
        </Link>
      </form>
    </section>
  );
};

export default PasswordRecovery;
