import { Building2, LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, MessageSquare, HelpCircle, MessageCircle, DollarSign, Bell, UserCheck } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEmpresaSelector } from "@/contexts/EmpresaSelectorContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import flumiaLogo from "@/assets/flumia-logo.png";

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { profile, isAdminMaster, signOut } = useAuth();
  const { selectedEmpresaId } = useEmpresaSelector();
  const collapsed = state === "collapsed";

  const adminMasterItems = [
    { title: "Dashboard Master", url: "/admin", icon: LayoutDashboard },
    { title: "Empresas", url: "/admin/empresas", icon: Building2 },
    { title: "Usuários", url: "/admin/usuarios", icon: Users },
    { title: "Bilhetagem", url: "/admin/bilhetagem", icon: DollarSign },
    { title: "Leads", url: "/admin/leads", icon: UserCheck },
    { title: "Notificações", url: "/admin/notificacoes", icon: Bell },
    { title: "Assistente", url: "/admin/configuracoes", icon: MessageCircle },
    { title: "Depoimentos", url: "/admin/depoimentos", icon: MessageSquare },
    { title: "FAQ", url: "/admin/faq", icon: HelpCircle },
  ];

  const companyItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Produtos", url: "/produtos", icon: Package },
    { title: "Clientes", url: "/clientes", icon: Users },
    { title: "Pedidos", url: "/pedidos", icon: ShoppingCart },
    { title: "Usuários", url: "/usuarios", icon: Users },
    { title: "Configurações", url: "/configuracoes", icon: Settings },
  ];

  // Se admin master selecionou uma empresa específica, mostrar menus da empresa
  const showCompanyView = isAdminMaster && selectedEmpresaId;
  const items = showCompanyView ? companyItems : (isAdminMaster ? adminMasterItems : companyItems);

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-purple p-2">
            <img src={flumiaLogo} alt="flum.ia" className="h-full w-full object-contain" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-foreground">flum.ia</span>
              <span className="text-xs text-sidebar-foreground/60">
                {showCompanyView ? "Visão da Empresa" : (isAdminMaster ? "Admin Master" : "Painel Gerencial")}
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-sidebar-foreground/60">Menu</SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
              {profile?.nome?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-sidebar-foreground">
                {profile?.nome}
              </p>
              <p className="truncate text-xs text-sidebar-foreground/60">{profile?.email}</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="mt-2 w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
