import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, User, Package, ShoppingCart, MessageSquare, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface CustomerActivityWidgetProps {
  empresaId: string;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

export function CustomerActivityWidget({ empresaId, isMinimized, onToggleMinimize }: CustomerActivityWidgetProps) {
  const [selectedClienteId, setSelectedClienteId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Buscar clientes
  const { data: clientes } = useQuery({
    queryKey: ["clientes", empresaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pessoas")
        .select("id, nome")
        .eq("empresa_id", empresaId)
        .order("nome");

      if (error) throw error;
      return data;
    },
  });

  // Buscar contatos do cliente
  const { data: contatos } = useQuery({
    queryKey: ["contatos-cliente", selectedClienteId, startDate, endDate],
    queryFn: async () => {
      if (!selectedClienteId) return [];

      let query = supabase
        .from("contatos")
        .select(`
          *,
          etapas!contatos_etapa_fk(nome)
        `)
        .eq("pessoa_id", selectedClienteId)
        .order("created_at", { ascending: false });

      if (startDate) {
        query = query.gte("created_at", startDate);
      }
      if (endDate) {
        query = query.lte("created_at", endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!selectedClienteId,
  });

  // Buscar mensagens do cliente
  const { data: mensagens } = useQuery({
    queryKey: ["mensagens-cliente", selectedClienteId, startDate, endDate],
    queryFn: async () => {
      if (!selectedClienteId || !contatos || contatos.length === 0) return [];

      const contatoIds = contatos.map(c => c.id);

      let query = supabase
        .from("mensagens")
        .select("*")
        .in("contato_id", contatoIds)
        .order("created_at", { ascending: false });

      if (startDate) {
        query = query.gte("created_at", startDate);
      }
      if (endDate) {
        query = query.lte("created_at", endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!selectedClienteId && !!contatos && contatos.length > 0,
  });

  // Buscar pedidos do cliente
  const { data: pedidos } = useQuery({
    queryKey: ["pedidos-cliente", selectedClienteId, startDate, endDate],
    queryFn: async () => {
      if (!selectedClienteId) return [];

      let query = supabase
        .from("pedidos")
        .select(`
          *,
          pedido_itens(
            *,
            produtos(descricao, preco1)
          ),
          pessoa_enderecos(endereco, cidade),
          empresa_tipos_entrega(
            tipos_entrega(nome)
          )
        `)
        .eq("pessoa_id", selectedClienteId)
        .order("created_at", { ascending: false });

      if (startDate) {
        query = query.gte("created_at", startDate);
      }
      if (endDate) {
        query = query.lte("created_at", endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!selectedClienteId,
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: "Pendente", variant: "secondary" as const },
      processing: { label: "Em Processamento", variant: "default" as const },
      completed: { label: "Finalizado", variant: "default" as const },
      cancelled: { label: "Cancelado", variant: "destructive" as const },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: "secondary" as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const totalProdutosComprados = pedidos?.reduce((acc, pedido) => {
    if (pedido.status === "completed") {
      return acc + (pedido.pedido_itens?.length || 0);
    }
    return acc;
  }, 0) || 0;

  const valorTotalGasto = pedidos?.reduce((acc, pedido) => {
    if (pedido.status === "completed") {
      return acc + (Number(pedido.total) || 0);
    }
    return acc;
  }, 0) || 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Atividades do Cliente</CardTitle>
          <CardDescription>Histórico completo de interações e transações</CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleMinimize}
        >
          {isMinimized ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </Button>
      </CardHeader>
      
      {!isMinimized && (
        <CardContent>
          <div className="space-y-6">
            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Cliente</label>
                <Select value={selectedClienteId} onValueChange={setSelectedClienteId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes?.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Data Inicial</label>
                <input
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Data Final</label>
                <input
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {selectedClienteId && (
              <>
                {/* Resumo */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Conversas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{contatos?.length || 0}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        Pedidos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{pedidos?.length || 0}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Produtos Comprados
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{totalProdutosComprados}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Total Gasto
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {valorTotalGasto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                {/* Timeline de Atividades */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Timeline de Atividades</h3>
                  
                  {/* Pedidos */}
                  {pedidos && pedidos.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        Pedidos
                      </h4>
                      {pedidos.map((pedido) => (
                        <Card key={pedido.id}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-base">
                                  Pedido #{pedido.numero}
                                </CardTitle>
                                <CardDescription>
                                  {format(new Date(pedido.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                </CardDescription>
                              </div>
                              {getStatusBadge(pedido.status)}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="text-sm">
                                <span className="font-medium">Total:</span>{" "}
                                {Number(pedido.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </div>
                              {pedido.pedido_itens && pedido.pedido_itens.length > 0 && (
                                <div>
                                  <div className="text-sm font-medium mb-1">Produtos:</div>
                                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                                    {pedido.pedido_itens.map((item: any) => (
                                      <li key={item.id}>
                                        • {item.produtos?.descricao} - Qtd: {item.quantidade} - {" "}
                                        {Number(item.valor_total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Conversas */}
                  {contatos && contatos.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Conversas
                      </h4>
                      {contatos.map((contato) => (
                        <Card key={contato.id}>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base">
                              Conversa - {contato.etapas?.nome}
                            </CardTitle>
                            <CardDescription>
                              {format(new Date(contato.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="text-sm">
                              <span className="font-medium">WhatsApp:</span> {contato.whatsapp_from}
                            </div>
                            {contato.ultima_interacao && (
                              <div className="text-sm text-muted-foreground">
                                Última interação: {format(new Date(contato.ultima_interacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {(!pedidos || pedidos.length === 0) && (!contatos || contatos.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhuma atividade encontrada para o período selecionado
                    </div>
                  )}
                </div>
              </>
            )}

            {!selectedClienteId && (
              <div className="text-center py-8 text-muted-foreground">
                Selecione um cliente para visualizar as atividades
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}