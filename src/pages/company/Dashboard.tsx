import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, ShoppingCart, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SalesFunnelWidget } from "@/components/company/SalesFunnelWidget";

export default function CompanyDashboard() {
  const { profile, isAdminMaster, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && isAdminMaster) {
      navigate("/admin", { replace: true });
    }
  }, [authLoading, isAdminMaster, navigate]);

  const { data: stats } = useQuery({
    queryKey: ["company-stats", profile?.empresa_id],
    queryFn: async () => {
      if (!profile?.empresa_id) return null;

      const [produtos, pessoas, pedidos] = await Promise.all([
        supabase
          .from("produtos")
          .select("id", { count: "exact", head: true })
          .eq("empresa_id", profile.empresa_id),
        supabase
          .from("pessoas")
          .select("id", { count: "exact", head: true })
          .eq("empresa_id", profile.empresa_id),
        supabase
          .from("pedidos")
          .select("total")
          .eq("empresa_id", profile.empresa_id),
      ]);

      const totalVendas = pedidos.data?.reduce((sum, p) => sum + (Number(p.total) || 0), 0) || 0;

      return {
        produtos: produtos.count || 0,
        clientes: pessoas.count || 0,
        pedidos: pedidos.data?.length || 0,
        vendas: totalVendas,
      };
    },
    enabled: !!profile?.empresa_id,
  });

  const cards = [
    {
      title: "Produtos Cadastrados",
      value: stats?.produtos || 0,
      icon: Package,
      gradient: "from-primary to-primary-hover",
    },
    {
      title: "Clientes Ativos",
      value: stats?.clientes || 0,
      icon: Users,
      gradient: "from-secondary to-accent",
    },
    {
      title: "Pedidos Realizados",
      value: stats?.pedidos || 0,
      icon: ShoppingCart,
      gradient: "from-accent to-primary",
    },
    {
      title: "Total de Vendas",
      value: `R$ ${(stats?.vendas || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      gradient: "from-primary to-secondary",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do seu negócio</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <Card key={card.title} className="overflow-hidden shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <div className={`rounded-lg bg-gradient-to-br ${card.gradient} p-2`}>
                  <card.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
