import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Settings, Mail } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";

export default function ConfiguracaoPlataforma() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [smtpFromEmail, setSmtpFromEmail] = useState("");
  const [smtpFromName, setSmtpFromName] = useState("");
  const [smtpUseTls, setSmtpUseTls] = useState(true);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Fetch platform config
  const { data: config, isLoading } = useQuery({
    queryKey: ["platform-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_config")
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Populate form when data is loaded
  useEffect(() => {
    if (config) {
      setSmtpHost(config.smtp_host || "");
      setSmtpPort(config.smtp_port || 587);
      setSmtpUser(config.smtp_user || "");
      setSmtpPassword(config.smtp_password || "");
      setSmtpFromEmail(config.smtp_from_email || "");
      setSmtpFromName(config.smtp_from_name || "");
      setSmtpUseTls(config.smtp_use_tls ?? true);
    }
  }, [config]);

  // Update mutation
  const updateConfigMutation = useMutation({
    mutationFn: async (updates: any) => {
      const { error } = await supabase
        .from("platform_config")
        .update(updates)
        .eq("id", config?.id || "00000000-0000-0000-0000-000000000001");

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform-config"] });
      toast({
        title: "Sucesso",
        description: "Configurações atualizadas com sucesso!",
      });
    },
    onError: (error: any) => {
      console.error("Error updating config:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar configurações. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateConfigMutation.mutate({
      smtp_host: smtpHost,
      smtp_port: smtpPort,
      smtp_user: smtpUser,
      smtp_password: smtpPassword,
      smtp_from_email: smtpFromEmail,
      smtp_from_name: smtpFromName,
      smtp_use_tls: smtpUseTls,
    });
  };

  const handleTestEmail = async () => {
    if (!profile?.email) {
      toast({
        title: "Erro",
        description: "Email do usuário não encontrado",
        variant: "destructive",
      });
      return;
    }

    setIsSendingTest(true);
    setShowTestDialog(false);

    try {
      const response = await supabase.functions.invoke('test-smtp', {
        body: { toEmail: profile.email },
      });

      if (response.error) {
        throw response.error;
      }

      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro ao enviar email de teste');
      }

      toast({
        title: "Sucesso!",
        description: `Email de teste enviado para ${profile.email}. Verifique sua caixa de entrada.`,
      });
    } catch (error: any) {
      console.error('Erro ao testar SMTP:', error);
      toast({
        title: "Erro ao enviar teste",
        description: error.message || "Não foi possível enviar o email de teste. Verifique as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Configurações da Plataforma</h1>
            <p className="text-muted-foreground">
              Gerencie as configurações globais do sistema
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Servidor SMTP</CardTitle>
            <CardDescription>
              Configure o servidor SMTP para envio de emails do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp_host">Host SMTP</Label>
                  <Input
                    id="smtp_host"
                    placeholder="smtp.exemplo.com"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp_port">Porta</Label>
                  <Input
                    id="smtp_port"
                    type="number"
                    placeholder="587"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp_user">Usuário</Label>
                  <Input
                    id="smtp_user"
                    placeholder="usuario@exemplo.com"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp_password">Senha</Label>
                  <Input
                    id="smtp_password"
                    type="password"
                    placeholder="********"
                    value={smtpPassword}
                    onChange={(e) => setSmtpPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp_from_email">Email Remetente</Label>
                  <Input
                    id="smtp_from_email"
                    type="email"
                    placeholder="noreply@exemplo.com"
                    value={smtpFromEmail}
                    onChange={(e) => setSmtpFromEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp_from_name">Nome Remetente</Label>
                  <Input
                    id="smtp_from_name"
                    placeholder="Flum.ia"
                    value={smtpFromName}
                    onChange={(e) => setSmtpFromName(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="smtp_use_tls"
                  checked={smtpUseTls}
                  onCheckedChange={setSmtpUseTls}
                />
                <Label htmlFor="smtp_use_tls">Usar TLS/SSL</Label>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={updateConfigMutation.isPending}
                >
                  {updateConfigMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Salvar Configurações
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowTestDialog(true)}
                  disabled={isSendingTest || !smtpHost || !smtpUser || !smtpPassword}
                >
                  {isSendingTest ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Testar Configuração
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <AlertDialog open={showTestDialog} onOpenChange={setShowTestDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Testar Configuração SMTP?</AlertDialogTitle>
              <AlertDialogDescription>
                Um email de teste será enviado para <strong>{profile?.email}</strong> usando as configurações SMTP atuais.
                <br /><br />
                Certifique-se de que as configurações estão salvas antes de testar.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleTestEmail}>
                Enviar Teste
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
