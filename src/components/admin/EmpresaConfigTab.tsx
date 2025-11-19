import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save } from "lucide-react";

interface EmpresaConfigTabProps {
  empresaId: string;
}

export function EmpresaConfigTab({ empresaId }: EmpresaConfigTabProps) {
  const queryClient = useQueryClient();
  const [mensagemInicial, setMensagemInicial] = useState("");
  const [mensagemNaoCliente, setMensagemNaoCliente] = useState("");

  const { isLoading } = useQuery({
    queryKey: ["empresa-config", empresaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("empresa_config")
        .select("*")
        .eq("empresa_id", empresaId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setMensagemInicial(data.mensagem_inicial || "");
        setMensagemNaoCliente(data.mensagem_nao_cliente || "");
      }

      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { data: existing } = await supabase
        .from("empresa_config")
        .select("id")
        .eq("empresa_id", empresaId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("empresa_config")
          .update({
            mensagem_inicial: mensagemInicial,
            mensagem_nao_cliente: mensagemNaoCliente,
          })
          .eq("empresa_id", empresaId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("empresa_config").insert({
          empresa_id: empresaId,
          mensagem_inicial: mensagemInicial,
          mensagem_nao_cliente: mensagemNaoCliente,
        });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["empresa-config", empresaId] });
      toast.success("Configurações salvas com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao salvar configurações: " + error.message);
    },
  });

  const handleSave = () => {
    saveMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Mensagens do WhatsApp</CardTitle>
          <CardDescription>
            Configure as mensagens que serão enviadas aos clientes durante as conversas. Você pode usar TAGs dentro das
            mensagens para que certas informações sejam preenchidas automaticamente quando forem enviadas ao cliente.
            TAGs Disponíveis: [NOME] → Será substituído pelo primeiro nome do cliente no momento da resposta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="mensagem-inicial">Mensagem Inicial</Label>
            <Textarea
              id="mensagem-inicial"
              placeholder="Digite a mensagem inicial que será enviada ao cliente..."
              value={mensagemInicial}
              onChange={(e) => setMensagemInicial(e.target.value)}
              rows={4}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Esta mensagem será enviada quando um novo contato iniciar uma conversa
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mensagem-nao-cliente">Mensagem para Não Cliente</Label>
            <Textarea
              id="mensagem-nao-cliente"
              placeholder="Digite a mensagem que será enviada para quem não é cliente..."
              value={mensagemNaoCliente}
              onChange={(e) => setMensagemNaoCliente(e.target.value)}
              rows={4}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Esta mensagem será enviada para contatos que não estão cadastrados como clientes
            </p>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saveMutation.isPending || isLoading}>
              <Save className="mr-2 h-4 w-4" />
              Salvar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
