import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Users, MousePointer, CheckCircle, XCircle } from "lucide-react";

const Leads = () => {
  const { data: visitors = [], isLoading } = useQuery({
    queryKey: ["landing-visitors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("landing_page_visitors")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const stats = {
    total: visitors.length,
    withConsent: visitors.filter(v => v.cookie_consent).length,
    withContact: visitors.filter(v => v.email || v.telefone).length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Leads da Landing Page</h1>
          <p className="text-muted-foreground">Visitantes e potenciais clientes</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Visitantes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aceitaram Cookies</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.withConsent}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? Math.round((stats.withConsent / stats.total) * 100) : 0}% do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Com Dados de Contato</CardTitle>
              <MousePointer className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.withContact}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? Math.round((stats.withContact / stats.total) * 100) : 0}% do total
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Visitantes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : visitors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Nenhum visitante registrado ainda</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Interesse</TableHead>
                      <TableHead>Visualizações</TableHead>
                      <TableHead>Origem</TableHead>
                      <TableHead>Cookies</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visitors.map((visitor) => (
                      <TableRow key={visitor.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(visitor.first_visit), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </TableCell>
                        <TableCell>{visitor.nome || "-"}</TableCell>
                        <TableCell>{visitor.email || "-"}</TableCell>
                        <TableCell>{visitor.telefone || "-"}</TableCell>
                        <TableCell>{visitor.interesse || "-"}</TableCell>
                        <TableCell>{visitor.page_views || 1}</TableCell>
                        <TableCell>
                          {visitor.utm_source ? (
                            <div className="space-y-1">
                              <Badge variant="outline" className="text-xs">
                                {visitor.utm_source}
                              </Badge>
                              {visitor.utm_campaign && (
                                <Badge variant="secondary" className="text-xs ml-1">
                                  {visitor.utm_campaign}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Direto</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {visitor.cookie_consent ? (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Aceito
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <XCircle className="h-3 w-3" />
                              Recusado
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Leads;
