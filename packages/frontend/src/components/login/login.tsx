import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dumbbell } from "lucide-react";
import { useAuth } from "../../store/auth/auth.hooks";
import { useState } from "react";
import type { LoginRequest } from "@/services/user.service";

const Login = () => {
  const navigate = useNavigate();
  const { loginUser, isLoading, error } = useAuth();

  const [formData, setFormData] = useState<LoginRequest>({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await loginUser(formData);
      if (result.meta.requestStatus === "fulfilled") {
        // Login successful, redirect to main page
        navigate("/");
      }
    } catch (error) {
      // Error is handled by the thunk and stored in Redux state
      console.error("Login error:", error);
    }
  };

  return (
    <section className="flex h-full items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-lg border p-8"
      >
        <div className="flex justify-center">
          <Dumbbell className="size-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-center">Iniciar sesión</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error al iniciar sesión
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            type="email"
            placeholder="Email"
            size={40}
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">
            Contraseña <span className="text-red-500">*</span>
          </Label>
          <Input
            type="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
        </div>
        <Link
          to="/password-recovery"
          className="font-normal text-center underline"
        >
          Olvidé mi contraseña
        </Link>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
        </Button>
        <Link to="/sign-up" className="font-normal text-center">
          No tenés cuenta?{" "}
          <span className="font-bold underline">Registrate</span>
        </Link>
      </form>
    </section>
  );
};

export default Login;
