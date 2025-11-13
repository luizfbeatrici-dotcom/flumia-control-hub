import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function Notificacoes() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .order('tipo');

      if (error) throw error;
      return data;
    },
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { error } = await supabase
        .from('notification_settings')
        .update({ ativo })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
      toast({
        title: "Configuração atualizada",
        description: "As configurações de notificação foram atualizadas com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar configuração:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a configuração.",
        variant: "destructive",
      });
    },
  });

  const handleToggle = (id: string, currentValue: boolean) => {
    updateSettingMutation.mutate({ id, ativo: !currentValue });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center p-8">
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
            <CardDescription>
              Ative ou desative as notificações que serão enviadas para as empresas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {settings?.map((setting) => (
              <div
                key={setting.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <Label htmlFor={setting.id} className="text-base font-semibold cursor-pointer">
                    {setting.titulo}
                  </Label>
                  {setting.descricao && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {setting.descricao}
                    </p>
                  )}
                </div>
                <Switch
                  id={setting.id}
                  checked={setting.ativo}
                  onCheckedChange={() => handleToggle(setting.id, setting.ativo)}
                  disabled={updateSettingMutation.isPending}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
