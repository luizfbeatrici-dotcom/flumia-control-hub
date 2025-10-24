import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Building2, Mail, User } from "lucide-react";

export default function Configuracoes() {
  const { profile, roles } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Informações da sua conta e empresa
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações do Usuário
              </CardTitle>
              <CardDescription>Seus dados pessoais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nome</label>
                <p className="text-base">{profile?.nome}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="text-base">{profile?.email}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Perfis de Acesso</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {roles.map((role) => (
                    <Badge key={role} variant="secondary">
                      {role === "admin_master" && "Admin Master"}
                      {role === "company_admin" && "Administrador da Empresa"}
                      {role === "company_user" && "Usuário da Empresa"}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-2">
                  <Badge variant={profile?.ativo ? "default" : "secondary"}>
                    {profile?.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informações da Empresa
              </CardTitle>
              <CardDescription>Dados da sua empresa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">ID da Empresa</label>
                <p className="text-base font-mono text-sm">{profile?.empresa_id}</p>
              </div>
              <div className="rounded-lg border border-muted bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  Para mais configurações da empresa, entre em contato com o administrador do sistema.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
