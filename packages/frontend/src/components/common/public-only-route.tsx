import { Navigate } from "react-router-dom";
import { useAuth } from "@/store/auth/auth.hooks";

interface PublicOnlyRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const PublicOnlyRoute = ({ children, redirectTo = "/" }: PublicOnlyRouteProps) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default PublicOnlyRoute; 