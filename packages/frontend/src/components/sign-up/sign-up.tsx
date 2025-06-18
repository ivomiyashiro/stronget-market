import { useState } from "react";
import { Dumbbell } from "lucide-react";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Button } from "../ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/store/auth/auth.hooks";
import type { RegisterData } from "@/store/auth/auth.types";
import { RequiredInput } from "../common/required-input";

const SignUp = () => {
  const navigate = useNavigate();
  const { registerUser, isLoading, error } = useAuth();

  const [formData, setFormData] = useState<RegisterData>({
    name: "",
    surname: "",
    email: "",
    password: "",
    birthDay: new Date(),
    role: "cliente",
  });

  const [passwordError, setPasswordError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

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

  const handleInputChange = (
    field: keyof RegisterData,
    value: string | Date
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Validate password when it changes
    if (field === "password") {
      const error = validatePassword(value as string);
      setPasswordError(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password before submission
    const passwordValidationError = validatePassword(formData.password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    try {
      const result = await registerUser(formData);
      if (result.meta.requestStatus === "fulfilled") {
        // Registration successful, show success message and redirect to login
        setSuccessMessage("¡Registro exitoso! Redirigiendo al login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      // Error is handled by the thunk and stored in Redux state
      console.error("Registration error:", error);
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
        <h1 className="text-center text-3xl font-bold break-words max-w">
          Registrate
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error al registrar el usuario
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {successMessage}
          </div>
        )}

        <div className="flex flex-row gap-2">
          <RequiredInput
            label="Nombre"
            placeholder="Ej: Leo"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            required
            fullSize
          />
          <RequiredInput
            label="Apellido"
            placeholder="Ej: Messi"
            value={formData.surname}
            onChange={(e) => handleInputChange("surname", e.target.value)}
            required
            fullSize
          />
          <RequiredInput
            label="Fecha de nacimiento"
            type="date"
            placeholder="Ej: 24/06/1987"
            value={
              formData.birthDay instanceof Date
                ? formData.birthDay.toISOString().split("T")[0]
                : ""
            }
            onChange={(e) =>
              handleInputChange("birthDay", new Date(e.target.value))
            }
            required
            fullSize
          />
        </div>
        <RequiredInput
          label="Email"
          type="email"
          placeholder="Ej: example@gmail.com"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          required
          fullSize
        />
        <RequiredInput
          label="Contraseña"
          type="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={(e) => handleInputChange("password", e.target.value)}
          error={passwordError}
          required
          fullSize
        />
        <Label className="text-sm justify-end">
          * 8 caracteres, 1 minúscula, 1 número y un caracter especial
        </Label>
        <Label htmlFor="role">Tipo de usuario:</Label>
        <RadioGroup
          value={formData.role}
          onValueChange={(value) =>
            handleInputChange("role", value as "cliente" | "entrenador")
          }
          className="flex flex-col gap-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cliente" id="cliente" />
            <Label htmlFor="cliente">Cliente</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="entrenador" id="entrenador" />
            <Label htmlFor="entrenador">Entrenador</Label>
          </div>
        </RadioGroup>
        <div className="flex flex-col gap-2 justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Registrando..." : "Registrate"}
          </Button>
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
