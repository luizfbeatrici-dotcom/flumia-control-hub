import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, ShoppingCart, Activity, DollarSign, Package, UserCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresaSelector } from "@/contexts/EmpresaSelectorContext";

export default function AdminDashboard() {
  const { selectedEmpresaId } = useEmpresaSelector();

  const { data: stats } = useQuery({
    queryKey: ["admin-stats", selectedEmpresaId],
    queryFn: async () => {
      // Build queries with optional empresa filter
      let empresasQuery = supabase
        .from("empresas")
        .select("id, taxa_transacao", { count: "exact" })
        .eq("ativo", true);
      
      let profilesQuery = supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("ativo", true);
      
      let pedidosQuery = supabase
        .from("pedidos")
        .select("id, total", { count: "exact" });
      
      let jornadasQuery = supabase
        .from("jornadas")
        .select("id", { count: "exact", head: true });

      let produtosQuery = supabase
        .from("produtos")
        .select("id", { count: "exact", head: true })
        .eq("ativo", true);

      let pessoasQuery = supabase
        .from("pessoas")
        .select("id", { count: "exact", head: true });

      if (selectedEmpresaId) {
        empresasQuery = empresasQuery.eq("id", selectedEmpresaId);
        profilesQuery = profilesQuery.eq("empresa_id", selectedEmpresaId);
        pedidosQuery = pedidosQuery.eq("empresa_id", selectedEmpresaId);
        jornadasQuery = jornadasQuery.eq("empresa_id", selectedEmpresaId);
        produtosQuery = produtosQuery.eq("empresa_id", selectedEmpresaId);
        pessoasQuery = pessoasQuery.eq("empresa_id", selectedEmpresaId);
      }

      const [empresas, profiles, pedidos, jornadas, produtos, pessoas] = await Promise.all([
        empresasQuery,
        profilesQuery,
        pedidosQuery,
        jornadasQuery,
        produtosQuery,
        pessoasQuery,
      ]);

      // Calcular valor total dos pedidos
      const valorTotalPedidos = pedidos.data?.reduce((sum, p) => sum + (Number(p.total) || 0), 0) || 0;

      return {
        empresas: empresas.count || 0,
        usuarios: profiles.count || 0,
        pedidos: pedidos.count || 0,
        mensagens: jornadas.count || 0,
        produtos: produtos.count || 0,
        pessoas: pessoas.count || 0,
        valorTotalPedidos,
      };
    },
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const cards = [
    {
      title: "Empresas Ativas",
      value: stats?.empresas || 0,
      icon: Building2,
      gradient: "from-primary to-primary-hover",
      format: "number",
    },
    {
      title: "Total de Usuários",
      value: stats?.usuarios || 0,
      icon: Users,
      gradient: "from-secondary to-accent",
      format: "number",
    },
    {
      title: "Pedidos Realizados",
      value: stats?.pedidos || 0,
      icon: ShoppingCart,
      gradient: "from-accent to-primary",
      format: "number",
    },
    {
      title: "Mensagens Automatizadas",
      value: stats?.mensagens || 0,
      icon: Activity,
      gradient: "from-primary to-secondary",
      format: "number",
    },
    {
      title: "Valor Total de Pedidos",
      value: stats?.valorTotalPedidos || 0,
      icon: DollarSign,
      gradient: "from-primary to-accent",
      format: "currency",
    },
    {
      title: "Total de Produtos",
      value: stats?.produtos || 0,
      icon: Package,
      gradient: "from-secondary to-primary",
      format: "number",
    },
    {
      title: "Total de Clientes",
      value: stats?.pessoas || 0,
      icon: UserCircle,
      gradient: "from-accent to-secondary",
      format: "number",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Master</h1>
          <p className="text-muted-foreground">Visão geral da plataforma flum.ia</p>
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
                <div className="text-3xl font-bold">
                  {card.format === "currency" 
                    ? card.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                    : card.value.toLocaleString('pt-BR')
                  }
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
