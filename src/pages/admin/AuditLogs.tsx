import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Shield, UserPlus, UserMinus, Key, FileEdit, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const AuditLogs = () => {
  const [actionFilter, setActionFilter] = useState<string>("all");

  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ["audit-logs", actionFilter],
    queryFn: async () => {
      let query = supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (actionFilter !== "all") {
        query = query.eq("action_type", actionFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "user_created":
        return <UserPlus className="h-4 w-4" />;
      case "user_deleted":
        return <UserMinus className="h-4 w-4" />;
      case "role_added":
      case "role_removed":
        return <Key className="h-4 w-4" />;
      case "profile_updated":
        return <FileEdit className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getActionLabel = (actionType: string) => {
    const labels: Record<string, string> = {
      user_created: "Usuário Criado",
      user_deleted: "Usuário Excluído",
      role_added: "Role Adicionada",
      role_removed: "Role Removida",
      profile_updated: "Perfil Atualizado",
    };
    return labels[actionType] || actionType;
  };

  const getActionVariant = (actionType: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (actionType) {
      case "user_created":
      case "role_added":
        return "default";
      case "user_deleted":
      case "role_removed":
        return "destructive";
      case "profile_updated":
        return "secondary";
      default:
        return "outline";
    }
  };

  const formatChanges = (oldValues: any, newValues: any) => {
    if (!oldValues && !newValues) return "-";
    
    const changes: string[] = [];
    
    if (oldValues) {
      Object.keys(oldValues).forEach((key) => {
        const oldVal = oldValues[key];
        const newVal = newValues?.[key];
        if (oldVal !== newVal) {
          changes.push(`${key}: ${oldVal} → ${newVal || "removido"}`);
        }
      });
    } else if (newValues) {
      Object.keys(newValues).forEach((key) => {
        changes.push(`${key}: ${newValues[key]}`);
      });
    }
    
    return changes.length > 0 ? changes.join(", ") : "-";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Logs de Auditoria</h1>
          <p className="text-muted-foreground mt-2">
            Histórico de ações administrativas críticas
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Registro de Atividades</CardTitle>
                <CardDescription>
                  Acompanhe todas as ações administrativas realizadas no sistema
                </CardDescription>
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrar ação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as ações</SelectItem>
                  <SelectItem value="user_created">Usuários criados</SelectItem>
                  <SelectItem value="user_deleted">Usuários excluídos</SelectItem>
                  <SelectItem value="role_added">Roles adicionadas</SelectItem>
                  <SelectItem value="role_removed">Roles removidas</SelectItem>
                  <SelectItem value="profile_updated">Perfis atualizados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Administrador</TableHead>
                    <TableHead>Usuário Afetado</TableHead>
                    <TableHead>Alterações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs && auditLogs.length > 0 ? (
                    auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">
                          {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", {
                            locale: ptBR,
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getActionVariant(log.action_type)} className="gap-1">
                            {getActionIcon(log.action_type)}
                            {getActionLabel(log.action_type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{log.admin_name || "Sistema"}</div>
                            <div className="text-sm text-muted-foreground">{log.admin_email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {log.target_email || "-"}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="text-sm truncate" title={formatChanges(log.old_values, log.new_values)}>
                            {formatChanges(log.old_values, log.new_values)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Nenhum registro de auditoria encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AuditLogs;
