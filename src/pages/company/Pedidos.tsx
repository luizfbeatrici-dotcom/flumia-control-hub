import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Eye, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

export default function Pedidos() {
  const { profile } = useAuth();
  const [selectedPedidoId, setSelectedPedidoId] = useState<string | null>(null);

  const { data: pedidos = [], isLoading } = useQuery({
    queryKey: ["pedidos", profile?.empresa_id],
    queryFn: async () => {
      if (!profile?.empresa_id) return [];

      const { data, error } = await supabase
        .from("pedidos")
        .select(`
          *,
          pessoas (nome, cnpjf, celular, email),
          pessoa_enderecos (endereco, bairro, cidade, cep, complemento),
          pagamentos (status, date_approved, date_last_updated, date_created)
        `)
        .eq("empresa_id", profile.empresa_id)
        .order("numero", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.empresa_id,
  });

  const { data: pedidoDetalhes } = useQuery({
    queryKey: ["pedido-detalhes", selectedPedidoId],
    queryFn: async () => {
      if (!selectedPedidoId) return null;

      const { data, error } = await supabase
        .from("pedido_itens")
        .select(`
          *,
          produtos (descricao, sku, unidade)
        `)
        .eq("pedido_id", selectedPedidoId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedPedidoId,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      processing: "default",
      completed: "default",
      cancelled: "destructive",
    };
    return colors[status] || "default";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendente",
      processing: "Processando",
      completed: "Concluído",
      cancelled: "Cancelado",
    };
    return labels[status] || status;
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      approved: "default",
      cancelled: "destructive",
      rejected: "destructive",
    };
    return colors[status] || "secondary";
  };

  const getPaymentStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendente",
      approved: "Aprovado",
      cancelled: "Cancelado",
      rejected: "Rejeitado",
    };
    return labels[status] || status;
  };

  const selectedPedido = pedidos.find((p) => p.id === selectedPedidoId);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-muted-foreground">
            Acompanhe todos os pedidos da sua empresa
          </p>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Finalizado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : pedidos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Nenhum pedido encontrado
                  </TableCell>
                </TableRow>
              ) : (
                pedidos.map((pedido) => (
                  <TableRow key={pedido.id}>
                    <TableCell className="font-medium">
                      #{pedido.numero}
                    </TableCell>
                    <TableCell>{pedido.pessoas?.nome || "N/A"}</TableCell>
                    <TableCell>
                      {format(new Date(pedido.created_at), "dd/MM/yyyy HH:mm", {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(pedido.total)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(pedido.status)}>
                        {getStatusLabel(pedido.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {pedido.finalizado_em ? (
                        <span className="text-foreground">
                          {format(new Date(pedido.finalizado_em), "dd/MM/yyyy HH:mm", {
                            locale: ptBR,
                          })}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPedidoId(pedido.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>
                              Detalhes do Pedido #{pedido.numero}
                            </DialogTitle>
                            <DialogDescription>
                              Informações completas do pedido
                            </DialogDescription>
                          </DialogHeader>
                          <ScrollArea className="max-h-[600px] pr-4">
                            <div className="space-y-6">
                              {/* Informações do Cliente */}
                              <div>
                                <h3 className="mb-3 font-semibold">Cliente</h3>
                                <div className="grid gap-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Nome:</span>
                                    <span className="font-medium">
                                      {pedido.pessoas?.nome || "N/A"}
                                    </span>
                                  </div>
                                  {pedido.pessoas?.cnpjf && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">CPF/CNPJ:</span>
                                      <span className="font-medium">
                                        {pedido.pessoas.cnpjf}
                                      </span>
                                    </div>
                                  )}
                                  {pedido.pessoas?.celular && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Celular:</span>
                                      <span className="font-medium">
                                        {pedido.pessoas.celular}
                                      </span>
                                    </div>
                                  )}
                                  {pedido.pessoas?.email && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Email:</span>
                                      <span className="font-medium">
                                        {pedido.pessoas.email}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <Separator />

                              {/* Informações do Pedido */}
                              <div>
                                <h3 className="mb-3 font-semibold">Pedido</h3>
                                <div className="grid gap-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Data:</span>
                                    <span className="font-medium">
                                      {format(
                                        new Date(pedido.created_at),
                                        "dd/MM/yyyy 'às' HH:mm",
                                        { locale: ptBR }
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Status:</span>
                                    <Badge variant={getStatusColor(pedido.status)}>
                                      {getStatusLabel(pedido.status)}
                                    </Badge>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Total do Pedido:
                                    </span>
                                    <span className="text-lg font-bold">
                                      {formatCurrency(pedido.total)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Endereço de Entrega */}
                              {pedido.pessoa_enderecos && (
                                <>
                                  <Separator />
                                  <div>
                                    <h3 className="mb-3 font-semibold">
                                      Endereço de Entrega
                                    </h3>
                                    <div className="grid gap-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          Endereço:
                                        </span>
                                        <span className="font-medium">
                                          {pedido.pessoa_enderecos.endereco}
                                        </span>
                                      </div>
                                      {pedido.pessoa_enderecos.bairro && (
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">
                                            Bairro:
                                          </span>
                                          <span className="font-medium">
                                            {pedido.pessoa_enderecos.bairro}
                                          </span>
                                        </div>
                                      )}
                                      {pedido.pessoa_enderecos.cidade && (
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">
                                            Cidade:
                                          </span>
                                          <span className="font-medium">
                                            {pedido.pessoa_enderecos.cidade}
                                          </span>
                                        </div>
                                      )}
                                      {pedido.pessoa_enderecos.cep && (
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">CEP:</span>
                                          <span className="font-medium">
                                            {pedido.pessoa_enderecos.cep}
                                          </span>
                                        </div>
                                      )}
                                      {pedido.pessoa_enderecos.complemento && (
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">
                                            Complemento:
                                          </span>
                                          <span className="font-medium">
                                            {pedido.pessoa_enderecos.complemento}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </>
                              )}

                              {/* Informações de Pagamento */}
                              {pedido.pagamentos && pedido.pagamentos.length > 0 && (
                                <>
                                  <Separator />
                                  <div>
                                    <h3 className="mb-3 font-semibold">Pagamento</h3>
                                    <div className="grid gap-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Status:</span>
                                        <Badge variant={getPaymentStatusColor(pedido.pagamentos[0].status)}>
                                          {getPaymentStatusLabel(pedido.pagamentos[0].status)}
                                        </Badge>
                                      </div>
                                      {pedido.pagamentos[0].date_created && (
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Data de Criação:</span>
                                          <span className="font-medium">
                                            {format(
                                              new Date(pedido.pagamentos[0].date_created),
                                              "dd/MM/yyyy 'às' HH:mm",
                                              { locale: ptBR }
                                            )}
                                          </span>
                                        </div>
                                      )}
                                      {pedido.pagamentos[0].date_approved && (
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Data de Aprovação:</span>
                                          <span className="font-medium">
                                            {format(
                                              new Date(pedido.pagamentos[0].date_approved),
                                              "dd/MM/yyyy 'às' HH:mm",
                                              { locale: ptBR }
                                            )}
                                          </span>
                                        </div>
                                      )}
                                      {pedido.pagamentos[0].date_last_updated && (
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Última Atualização:</span>
                                          <span className="font-medium">
                                            {format(
                                              new Date(pedido.pagamentos[0].date_last_updated),
                                              "dd/MM/yyyy 'às' HH:mm",
                                              { locale: ptBR }
                                            )}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </>
                              )}

                              {/* Observações */}
                              {pedido.observacoes && (
                                <>
                                  <Separator />
                                  <div>
                                    <h3 className="mb-3 font-semibold">Observações</h3>
                                    <p className="text-sm text-muted-foreground">
                                      {pedido.observacoes}
                                    </p>
                                  </div>
                                </>
                              )}

                              {/* Itens do Pedido */}
                              <Separator />
                              <div>
                                <h3 className="mb-3 font-semibold">Itens do Pedido</h3>
                                {pedidoDetalhes && pedidoDetalhes.length > 0 ? (
                                  <div className="space-y-3">
                                    {pedidoDetalhes.map((item) => (
                                      <div
                                        key={item.id}
                                        className="rounded-lg border p-3"
                                      >
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <p className="font-medium">
                                              {item.produtos?.descricao || "Produto"}
                                            </p>
                                            {item.produtos?.sku && (
                                              <p className="text-xs text-muted-foreground">
                                                SKU: {item.produtos.sku}
                                              </p>
                                            )}
                                          </div>
                                          <div className="text-right">
                                            <p className="font-medium">
                                              {formatCurrency(item.valor_total)}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                                          <span>
                                            Qtd: {item.quantidade}{" "}
                                            {item.produtos?.unidade || "un"}
                                          </span>
                                          <span>
                                            Unit: {formatCurrency(item.valor_unitario)}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                    
                                    {/* Resumo Financeiro */}
                                    <div className="space-y-2 border-t pt-3">
                                      <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Subtotal (Produtos):</span>
                                        <span className="font-medium">
                                          {formatCurrency(pedidoDetalhes.reduce((sum, item) => sum + Number(item.valor_total), 0))}
                                        </span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Frete:</span>
                                        <span className="font-medium">
                                          {formatCurrency(pedido.vlr_frete || 0)}
                                        </span>
                                      </div>
                                      <Separator />
                                      <div className="flex justify-between text-lg font-bold">
                                        <span>Total:</span>
                                        <span>{formatCurrency(pedido.total)}</span>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">
                                    Nenhum item encontrado
                                  </p>
                                )}
                              </div>
                            </div>
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </DashboardLayout>
  );
}
