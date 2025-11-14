import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, ChevronDown, ChevronUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedEtapa, setSelectedEtapa] = useState<string | null>(null);

  const { data: funnelData, isLoading } = useQuery({
    queryKey: ["sales-funnel", empresaId],
    queryFn: async () => {
      // Buscar todas as etapas ativas da empresa
      const { data: etapas, error: etapasError } = await supabase
        .from("etapas")
        .select("id, nome, ordem")
        .eq("ativo", true)
        .order("ordem") as any;

      if (etapasError) throw etapasError;

      // Buscar pedidos não cancelados com suas etapas
      const { data: pedidos, error: pedidosError } = await supabase
        .from("pedidos")
        .select("id, contato_id, contatos!inner(etapa_id)")
        .eq("empresa_id", empresaId)
        .neq("status", "cancelled");

      if (pedidosError) throw pedidosError;

      // Agrupar pedidos por etapa
      const pedidosPorEtapa = pedidos.reduce((acc, pedido: any) => {
        const etapaId = pedido.contatos?.etapa_id;
        if (etapaId) {
          acc[etapaId] = (acc[etapaId] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      // Combinar dados
      const stats: EtapaStats[] = etapas.map((etapa) => ({
        etapa_id: etapa.id,
        etapa_nome: etapa.nome,
        ordem: etapa.ordem,
        total_contatos: pedidosPorEtapa[etapa.id] || 0,
      }));

      const totalContatos = pedidos.length;

      return { stats, totalContatos };
    },
    enabled: !!empresaId,
  });

  // Query para buscar pedidos de uma etapa específica
  const { data: contatosEtapa } = useQuery({
    queryKey: ["pedidos-etapa", selectedEtapa, empresaId],
    queryFn: async () => {
      if (!selectedEtapa) return [];

      const { data, error } = await supabase
        .from("pedidos")
        .select("id, numero, total, created_at, contatos!inner(id, name, wa_id, status)")
        .eq("empresa_id", empresaId)
        .eq("contatos.etapa_id", selectedEtapa)
        .neq("status", "cancelled")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!selectedEtapa,
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
  const etapaSelecionada = stats.find(s => s.etapa_id === selectedEtapa);

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
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Funil de Vendas
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {totalContatos} contato{totalContatos !== 1 ? "s" : ""} ativo{totalContatos !== 1 ? "s" : ""}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Recolher
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Expandir
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        {isExpanded && (
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
                  <Bar 
                    dataKey="contatos" 
                    radius={[0, 8, 8, 0]}
                    onClick={(data) => {
                      const etapa = stats.find(s => s.etapa_nome === data.etapa);
                      if (etapa) {
                        setSelectedEtapa(etapa.etapa_id);
                      }
                    }}
                    cursor="pointer"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        )}
      </Card>

      <Dialog open={!!selectedEtapa} onOpenChange={() => setSelectedEtapa(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Contatos - {etapaSelecionada?.etapa_nome}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {contatosEtapa?.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                Nenhum contato nesta etapa
              </p>
            ) : (
              contatosEtapa?.map((pedido: any) => (
                <div
                  key={pedido.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">
                      Pedido #{pedido.numero} - {pedido.contatos?.name || "Sem nome"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total: R$ {Number(pedido.total || 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Criado em: {new Date(pedido.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
