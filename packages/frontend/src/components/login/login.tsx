import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dumbbell } from "lucide-react";

const Login = () => {
  return (
    <section className="flex h-full items-center justify-center">
      <form className="flex flex-col gap-4 rounded-lg border p-8">
        <div className="flex justify-center">
          <Dumbbell className="size-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-center">Iniciar sesión</h1>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input type="email" placeholder="Email" size={40} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">
            Contraseña <span className="text-red-500">*</span>
          </Label>
          <Input type="password" placeholder="Contraseña" />
        </div>
        <Link
          to="/forgot-password"
          className="font-normal text-center underline"
        >
          Olvidé mi contraseña
        </Link>
        <Button>Iniciar sesión</Button>
        <Link to="/register" className="font-normal text-center">
          No tenés cuenta?{" "}
          <span className="font-bold underline">Registrate</span>
        </Link>
      </form>
    </section>
  );
};

export default Login;
