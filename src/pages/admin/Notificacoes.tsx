import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Notificacoes() {
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
            <p className="text-muted-foreground">
              Funcionalidade de notificações em desenvolvimento
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
