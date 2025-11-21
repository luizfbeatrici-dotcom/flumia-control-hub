import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UsuarioDialog } from "@/components/admin/UsuarioDialog";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useEmpresaSelector } from "@/contexts/EmpresaSelectorContext";

export default function UsuariosEmpresa() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<any>(null);
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const { selectedEmpresaId } = useEmpresaSelector();

  // Usa selectedEmpresaId se disponível (admin master), senão usa empresa_id do profile
  const empresaId = selectedEmpresaId || profile?.empresa_id;

  const { data: usuarios, isLoading } = useQuery({
    queryKey: ["usuarios-empresa", empresaId],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .eq("empresa_id", empresaId)
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Buscar roles separadamente
      const usuariosComRoles = await Promise.all(
        profiles.map(async (profile) => {
          const { data: roles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", profile.id);

          return {
            ...profile,
            user_roles: roles || [],
          };
        })
      );

      return usuariosComRoles;
    },
    enabled: !!profile?.empresa_id,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error: signUpError, data: authData } = await supabase.auth.signUp({
        email: data.email,
        password: data.senha,
        options: {
          data: {
            nome: data.nome,
            empresa_id: data.empresa_id,
            is_company_admin: data.is_company_admin,
          },
        },
      });

      if (signUpError) throw signUpError;
      return authData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios-empresa"] });
      toast.success("Usuário criado com sucesso!");
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar usuário");
    },
  });

  const handleCreate = () => {
    setSelectedUsuario(null);
    setIsDialogOpen(true);
  };

  const handleSave = (data: any) => {
    if (selectedUsuario) {
      toast.info("Edição de usuários será implementada em breve");
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Usuários</h1>
            <p className="text-muted-foreground">Gerencie os usuários da sua empresa</p>
          </div>
          <Button className="gap-2" onClick={handleCreate}>
            <Plus className="h-4 w-4" />
            Novo Usuário
          </Button>
        </div>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Lista de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : usuarios && usuarios.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell className="font-medium">{usuario.nome}</TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {usuario.user_roles?.map((ur: any, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {ur.role}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={usuario.ativo ? "default" : "secondary"}>
                          {usuario.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                Nenhum usuário cadastrado ainda
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <UsuarioDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSave}
        usuario={selectedUsuario}
      />
    </DashboardLayout>
  );
}
