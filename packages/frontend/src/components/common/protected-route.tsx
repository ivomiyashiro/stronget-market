import { Navigate } from "react-router-dom";
import { useAuth } from "@/store/auth/auth.hooks";

interface ProtectedRouteProps {
    children: React.ReactNode;
    redirectTo?: string;
    allowedRoles?: "entrenador" | "both" | "cliente";
}

const ProtectedRoute = ({
    children,
    redirectTo = "/login",
    allowedRoles = "cliente",
}: ProtectedRouteProps) => {
    const { user, isAuthenticated } = useAuth();
    const isAllowed = allowedRoles === "both" ? true : user?.role === allowedRoles;

    if (!isAuthenticated || !isAllowed) {
        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
