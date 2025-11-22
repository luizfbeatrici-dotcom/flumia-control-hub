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

  // Verificar permissões de admin master
  if (requireAdminMaster && !isAdminMaster) {
    return <Navigate to="/dashboard" replace />;
  }

  // Verificar permissões de company admin
  if (requireCompanyAdmin && !isCompanyAdmin && !isAdminMaster) {
    return <Navigate to="/dashboard" replace />;
  }

  // Se não há requisitos específicos, redirecionar para dashboard apropriado
  // baseado no tipo de usuário (evita o flash entre páginas)
  if (!requireAdminMaster && !requireCompanyAdmin) {
    // Se está na rota "/" sem requisitos, redireciona para o dashboard correto
    if (window.location.pathname === "/") {
      return <Navigate to={isAdminMaster ? "/admin" : "/dashboard"} replace />;
    }
  }

  return <>{children}</>;
}
