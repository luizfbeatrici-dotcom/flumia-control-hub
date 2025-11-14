import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function Configuracoes() {
  const queryClient = useQueryClient();
  const [whatsappContato, setWhatsappContato] = useState("");
  const [nomeAssistente, setNomeAssistente] = useState("");
  const [mensagemInicial, setMensagemInicial] = useState("");

  // Fetch system settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["system-settings"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("system_settings")
        .select("*")
        .single();

      if (error) throw error;
      return data as any;
    },
  });

  useEffect(() => {
    if (settings) {
      setWhatsappContato(settings.whatsapp_contato || "");
      setNomeAssistente(settings.nome_assistente || "Assistente flum.ia");
      setMensagemInicial(settings.mensagem_inicial || "Olá! Como posso ajudar você hoje?");
    }
  }, [settings]);

  // Update system settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any)
        .from("system_settings")
        .update({ 
          whatsapp_contato: whatsappContato,
          nome_assistente: nomeAssistente,
          mensagem_inicial: mensagemInicial
        })
        .eq("id", settings?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
      toast.success("Configurações atualizadas com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar configurações:", error);
      toast.error("Erro ao atualizar configurações");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div>Carregando...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">Configure as opções do sistema</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Assistente Virtual WhatsApp</CardTitle>
            <CardDescription>
              Configure as informações da assistente virtual que aparecerá na página inicial
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="whatsapp">Número do WhatsApp</Label>
                <Input
                  id="whatsapp"
                  type="text"
                  placeholder="5511999999999"
                  value={whatsappContato}
                  onChange={(e) => setWhatsappContato(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Digite o número no formato: código do país + DDD + número (ex: 5511999999999)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nomeAssistente">Nome da Assistente</Label>
                <Input
                  id="nomeAssistente"
                  type="text"
                  placeholder="Assistente flum.ia"
                  value={nomeAssistente}
                  onChange={(e) => setNomeAssistente(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Nome que será exibido no card de conversa
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mensagemInicial">Mensagem Inicial</Label>
                <Textarea
                  id="mensagemInicial"
                  placeholder="Olá! Como posso ajudar você hoje?"
                  value={mensagemInicial}
                  onChange={(e) => setMensagemInicial(e.target.value)}
                  rows={3}
                />
                <p className="text-sm text-muted-foreground">
                  Mensagem que será exibida no card e enviada ao iniciar a conversa no WhatsApp
                </p>
              </div>

              <Button type="submit" disabled={updateSettingsMutation.isPending}>
                {updateSettingsMutation.isPending ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
