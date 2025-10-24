import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, ShoppingCart, Activity } from "lucide-react";
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
        .select("id", { count: "exact", head: true })
        .eq("ativo", true);
      
      let profilesQuery = supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("ativo", true);
      
      let pedidosQuery = supabase
        .from("pedidos")
        .select("id", { count: "exact", head: true });
      
      let jornadasQuery = supabase
        .from("jornadas")
        .select("id", { count: "exact", head: true });

      if (selectedEmpresaId) {
        empresasQuery = empresasQuery.eq("id", selectedEmpresaId);
        profilesQuery = profilesQuery.eq("empresa_id", selectedEmpresaId);
        pedidosQuery = pedidosQuery.eq("empresa_id", selectedEmpresaId);
        jornadasQuery = jornadasQuery.eq("empresa_id", selectedEmpresaId);
      }

      const [empresas, profiles, pedidos, jornadas] = await Promise.all([
        empresasQuery,
        profilesQuery,
        pedidosQuery,
        jornadasQuery,
      ]);

      return {
        empresas: empresas.count || 0,
        usuarios: profiles.count || 0,
        pedidos: pedidos.count || 0,
        mensagens: jornadas.count || 0,
      };
    },
  });

  const cards = [
    {
      title: "Empresas Ativas",
      value: stats?.empresas || 0,
      icon: Building2,
      gradient: "from-primary to-primary-hover",
    },
    {
      title: "Total de Usuários",
      value: stats?.usuarios || 0,
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
      title: "Mensagens Automatizadas",
      value: stats?.mensagens || 0,
      icon: Activity,
      gradient: "from-primary to-secondary",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Master</h1>
          <p className="text-muted-foreground">Visão geral da plataforma Flumia Flow</p>
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
                <div className="text-3xl font-bold">{card.value.toLocaleString()}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
