import { Label } from "@radix-ui/react-label";
import { Dumbbell } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="border-b" role="banner">
      <nav
        className="flex items-center justify-between p-4 mx-32"
        aria-label="Navegación principal"
      >
        <Link
          to="/"
          className="flex items-center gap-2"
          aria-label="Ir a la página principal"
        >
          <Dumbbell className="size-10 text-primary" aria-hidden="true" />
          <Label className="text-xl font-bold text-primary leading-[1]">
            Stronget <br /> Market
          </Label>
        </Link>
        <div
          className="flex items-center gap-2"
          role="navigation"
          aria-label="Acceso de usuario"
        >
          <Link to="/login" className="hover:text-primary transition-colors">
            Iniciar sesión
          </Link>
          <Link to="/sign-up" className="hover:text-primary transition-colors">
            Registrarse
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
