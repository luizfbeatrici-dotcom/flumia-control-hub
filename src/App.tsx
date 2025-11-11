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
import EmpresaDetalhes from "./pages/admin/EmpresaDetalhes";
import UsuariosAdmin from "./pages/admin/Usuarios";
import Bilhetagem from "./pages/admin/Bilhetagem";
import AdminConfiguracoes from "./pages/admin/Configuracoes";
import CompanyDashboard from "./pages/company/Dashboard";
import Produtos from "./pages/company/Produtos";
import Clientes from "./pages/company/Clientes";
import Pedidos from "./pages/company/Pedidos";
import Configuracoes from "./pages/company/Configuracoes";
import UsuariosEmpresa from "./pages/company/Usuarios";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";

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
              <Route path="/" element={<Index />} />
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
                path="/admin/empresas/:id"
                element={
                  <ProtectedRoute requireAdminMaster>
                    <EmpresaDetalhes />
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
              <Route
                path="/admin/bilhetagem"
                element={
                  <ProtectedRoute requireAdminMaster>
                    <Bilhetagem />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/configuracoes"
                element={
                  <ProtectedRoute requireAdminMaster>
                    <AdminConfiguracoes />
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
              path="/clientes"
              element={
                <ProtectedRoute>
                  <Clientes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pedidos"
              element={
                <ProtectedRoute>
                  <Pedidos />
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
            <Route
              path="/configuracoes"
              element={
                <ProtectedRoute>
                  <Configuracoes />
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
