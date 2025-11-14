import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface NotificationSetting {
  id: string;
  tipo: string;
  titulo: string;
  descricao: string | null;
  ativo: boolean;
  etapa_id: string | null;
  created_at: string;
  updated_at: string;
}

interface Etapa {
  id: string;
  nome: string;
  ordem: number;
  ativo: boolean;
}

export default function Notificacoes() {
  const queryClient = useQueryClient();

  const { data: settings = [], isLoading: loadingSettings } = useQuery({
    queryKey: ["notification_settings"],
    queryFn: async (): Promise<NotificationSetting[]> => {
      // @ts-ignore
      const { data, error } = await supabase
        // @ts-ignore
        .from("notification_settings")
        .select("*")
        .order("tipo");

      if (error) throw error;
      return (data as unknown as NotificationSetting[]) || [];
    },
  });

  const { data: etapas = [] } = useQuery({
    queryKey: ["etapas"],
    queryFn: async (): Promise<Etapa[]> => {
      const { data, error } = await supabase
        .from("etapas")
        .select("id, nome, ordem, ativo")
        .eq("ativo", true)
        .order("ordem");

      if (error) throw error;
      return data || [];
    },
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<NotificationSetting> }) => {
      // @ts-ignore
      const { error } = await supabase
        // @ts-ignore
        .from("notification_settings")
        // @ts-ignore
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification_settings"] });
      toast.success("Configuração atualizada com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar configuração");
      console.error(error);
    },
  });

  const handleToggle = (id: string, ativo: boolean) => {
    updateSettingMutation.mutate({ id, updates: { ativo } });
  };

  const handleEtapaChange = (id: string, etapa_id: string) => {
    updateSettingMutation.mutate({ id, updates: { etapa_id } });
  };

  if (loadingSettings) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configurações de Notificações</h1>
          <p className="text-muted-foreground">
            Configure quais eventos geram notificações para as empresas
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tipos de Notificação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {settings.map((setting) => (
                <div key={setting.id} className="flex flex-col space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1">
                      <Label htmlFor={`switch-${setting.id}`} className="text-base font-medium">
                        {setting.titulo}
                      </Label>
                      {setting.descricao && (
                        <p className="text-sm text-muted-foreground">{setting.descricao}</p>
                      )}
                    </div>
                    <Switch
                      id={`switch-${setting.id}`}
                      checked={setting.ativo}
                      onCheckedChange={(checked) => handleToggle(setting.id, checked)}
                    />
                  </div>
                  
                  {setting.ativo && (
                    <div className="flex items-center gap-2 ml-0 mt-2">
                      <Label htmlFor={`etapa-${setting.id}`} className="text-sm whitespace-nowrap">
                        Vincular à etapa:
                      </Label>
                      <Select
                        value={setting.etapa_id || ""}
                        onValueChange={(value) => handleEtapaChange(setting.id, value)}
                      >
                        <SelectTrigger id={`etapa-${setting.id}`} className="w-full">
                          <SelectValue placeholder="Selecione uma etapa" />
                        </SelectTrigger>
                        <SelectContent>
                          {etapas.map((etapa) => (
                            <SelectItem key={etapa.id} value={etapa.id}>
                              {etapa.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
