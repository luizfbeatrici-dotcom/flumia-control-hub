import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface SalesFunnelWidgetProps {
  empresaId: string;
}

interface EtapaStats {
  etapa_id: string;
  etapa_nome: string;
  ordem: number;
  total_contatos: number;
}

export function SalesFunnelWidget({ empresaId }: SalesFunnelWidgetProps) {
  const { data: funnelData, isLoading } = useQuery({
    queryKey: ["sales-funnel", empresaId],
    queryFn: async () => {
      // Buscar todas as etapas ativas da empresa
      const { data: etapas, error: etapasError } = await supabase
        .from("etapas")
        .select("id, nome, ordem")
        .eq("empresa_id", empresaId)
        .eq("ativo", true)
        .order("ordem");

      if (etapasError) throw etapasError;

      // Buscar contatos ativos agrupados por etapa
      const { data: contatos, error: contatosError } = await supabase
        .from("contatos")
        .select("etapa_id, status")
        .eq("empresa_id", empresaId)
        .not("status", "is", null);

      if (contatosError) throw contatosError;

      // Agrupar contatos por etapa
      const contatosPorEtapa = contatos.reduce((acc, contato) => {
        const etapaId = contato.etapa_id;
        acc[etapaId] = (acc[etapaId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Combinar dados
      const stats: EtapaStats[] = etapas.map((etapa) => ({
        etapa_id: etapa.id,
        etapa_nome: etapa.nome,
        ordem: etapa.ordem,
        total_contatos: contatosPorEtapa[etapa.id] || 0,
      }));

      const totalContatos = contatos.length;

      return { stats, totalContatos };
    },
    enabled: !!empresaId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Funil de Vendas
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const { stats = [], totalContatos = 0 } = funnelData || {};

  // Preparar dados para o gráfico de barras
  const chartData = stats.map((stat) => ({
    etapa: stat.etapa_nome,
    contatos: stat.total_contatos,
  }));

  // Cores do gradiente
  const COLORS = [
    'hsl(var(--primary))',
    'hsl(262 83% 48%)',
    'hsl(262 83% 40%)',
    'hsl(262 83% 32%)',
    'hsl(262 83% 24%)',
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Funil de Vendas
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {totalContatos} contato{totalContatos !== 1 ? "s" : ""} ativo{totalContatos !== 1 ? "s" : ""}
        </p>
      </CardHeader>
      <CardContent>
        {stats.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            Nenhuma etapa configurada
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(stats.length * 80, 300)}>
            <BarChart 
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--foreground))" />
              <YAxis 
                dataKey="etapa" 
                type="category" 
                stroke="hsl(var(--foreground))"
                width={150}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Bar dataKey="contatos" radius={[0, 8, 8, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
