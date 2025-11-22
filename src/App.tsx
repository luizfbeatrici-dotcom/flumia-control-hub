import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { EmpresaSelectorProvider } from "@/contexts/EmpresaSelectorContext";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/admin/Dashboard";
import Empresas from "./pages/admin/Empresas";
import EmpresaDetalhes from "./pages/admin/EmpresaDetalhes";
import DashboardEmpresa from "./pages/admin/DashboardEmpresa";
import UsuariosAdmin from "./pages/admin/Usuarios";
import Bilhetagem from "./pages/admin/Bilhetagem";
import AdminConfiguracoes from "./pages/admin/Configuracoes";
import ConfiguracaoPlataforma from "./pages/admin/ConfiguracaoPlataforma";
import Depoimentos from "./pages/admin/Depoimentos";
import FAQ from "./pages/admin/FAQ";
import Notificacoes from "./pages/admin/Notificacoes";
import CompanyDashboard from "./pages/company/Dashboard";
import Produtos from "./pages/company/Produtos";
import Clientes from "./pages/company/Clientes";
import Pedidos from "./pages/company/Pedidos";
import Configuracoes from "./pages/company/Configuracoes";
import UsuariosEmpresa from "./pages/company/Usuarios";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import Leads from "./pages/admin/Leads";
import AddProductsTemp from "./pages/admin/AddProductsTemp";
import ThemeDemo from "./pages/admin/ThemeDemo";
import AuditLogs from "./pages/admin/AuditLogs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <EmpresaSelectorProvider>
            <Routes>
              {/* Rota raiz pública */}
              <Route path="/landing" element={<Index />} />
              
              {/* Rota raiz - redireciona para dashboard apropriado */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <div />
                  </ProtectedRoute>
                } 
              />
              
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            
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
                path="/admin/empresas/:id/dashboard"
                element={
                  <ProtectedRoute requireAdminMaster>
                    <DashboardEmpresa />
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
              <Route
                path="/admin/depoimentos"
                element={
                  <ProtectedRoute requireAdminMaster>
                    <Depoimentos />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/faq"
                element={
                  <ProtectedRoute requireAdminMaster>
                    <FAQ />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/notificacoes"
                element={
                  <ProtectedRoute requireAdminMaster>
                    <Notificacoes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/leads"
                element={
                  <ProtectedRoute requireAdminMaster>
                    <Leads />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/configuracao-plataforma"
                element={
                  <ProtectedRoute requireAdminMaster>
                    <ConfiguracaoPlataforma />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/add-products-temp"
                element={
                  <ProtectedRoute requireAdminMaster>
                    <AddProductsTemp />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/theme-demo"
                element={
                  <ProtectedRoute requireAdminMaster>
                    <ThemeDemo />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/audit-logs"
                element={
                  <ProtectedRoute requireAdminMaster>
                    <AuditLogs />
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
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
