import { Label } from "@radix-ui/react-label";
import { Dumbbell } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/store/auth/auth.hooks";
import { Button } from "../ui/button";

const Header = () => {
  const { isAuthenticated, logoutUser, user } = useAuth();

  const handleLogout = () => {
    logoutUser();
  };

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
        {!isAuthenticated && (
          <div
            className="flex items-center gap-2"
            role="navigation"
            aria-label="Acceso de usuario"
          >
            <Link to="/login" className="hover:text-primary transition-colors">
              Iniciar sesión
            </Link>
            <Link
              to="/sign-up"
              className="hover:text-primary transition-colors"
            >
              Registrarse
            </Link>
          </div>
        )}
        {isAuthenticated && (
          <div className="flex items-center gap-2">
            <Link to={`/profile/${user?.id}`}>Perfil</Link>
            <Button
              onClick={handleLogout}
              className="hover:text-primary transition-colors"
            >
              Cerrar sesión
            </Button>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
