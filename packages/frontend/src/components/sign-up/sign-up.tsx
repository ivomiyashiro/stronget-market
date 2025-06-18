import { Dumbbell } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import userService, { type RegisterDTO } from "@/services/user.service";
import { useState } from "react";

const SignUp = () => {
    const [cargando, setCargando] = useState(false);
    const [data, setData] = useState<RegisterDTO>({
        name: "",
        surname: "",
        email: "",
        password: "",
        birthDay: new Date(),
        role: "cliente",
    });

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setCargando(false);
        await userService.registerUser(data);
        setCargando(true);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    return (
        <section className="flex h-full items-center justify-center">
            <form
                className="flex flex-col gap-6 rounded-lg border p-8"
                onSubmit={handleSubmit}
            >
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
                        <Input
                            name="name"
                            type="text"
                            placeholder="Ej: Leo"
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="lastname">
                            Apellido<span className="text-red-500">*</span>
                        </Label>
                        <Input
                            name="surname"
                            type="text"
                            placeholder="Ej: Messi"
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="birthdate">
                            Fecha de nacimiento<span className="text-red-500">*</span>
                        </Label>
                        <Input
                            name="birthDay"
                            type="date"
                            placeholder="Ej: 24/06/1987"
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="email">
                        Email<span className="text-red-500">*</span>
                    </Label>
                    <Input
                        name="email"
                        type="email"
                        placeholder="Ej: example@gmail.com"
                        onChange={handleInputChange}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="password">
                        Contraseña<span className="text-red-500">*</span>
                    </Label>
                    <Input
                        name="password"
                        type="password"
                        placeholder="Contraseña"
                        onChange={handleInputChange}
                    />
                    <Label className="text-sm justify-end">
                        * 8 caracteres, 1 minúscula, 1 número y un caracter especial
                    </Label>
                    <Label htmlFor="role">Tipo de usuario:</Label>
                    <RadioGroup
                        name="role"
                        defaultValue="client"
                        className="flex flex-col gap-2"
                        onChange={handleInputChange}
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="client" id="cliente" />
                            <Label htmlFor="cliente">Cliente</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="trainer" id="entrenador" />
                            <Label htmlFor="entrenador">Entrenador</Label>
                        </div>
                    </RadioGroup>
                </div>
                <div className="flex flex-col gap-2 justify-end">
                    <Button>{cargando ? "Cargando..." : "Registrate"}</Button>
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
