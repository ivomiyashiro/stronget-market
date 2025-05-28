import { Dumbbell } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";

const RestorePassword = () => {
  return (
    <section className="flex h-screen w-screen items-center justify-center">
      <form className="flex flex-col gap-6 rounded-lg border p-8">
        <div className="flex justify-center">
          <Dumbbell className="size-10 text-primary " />
        </div>
        <h1 className="text-center text-3xl font-bold break-words max-w-sm">
          Recuperar contraseña
        </h1>
        <Label className="justify-center text-muted-foreground text-1xl break-words max-w-sm">
          Ingrese su nueva contraseña
        </Label>
        <div className="flex flex-col gap-4">
          <Label htmlFor="password">
            Nueva contraseña<span className="text-red-500">*</span>
          </Label>
          <Input type="password" placeholder="Nueva contraseña" />
          <Label htmlFor="confirmPassword">
            Confirmar contraseña<span className="text-red-500">*</span>
          </Label>
          <Input type="password" placeholder="Repetir contraseña" />
        </div>
        <Label className="text-sm flex-end">
          * 8 caracteres, 1 minúscula, 1 número y un caracter especial
        </Label>
        <Button>Restablecer contraseña</Button>
      </form>
    </section>
  );
};

export default RestorePassword;
