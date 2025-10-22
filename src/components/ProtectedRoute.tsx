import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdminMaster?: boolean;
  requireCompanyAdmin?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requireAdminMaster = false,
  requireCompanyAdmin = false 
}: ProtectedRouteProps) {
  const { user, loading, isAdminMaster, isCompanyAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requireAdminMaster && !isAdminMaster) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireCompanyAdmin && !isCompanyAdmin && !isAdminMaster) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
