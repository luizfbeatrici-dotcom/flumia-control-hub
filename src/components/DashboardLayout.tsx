import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { EmpresaSelector } from "@/components/EmpresaSelector";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "react-router-dom";
import flumiaLogo from "@/assets/flumia-logo.png";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAdminMaster } = useAuth();
  const location = useLocation();
  
  const rotasSemSeletor = [
    '/admin/empresas',
    '/admin/usuarios',
  ];
  
  const isEmpresaDetalhes = location.pathname.match(/^\/admin\/empresas\/[^/]+$/);
  
  const mostrarSeletor = isAdminMaster && 
    !rotasSemSeletor.includes(location.pathname) && 
    !isEmpresaDetalhes;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b bg-card px-6 shadow-soft">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-purple p-1.5">
                <img src={flumiaLogo} alt="Flumia Flow" className="h-full w-full object-contain" />
              </div>
            </div>
            {mostrarSeletor && <EmpresaSelector />}
          </header>
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
