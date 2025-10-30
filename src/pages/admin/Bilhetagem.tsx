import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function Bilhetagem() {
  const queryClient = useQueryClient();

  const [formValues, setFormValues] = useState({
    nome: "",
    valor_recorrente: "",
    qtd_pedidos: "",
    valor_pedido_adicional: "",
  });

  const { data: planos, isLoading } = useQuery({
    queryKey: ["planos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("planos").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const createPlanoMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { error } = await supabase.from("planos").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planos"] });
      toast.success("Plano criado com sucesso!");
      setFormValues({ nome: "", valor_recorrente: "", qtd_pedidos: "", valor_pedido_adicional: "" });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao criar plano"),
  });

  const deletePlanoMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("planos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planos"] });
      toast.success("Plano excluído com sucesso!");
    },
    onError: (err: any) => toast.error(err.message || "Erro ao excluir plano"),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = {
      nome: formValues.nome.trim(),
      valor_recorrente: Number(formValues.valor_recorrente || 0),
      qtd_pedidos: Number(formValues.qtd_pedidos || 0),
      valor_pedido_adicional: Number(formValues.valor_pedido_adicional || 0),
    };

    if (!payload.nome) {
      toast.error("Informe o nome do pacote");
      return;
    }
    if (payload.valor_recorrente < 0 || payload.valor_pedido_adicional < 0) {
      toast.error("Valores não podem ser negativos");
      return;
    }
    if (payload.qtd_pedidos < 0) {
      toast.error("Quantidade de pedidos inválida");
      return;
    }

    createPlanoMutation.mutate(payload);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bilhetagem</h1>
          <p className="text-muted-foreground">Configure os planos de assinatura</p>
        </div>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Criar novo plano</CardTitle>
            <CardDescription>Defina os limites e valores</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="nome">Nome</label>
                <Input
                  id="nome"
                  placeholder="Ex.: Starter, Pro, Enterprise"
                  value={formValues.nome}
                  onChange={(e) => setFormValues((s) => ({ ...s, nome: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="valor_recorrente">Valor (R$)</label>
                <Input
                  id="valor_recorrente"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formValues.valor_recorrente}
                  onChange={(e) => setFormValues((s) => ({ ...s, valor_recorrente: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="qtd_pedidos">Quantidade de pedidos</label>
                <Input
                  id="qtd_pedidos"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="0"
                  value={formValues.qtd_pedidos}
                  onChange={(e) => setFormValues((s) => ({ ...s, qtd_pedidos: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="valor_pedido_adicional">Valor pedido adicional (R$)</label>
                <Input
                  id="valor_pedido_adicional"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formValues.valor_pedido_adicional}
                  onChange={(e) => setFormValues((s) => ({ ...s, valor_pedido_adicional: e.target.value }))}
                />
              </div>

              <div className="md:col-span-4 flex justify-end">
                <Button type="submit" disabled={createPlanoMutation.isPending}>
                  {createPlanoMutation.isPending ? "Salvando..." : "Salvar plano"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Planos cadastrados</CardTitle>
            <CardDescription>Gerencie os planos disponíveis</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : planos && planos.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Qtd. Pedidos</TableHead>
                    <TableHead>Valor Pedido Adicional</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {planos.map((plano: any) => (
                    <TableRow key={plano.id}>
                      <TableCell className="font-medium">{plano.nome}</TableCell>
                      <TableCell>R$ {Number(plano.valor_recorrente || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>{plano.qtd_pedidos}</TableCell>
                      <TableCell>R$ {Number(plano.valor_pedido_adicional || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm("Excluir este plano?")) deletePlanoMutation.mutate(plano.id);
                          }}
                        >
                          Excluir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-8 text-center text-muted-foreground">Nenhum plano cadastrado</div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}


