import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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
  const [selectedContato, setSelectedContato] = useState<string | null>(null);
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
        .in("status", ["active", "ativo"])
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

  // Query para buscar detalhes do contato selecionado e suas mensagens
  const { data: contatoDetalhes } = useQuery({
    queryKey: ["contato-detalhes", selectedContato],
    queryFn: async () => {
      if (!selectedContato) return null;

      // Buscar dados do contato com pessoa relacionada
      const { data: contato, error: contatoError } = await supabase
        .from("contatos")
        .select("*, pessoas(*), etapas!contatos_etapa_fk(*)")
        .eq("id", selectedContato)
        .single() as any;

      if (contatoError) throw contatoError;

      // Buscar mensagens do contato
      const { data: mensagens, error: mensagensError } = await supabase
        .from("mensagens")
        .select("*")
        .eq("contato_id", selectedContato)
        .order("created_at", { ascending: true }) as any;

      if (mensagensError) throw mensagensError;

      return {
        contato,
        mensagens: mensagens || []
      };
    },
    enabled: !!selectedContato,
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
                          <Card 
                            key={contato.id} 
                            className="p-3 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => setSelectedContato(contato.id)}
                          >
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

      {/* Dialog com detalhes do contato */}
      <Dialog open={!!selectedContato} onOpenChange={() => setSelectedContato(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Detalhes da Conversa
            </DialogTitle>
          </DialogHeader>
          
          {contatoDetalhes && (
            <div className="space-y-4">
              {/* Informações do Contato */}
              <Card className="p-4 bg-muted/50">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <p className="font-medium">
                      {contatoDetalhes.contato.name || contatoDetalhes.contato.wa_id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">WhatsApp</p>
                    <p className="font-medium">{contatoDetalhes.contato.wa_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={contatoDetalhes.contato.status === 'ativo' ? 'default' : 'secondary'}>
                      {contatoDetalhes.contato.status || 'N/A'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Etapa</p>
                    <p className="font-medium">{contatoDetalhes.contato.etapas?.nome || 'N/A'}</p>
                  </div>
                  {contatoDetalhes.contato.ultima_interacao && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Última Interação</p>
                      <p className="font-medium">
                        {format(new Date(contatoDetalhes.contato.ultima_interacao), 'dd/MM/yyyy HH:mm')}
                      </p>
                    </div>
                  )}
                  {contatoDetalhes.contato.pessoas && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Cliente</p>
                        <p className="font-medium">{contatoDetalhes.contato.pessoas.nome}</p>
                      </div>
                      {contatoDetalhes.contato.pessoas.celular && (
                        <div>
                          <p className="text-sm text-muted-foreground">Celular</p>
                          <p className="font-medium">{contatoDetalhes.contato.pessoas.celular}</p>
                        </div>
                      )}
                      {contatoDetalhes.contato.pessoas.email && (
                        <div className="col-span-2">
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{contatoDetalhes.contato.pessoas.email}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </Card>

              <Separator />

              {/* Histórico de Mensagens */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">
                    Histórico de Mensagens ({contatoDetalhes.mensagens.length})
                  </h3>
                  <Button
                    onClick={() => {
                      window.open(`https://wa.me/${contatoDetalhes.contato.wa_id}`, '_blank');
                    }}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Abrir no WhatsApp
                  </Button>
                </div>
                
                <ScrollArea className="h-[400px] rounded-lg border p-4">
                  {contatoDetalhes.mensagens.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhuma mensagem registrada
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {contatoDetalhes.mensagens.map((msg: any) => (
                        <div 
                          key={msg.id} 
                          className={`flex ${msg.message_type === 'sent' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              msg.message_type === 'sent'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
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
                            <p className="text-xs mt-1 opacity-70">
                              {format(new Date(msg.created_at), 'dd/MM/yyyy HH:mm')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
