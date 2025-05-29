import { Dumbbell } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

const SignUp = () => {
  return (
    <section className="flex h-full items-center justify-center">
      <form className="flex flex-col gap-6 rounded-lg border p-8">
        <div className="flex justify-center">
          <Dumbbell className="size-10 text-primary " />
        </div>
        <h1 className="text-center text-3xl font-bold break-words max-w">
          Registrate
        </h1>

        <div className="flex flex-row gap-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">
              Nombre<span className="text-red-500">*</span>
            </Label>
            <Input type="text" placeholder="Ej: Leo" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="lastname">
              Apellido<span className="text-red-500">*</span>
            </Label>
            <Input type="text" placeholder="Ej: Messi" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="birthdate">
              Fecha de nacimiento<span className="text-red-500">*</span>
            </Label>
            <Input type="date" placeholder="Ej: 24/06/1987" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">
            Email<span className="text-red-500">*</span>
          </Label>
          <Input type="email" placeholder="Ej: example@gmail.com" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">
            Contraseña<span className="text-red-500">*</span>
          </Label>
          <Input type="password" placeholder="Contraseña" />
          <Label className="text-sm justify-end">
            * 8 caracteres, 1 minúscula, 1 número y un caracter especial
          </Label>
          <Label htmlFor="role">Tipo de usuario:</Label>
          <RadioGroup defaultValue="client" className="flex flex-col gap-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="client" id="client" />
              <Label htmlFor="client">Cliente</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="trainer" id="trainer" />
              <Label htmlFor="trainer">Entrenador</Label>
            </div>
          </RadioGroup>
        </div>
        <div className="flex flex-col gap-2 justify-end">
          <Button>Registrate</Button>
          <Link to="/login" className="font-normal text-center">
            ¿Ya tenes cuenta?{" "}
            <span className="font-bold underline">Iniciar sesión</span>
          </Link>
        </div>
      </form>
    </section>
  );
};

export default SignUp;
