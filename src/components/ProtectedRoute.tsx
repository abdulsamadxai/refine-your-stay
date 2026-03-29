import { Navigate, useLocation } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { Loader2 } from "lucide-react";
import type { UserRole } from "@/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If set, the route requires exactly this role. Others are redirected. */
  requiredRole?: UserRole;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading } = useApp();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground font-body font-medium">Loading your session...</p>
        </div>
      </div>
    );
  }

  // Not logged in → send to login, preserving intended destination
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role mismatch: redirect to the user's correct home
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === "host" ? "/host" : "/"} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

