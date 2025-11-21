import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, XCircle, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface LostSalesWidgetProps {
  empresaId: string;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

interface Pedido {
  id: string;
  numero: number;
  total: number | null;
  created_at: string;
  status: string | null;
  contato_id: string | null;
  pessoa_id: string;
  etapa_id: string;
  contatos?: {
    id: string;
    name: string | null;
    wa_id: string;
    whatsapp_from: string;
  } | null;
  pessoas?: {
    nome: string;
    celular: string | null;
    email: string | null;
  } | null;
}

interface Etapa {
  id: string;
  nome: string;
  ordem: number;
  pedidos: Pedido[];
}

export function LostSalesWidget({ empresaId, isMinimized, onToggleMinimize }: LostSalesWidgetProps) {
  const [selectedPedido, setSelectedPedido] = useState<string | null>(null);
  const [conversaAberta, setConversaAberta] = useState(false);

  const { data: etapas, isLoading } = useQuery({
    queryKey: ["kanban-pedidos-cancelados", empresaId],
    queryFn: async () => {
      // Buscar todas as etapas ativas ordenadas
      const { data: etapasData, error: etapasError } = await supabase
        .from("etapas")
        .select("id, nome, ordem")
        .eq("ativo", true)
        .order("ordem") as any;

      if (etapasError) throw etapasError;

      // Buscar pedidos cancelados da empresa com seus contatos
      const { data: pedidos, error: pedidosError } = await supabase
        .from("pedidos")
        .select("id, numero, total, created_at, status, contato_id, pessoa_id, contatos!inner(id, name, wa_id, whatsapp_from, etapa_id), pessoas(nome, celular, email)")
        .eq("empresa_id", empresaId)
        .eq("status", "cancelled")
        .order("created_at", { ascending: false }) as any;

      if (pedidosError) throw pedidosError;

      // Agrupar pedidos por etapa
      const pedidosPorEtapa = pedidos.reduce((acc: Record<string, Pedido[]>, pedido: any) => {
        const etapaId = pedido.contatos?.etapa_id;
        if (etapaId) {
          if (!acc[etapaId]) {
            acc[etapaId] = [];
          }
          acc[etapaId].push({
            ...pedido,
            etapa_id: etapaId
          });
        }
        return acc;
      }, {});

      // Combinar etapas com pedidos
      const etapasComPedidos: Etapa[] = etapasData.map((etapa: any) => ({
        id: etapa.id,
        nome: etapa.nome,
        ordem: etapa.ordem,
        pedidos: pedidosPorEtapa[etapa.id] || [],
      }));

      return etapasComPedidos;
    },
    enabled: !!empresaId,
  });

  // Query para buscar detalhes do pedido selecionado e suas mensagens
  const { data: pedidoDetalhes } = useQuery({
    queryKey: ["pedido-cancelado-detalhes", selectedPedido],
    queryFn: async () => {
      if (!selectedPedido) return null;

      // Buscar dados do pedido completo
      const { data: pedido, error: pedidoError } = await supabase
        .from("pedidos")
        .select(`
          *, 
          contatos!inner(id, name, wa_id, whatsapp_from, etapa_id, etapas!contatos_etapa_fk(*)),
          pessoas(*),
          pedido_itens(*, produtos(descricao)),
          pessoa_enderecos(*),
          pagamentos(*)
        `)
        .eq("id", selectedPedido)
        .single() as any;

      if (pedidoError) throw pedidoError;

      // Buscar mensagens do contato relacionado
      const { data: mensagens, error: mensagensError } = await supabase
        .from("mensagens")
        .select("*")
        .eq("contato_id", pedido.contato_id)
        .order("created_at", { ascending: true }) as any;

      if (mensagensError) throw mensagensError;

      return {
        pedido,
        mensagens: mensagens || []
      };
    },
    enabled: !!selectedPedido,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            Vendas Perdidas
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const totalPedidos = etapas?.reduce((acc, etapa) => acc + etapa.pedidos.length, 0) || 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            Vendas Perdidas - {totalPedidos} pedido(s) cancelado(s)
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleMinimize}
            className="h-8 w-8 p-0"
          >
            {isMinimized ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      {!isMinimized && (
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
                        <Badge variant="destructive">{etapa.pedidos.length}</Badge>
                      </div>
                    </div>
                    <ScrollArea className="h-[500px]">
                      <div className="p-3 space-y-3">
                        {etapa.pedidos.length === 0 ? (
                          <p className="text-center text-sm text-muted-foreground py-8">
                            Nenhum pedido cancelado
                          </p>
                        ) : (
                          etapa.pedidos.map((pedido) => (
                            <Card 
                              key={pedido.id} 
                              className="p-3 hover:shadow-md transition-shadow cursor-pointer border-destructive/20"
                              onClick={() => setSelectedPedido(pedido.id)}
                            >
                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">
                                      Pedido #{pedido.numero}
                                    </p>
                                    <p className="text-xs text-muted-foreground line-clamp-1">
                                      {pedido.pessoas?.nome || pedido.contatos?.name || pedido.contatos?.wa_id}
                                    </p>
                                  </div>
                                  <Badge variant="destructive" className="text-xs">
                                    Cancelado
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-muted-foreground">
                                    {format(new Date(pedido.created_at), 'dd/MM/yyyy HH:mm')}
                                  </p>
                                  <p className="font-semibold text-sm">
                                    {new Intl.NumberFormat('pt-BR', {
                                      style: 'currency',
                                      currency: 'BRL',
                                    }).format(pedido.total || 0)}
                                  </p>
                                </div>
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
      )}

      {/* Dialog com detalhes do pedido */}
      <Dialog open={!!selectedPedido && !conversaAberta} onOpenChange={() => setSelectedPedido(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Detalhes do Pedido Cancelado
            </DialogTitle>
          </DialogHeader>
          
          {pedidoDetalhes && (
            <div className="space-y-4">
              {/* Informações do Pedido */}
              <Card className="p-4 bg-muted/50">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Número do Pedido</p>
                    <p className="font-medium text-lg">#{pedidoDetalhes.pedido.numero}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Total</p>
                    <p className="font-medium text-lg">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(pedidoDetalhes.pedido.total || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant="destructive">
                      Cancelado
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Etapa</p>
                    <p className="font-medium">{pedidoDetalhes.pedido.contatos?.etapas?.nome || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Data de Criação</p>
                    <p className="font-medium">
                      {format(new Date(pedidoDetalhes.pedido.created_at), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                  {pedidoDetalhes.pedido.pessoas && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Cliente</p>
                        <p className="font-medium">{pedidoDetalhes.pedido.pessoas.nome}</p>
                      </div>
                      {pedidoDetalhes.pedido.pessoas.celular && (
                        <div>
                          <p className="text-sm text-muted-foreground">Celular</p>
                          <p className="font-medium">{pedidoDetalhes.pedido.pessoas.celular}</p>
                        </div>
                      )}
                      {pedidoDetalhes.pedido.pessoas.email && (
                        <div className="col-span-2">
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{pedidoDetalhes.pedido.pessoas.email}</p>
                        </div>
                      )}
                    </>
                  )}
                  {pedidoDetalhes.pedido.contatos && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">WhatsApp</p>
                      <p className="font-medium">{pedidoDetalhes.pedido.contatos.wa_id}</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Botão para abrir conversa */}
              <div className="flex justify-end">
                <Button
                  onClick={() => setConversaAberta(true)}
                  className="w-full sm:w-auto"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Abrir Conversa ({pedidoDetalhes.mensagens.length} mensagens)
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog com histórico de mensagens */}
      <Dialog open={conversaAberta} onOpenChange={setConversaAberta}>
        <DialogContent className="max-w-3xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Histórico de Conversa
              {pedidoDetalhes?.pedido && ` - Pedido #${pedidoDetalhes.pedido.numero}`}
            </DialogTitle>
          </DialogHeader>
          
          {pedidoDetalhes && (
            <div className="space-y-4">
              {/* Informação do contato */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">
                    {pedidoDetalhes.pedido.pessoas?.nome || pedidoDetalhes.pedido.contatos?.name || 'Cliente'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {pedidoDetalhes.pedido.contatos?.wa_id}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (pedidoDetalhes.pedido.contatos) {
                      window.open(`https://wa.me/${pedidoDetalhes.pedido.contatos.wa_id}`, '_blank');
                    }
                  }}
                >
                  Abrir no WhatsApp
                </Button>
              </div>

              <Separator />
              
              {/* Histórico de Mensagens */}
              <ScrollArea className="h-[500px] rounded-lg border p-4">
                {pedidoDetalhes.mensagens.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma mensagem registrada
                  </p>
                ) : (
                  <div className="space-y-3">
                    {pedidoDetalhes.mensagens.map((msg: any) => {
                      const isReceived = msg.message_type === 'received';
                      return (
                        <div 
                          key={msg.id} 
                          className={`flex ${isReceived ? 'justify-start' : 'justify-end'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              isReceived
                                ? 'bg-muted text-foreground'
                                : 'bg-primary text-primary-foreground'
                            }`}
                          >
                            {msg.message_body && (
                              <p className="text-sm whitespace-pre-wrap break-words">
                                {msg.message_body}
                              </p>
                            )}
                            {msg.image_data && (
                              <p className="text-xs mt-1 opacity-70">📷 Imagem</p>
                            )}
                            {msg.audio_data && (
                              <p className="text-xs mt-1 opacity-70">🎤 Áudio</p>
                            )}
                            <p className={`text-xs mt-1 ${isReceived ? 'opacity-60' : 'opacity-90'}`}>
                              {format(new Date(msg.created_at), 'dd/MM/yyyy HH:mm')}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
