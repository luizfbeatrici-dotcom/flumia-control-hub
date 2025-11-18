import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

interface SalesFunnelWidgetProps {
  empresaId: string;
}

interface Contato {
  id: string;
  name: string | null;
  wa_id: string;
  status: string | null;
  ultima_interacao: string | null;
  etapa_id: string;
}

interface Etapa {
  id: string;
  nome: string;
  ordem: number;
  contatos: Contato[];
}

export function SalesFunnelWidget({ empresaId }: SalesFunnelWidgetProps) {
  const { data: etapas, isLoading } = useQuery({
    queryKey: ["kanban-etapas", empresaId],
    queryFn: async () => {
      // Buscar todas as etapas ativas ordenadas
      const { data: etapasData, error: etapasError } = await supabase
        .from("etapas")
        .select("id, nome, ordem")
        .eq("ativo", true)
        .order("ordem") as any;

      if (etapasError) throw etapasError;

      // Buscar contatos ativos da empresa
      const { data: contatos, error: contatosError } = await supabase
        .from("contatos")
        .select("id, name, wa_id, status, ultima_interacao, etapa_id")
        .eq("empresa_id", empresaId)
        .eq("status", "active")
        .order("ultima_interacao", { ascending: false }) as any;

      if (contatosError) throw contatosError;

      // Agrupar contatos por etapa
      const contatosPorEtapa = contatos.reduce((acc: Record<string, Contato[]>, contato: Contato) => {
        if (!acc[contato.etapa_id]) {
          acc[contato.etapa_id] = [];
        }
        acc[contato.etapa_id].push(contato);
        return acc;
      }, {});

      // Combinar etapas com contatos
      const etapasComContatos: Etapa[] = etapasData.map((etapa: any) => ({
        id: etapa.id,
        nome: etapa.nome,
        ordem: etapa.ordem,
        contatos: contatosPorEtapa[etapa.id] || [],
      }));

      return etapasComContatos;
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

  const totalContatos = etapas?.reduce((acc, etapa) => acc + etapa.contatos.length, 0) || 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Funil de Vendas - {totalContatos} conversa(s) ativa(s)
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {!etapas || etapas.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhuma etapa disponível
          </p>
        ) : (
          <ScrollArea className="w-full">
            <div className="flex gap-4 pb-4" style={{ minWidth: `${etapas.length * 320}px` }}>
              {etapas.map((etapa) => (
                <div
                  key={etapa.id}
                  className="flex-shrink-0 w-80 rounded-lg border bg-card"
                >
                  <div className="p-4 border-b bg-muted/50">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{etapa.nome}</h3>
                      <Badge variant="secondary">{etapa.contatos.length}</Badge>
                    </div>
                  </div>
                  <ScrollArea className="h-[500px]">
                    <div className="p-3 space-y-3">
                      {etapa.contatos.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground py-8">
                          Nenhuma conversa
                        </p>
                      ) : (
                        etapa.contatos.map((contato) => (
                          <Card key={contato.id} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-medium text-sm line-clamp-1">
                                  {contato.name || contato.wa_id}
                                </p>
                                <Badge
                                  variant={contato.status === 'active' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {contato.status || 'N/A'}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                WhatsApp: {contato.wa_id}
                              </p>
                              {contato.ultima_interacao && (
                                <p className="text-xs text-muted-foreground">
                                  Última interação: {format(new Date(contato.ultima_interacao), 'dd/MM/yyyy HH:mm')}
                                </p>
                              )}
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
