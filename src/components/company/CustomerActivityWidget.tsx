import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Package, ShoppingCart, MessageSquare, Calendar, Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CustomerActivityWidgetProps {
  empresaId: string;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

export function CustomerActivityWidget({ empresaId, isMinimized, onToggleMinimize }: CustomerActivityWidgetProps) {
  const [selectedClienteId, setSelectedClienteId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedPedido, setSelectedPedido] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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

  // Buscar pedidos do cliente com contatos
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
          ),
          contatos(
            id,
            whatsapp_from,
            created_at,
            ultima_interacao,
            etapas!contatos_etapa_fk(nome)
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

  const togglePedido = (pedido: any) => {
    setSelectedPedido(pedido);
    setDialogOpen(true);
  };

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

                {/* Lista de Pedidos */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Pedidos do Cliente</h3>
                  
                  {pedidos && pedidos.length > 0 ? (
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Pedido</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Situação</TableHead>
                            <TableHead>Etapa</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead className="w-[100px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pedidos.map((pedido) => (
                            <TableRow key={pedido.id}>
                              <TableCell className="font-medium">#{pedido.numero}</TableCell>
                              <TableCell>
                                {format(new Date(pedido.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                              </TableCell>
                              <TableCell>{getStatusBadge(pedido.status)}</TableCell>
                              <TableCell>
                                {pedido.contatos?.etapas?.nome || "-"}
                              </TableCell>
                              <TableCell>
                                {Number(pedido.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </TableCell>
                              <TableCell>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => togglePedido(pedido)}
                                >
                                  <Info className="h-4 w-4 mr-1" />
                                  Detalhes
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground border rounded-lg">
                      Nenhum pedido encontrado para o período selecionado
                    </div>
                  )}
                </div>

                {/* Dialog de Detalhes do Pedido */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    {selectedPedido && (
                      <>
                        <DialogHeader>
                          <DialogTitle className="flex items-center justify-between">
                            <span>Pedido #{selectedPedido.numero}</span>
                            {getStatusBadge(selectedPedido.status)}
                          </DialogTitle>
                          <DialogDescription>
                            {format(new Date(selectedPedido.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 mt-4">
                          {/* Produtos */}
                          {selectedPedido.pedido_itens && selectedPedido.pedido_itens.length > 0 && (
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                  <Package className="h-4 w-4" />
                                  Produtos
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                {selectedPedido.pedido_itens.map((item: any) => (
                                  <div key={item.id} className="flex justify-between text-sm pb-2 border-b last:border-0">
                                    <span className="font-medium">{item.produtos?.descricao}</span>
                                    <span className="text-muted-foreground">
                                      Qtd: {item.quantidade} × {Number(item.valor_unitario).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} = {" "}
                                      <span className="font-medium text-foreground">
                                        {Number(item.valor_total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                      </span>
                                    </span>
                                  </div>
                                ))}
                                <div className="flex justify-between font-bold text-base pt-2">
                                  <span>Total</span>
                                  <span>{Number(selectedPedido.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Informações da Conversa */}
                          {selectedPedido.contatos && (
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                  <MessageSquare className="h-4 w-4" />
                                  Conversa
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-2 text-sm">
                                <div>
                                  <span className="font-medium">WhatsApp:</span> {selectedPedido.contatos.whatsapp_from}
                                </div>
                                <div>
                                  <span className="font-medium">Etapa:</span> {selectedPedido.contatos.etapas?.nome || "-"}
                                </div>
                                {selectedPedido.contatos.ultima_interacao && (
                                  <div>
                                    <span className="font-medium">Última interação:</span>{" "}
                                    {format(new Date(selectedPedido.contatos.ultima_interacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )}

                          {/* Informações de Entrega */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedPedido.pessoa_enderecos && (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-base">Endereço de Entrega</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm">
                                  <div>{selectedPedido.pessoa_enderecos.endereco}</div>
                                  <div>{selectedPedido.pessoa_enderecos.cidade}</div>
                                </CardContent>
                              </Card>
                            )}
                            
                            {selectedPedido.empresa_tipos_entrega && (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-base">Tipo de Entrega</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm">
                                  <div>{selectedPedido.empresa_tipos_entrega.tipos_entrega?.nome}</div>
                                  {selectedPedido.vlr_frete > 0 && (
                                    <div className="text-muted-foreground">
                                      Frete: {Number(selectedPedido.vlr_frete).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            )}
                          </div>

                          {selectedPedido.observacoes && (
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-base">Observações</CardTitle>
                              </CardHeader>
                              <CardContent className="text-sm">
                                {selectedPedido.observacoes}
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      </>
                    )}
                  </DialogContent>
                </Dialog>
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