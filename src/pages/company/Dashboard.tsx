import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, ShoppingCart, MessageSquare, TrendingUp, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useMemo, useState } from "react";
import { SalesFunnelWidget } from "@/components/company/SalesFunnelWidget";
import { LostSalesWidget } from "@/components/company/LostSalesWidget";
import { CustomerActivityWidget } from "@/components/company/CustomerActivityWidget";
import { useEmpresaSelector } from "@/contexts/EmpresaSelectorContext";

export default function CompanyDashboard() {
  const { profile, isAdminMaster } = useAuth();
  const { selectedEmpresaId } = useEmpresaSelector();
  const [isSalesFunnelMinimized, setIsSalesFunnelMinimized] = useState(true);
  const [isLostSalesMinimized, setIsLostSalesMinimized] = useState(true);
  const [isCustomerActivityMinimized, setIsCustomerActivityMinimized] = useState(true);

  // Se admin master, usar a empresa selecionada; senão, usar a empresa do perfil
  const empresaId = isAdminMaster ? selectedEmpresaId : profile?.empresa_id;

  const { data: pessoas } = useQuery({
    queryKey: ["pessoas", empresaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pessoas")
        .select("*")
        .eq("empresa_id", empresaId || "");
      if (error) throw error;
      return data;
    },
    enabled: !!empresaId,
  });

  const { data: produtos } = useQuery({
    queryKey: ["produtos", empresaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .eq("empresa_id", empresaId || "")
        .eq("ativo", true);
      if (error) throw error;
      return data;
    },
    enabled: !!empresaId,
  });

  const { data: pedidos } = useQuery({
    queryKey: ["pedidos", empresaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pedidos")
        .select("*")
        .eq("empresa_id", empresaId || "");
      if (error) throw error;
      return data;
    },
    enabled: !!empresaId,
  });

  // Buscar pedidos pendentes para o widget de Conversas Ativas
  const { data: pedidosPendentes } = useQuery({
    queryKey: ["pedidos-pendentes", empresaId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("pedidos")
        .select("*", { count: "exact", head: true })
        .eq("empresa_id", empresaId || "")
        .eq("status", "pending");
      if (error) throw error;
      return count;
    },
    enabled: !!empresaId,
  });

  const conversasAtivasCount = pedidosPendentes || 0;

  const vendasMesAtual = useMemo(() => {
    if (!pedidos) return 0;
    const mesAtual = new Date().getMonth();
    const anoAtual = new Date().getFullYear();
    
    return pedidos
      .filter((p) => {
        const dataPedido = new Date(p.created_at || "");
        return dataPedido.getMonth() === mesAtual && dataPedido.getFullYear() === anoAtual;
      })
      .reduce((sum, p) => sum + (Number(p.total) || 0), 0);
  }, [pedidos]);

  const vendasFinalizadasMes = useMemo(() => {
    if (!pedidos) return 0;
    const mesAtual = new Date().getMonth();
    const anoAtual = new Date().getFullYear();
    
    return pedidos.filter((p) => {
      const dataPedido = new Date(p.created_at || "");
      return (
        dataPedido.getMonth() === mesAtual &&
        dataPedido.getFullYear() === anoAtual &&
        p.status === "completed"
      );
    }).length;
  }, [pedidos]);

  const ticketMedio = useMemo(() => {
    if (!pedidos) return 0;
    const mesAtual = new Date().getMonth();
    const anoAtual = new Date().getFullYear();
    
    const vendasFinalizadas = pedidos.filter((p) => {
      const dataPedido = new Date(p.created_at || "");
      return (
        dataPedido.getMonth() === mesAtual &&
        dataPedido.getFullYear() === anoAtual &&
        p.status === "completed"
      );
    });

    if (vendasFinalizadas.length === 0) return 0;

    const valorTotal = vendasFinalizadas.reduce((sum, p) => sum + (Number(p.total) || 0), 0);
    return valorTotal / vendasFinalizadas.length;
  }, [pedidos]);


  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Indicadores e métricas da empresa</p>
        </div>

        {/* Cards de Estatísticas - Primeira linha */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pessoas?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Clientes cadastrados</p>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{produtos?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Produtos ativos</p>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pedidos?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Pedidos realizados</p>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversas Ativas</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversasAtivasCount || 0}</div>
              <p className="text-xs text-muted-foreground">Pedidos pendentes</p>
            </CardContent>
          </Card>
        </div>

        {/* Cards de Estatísticas - Segunda linha */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendas do Mês</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(vendasMesAtual || 0)}
              </div>
              <p className="text-xs text-muted-foreground">Total de vendas no mês atual</p>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendas Finalizadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vendasFinalizadasMes}</div>
              <p className="text-xs text-muted-foreground">Pedidos finalizados no mês</p>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Médio do Mês</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(ticketMedio || 0)}
              </div>
              <p className="text-xs text-muted-foreground">Valor médio por venda finalizada</p>
            </CardContent>
          </Card>
        </div>

        {/* Widget de Funil de Vendas */}
        <SalesFunnelWidget 
          empresaId={empresaId || ""} 
          isMinimized={isSalesFunnelMinimized}
          onToggleMinimize={() => setIsSalesFunnelMinimized(!isSalesFunnelMinimized)}
        />

        {/* Widget de Vendas Perdidas */}
        <LostSalesWidget 
          empresaId={empresaId || ""}
          isMinimized={isLostSalesMinimized}
          onToggleMinimize={() => setIsLostSalesMinimized(!isLostSalesMinimized)}
        />

        {/* Widget de Atividades do Cliente */}
        <CustomerActivityWidget
          empresaId={empresaId || ""}
          isMinimized={isCustomerActivityMinimized}
          onToggleMinimize={() => setIsCustomerActivityMinimized(!isCustomerActivityMinimized)}
        />
      </div>
    </DashboardLayout>
  );
}
