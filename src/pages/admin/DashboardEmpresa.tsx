import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, ShoppingCart, MessageSquare } from "lucide-react";
import { SalesFunnelWidget } from "@/components/company/SalesFunnelWidget";
import { LostSalesWidget } from "@/components/company/LostSalesWidget";
import { useMemo, useState } from "react";

export default function DashboardEmpresa() {
  const { id } = useParams<{ id: string }>();
  const [isSalesFunnelMinimized, setIsSalesFunnelMinimized] = useState(true);
  const [isLostSalesMinimized, setIsLostSalesMinimized] = useState(true);

  const { data: empresa } = useQuery({
    queryKey: ["empresa", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("empresas")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: pessoas } = useQuery({
    queryKey: ["pessoas", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pessoas")
        .select("*")
        .eq("empresa_id", id);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: produtos } = useQuery({
    queryKey: ["produtos", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .eq("empresa_id", id)
        .eq("ativo", true);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: pedidos } = useQuery({
    queryKey: ["pedidos", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pedidos")
        .select("*")
        .eq("empresa_id", id);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: contatos } = useQuery({
    queryKey: ["contatos", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contatos")
        .select("*")
        .eq("empresa_id", id)
        .eq("status", "ativo");
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const conversasAtivasCount = contatos?.length || 0;

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{empresa?.fantasia || "Dashboard"}</h1>
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
              <p className="text-xs text-muted-foreground">Contatos com status ativo</p>
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
        </div>

        {/* Widget de Funil de Vendas */}
        <SalesFunnelWidget 
          empresaId={id!} 
          isMinimized={isSalesFunnelMinimized}
          onToggleMinimize={() => setIsSalesFunnelMinimized(!isSalesFunnelMinimized)}
        />

        {/* Widget de Vendas Perdidas */}
        <LostSalesWidget 
          empresaId={id!}
          isMinimized={isLostSalesMinimized}
          onToggleMinimize={() => setIsLostSalesMinimized(!isLostSalesMinimized)}
        />
      </div>
    </DashboardLayout>
  );
}
