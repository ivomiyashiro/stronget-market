import { Label } from "@radix-ui/react-label";
import { BellRing, Dumbbell, Menu, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/store/auth/auth.hooks";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
          <Label className="text-xl font-bold text-primary leading-[1] cursor-pointer">
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
          <div className="flex items-center gap-4">
            {user?.role === "entrenador" ? (
              <Button variant="secondary">
                <BellRing className="size-4" />
                Notificaciones
              </Button>
            ) : (
              <Button variant="secondary">
                <ShoppingCart className="size-4" />
                Carrito
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex flex-row items-center gap-2 rounded-full p-1"
                >
                  <Menu className="size-5 ml-1" />
                  <Avatar className="size-7">
                    <AvatarImage
                      src={user?.avatar}
                      alt={`Foto de ${user?.name}`}
                    />
                    <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to={`/profile/${user?.id}`}>Mi Perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Link to="/my-services">Mis Servicios</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {user?.role === "entrenador" && (
                  <DropdownMenuItem className="cursor-pointer">
                    <Link to="/create-service">Crear Servicio</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer"
                >
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
