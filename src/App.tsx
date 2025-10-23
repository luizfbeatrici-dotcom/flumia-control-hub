import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { EmpresaSelectorProvider } from "@/contexts/EmpresaSelectorContext";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/admin/Dashboard";
import Empresas from "./pages/admin/Empresas";
import UsuariosAdmin from "./pages/admin/Usuarios";
import CompanyDashboard from "./pages/company/Dashboard";
import Produtos from "./pages/company/Produtos";
import UsuariosEmpresa from "./pages/company/Usuarios";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <EmpresaSelectorProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/auth" replace />} />
              <Route path="/auth" element={<Auth />} />
            
            {/* Admin Master Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdminMaster>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
              <Route
                path="/admin/empresas"
                element={
                  <ProtectedRoute requireAdminMaster>
                    <Empresas />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/usuarios"
                element={
                  <ProtectedRoute requireAdminMaster>
                    <UsuariosAdmin />
                  </ProtectedRoute>
                }
              />
            
            {/* Company Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <CompanyDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/produtos"
              element={
                <ProtectedRoute>
                  <Produtos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/usuarios"
              element={
                <ProtectedRoute requireCompanyAdmin>
                  <UsuariosEmpresa />
                </ProtectedRoute>
              }
            />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
            </Routes>
          </EmpresaSelectorProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
