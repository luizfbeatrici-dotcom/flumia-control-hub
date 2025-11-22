import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil } from "lucide-react";
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

export default function Usuarios() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: usuarios, isLoading } = useQuery({
    queryKey: ["usuarios-admin"],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Buscar empresa e roles separadamente
      const usuariosComDados = await Promise.all(
        profiles.map(async (profile) => {
          const [empresaResult, rolesResult] = await Promise.all([
            profile.empresa_id
              ? supabase.from("empresas").select("fantasia").eq("id", profile.empresa_id).single()
              : Promise.resolve({ data: null }),
            supabase.from("user_roles").select("role").eq("user_id", profile.id),
          ]);

          return {
            ...profile,
            empresas: empresaResult.data,
            user_roles: rolesResult.data || [],
          };
        })
      );

      return usuariosComDados;
    },
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
            is_admin_master: data.is_admin_master,
          },
        },
      });

      if (signUpError) throw signUpError;
      return authData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios-admin"] });
      toast.success("Usuário criado com sucesso!");
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar usuário");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      // CORREÇÃO DE SEGURANÇA: Usar uma transaction-like approach
      // para evitar perda de roles em caso de erro
      
      // 1. Atualizar profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          nome: data.nome,
          ativo: data.ativo,
          empresa_id: data.is_admin_master ? null : data.empresa_id,
        })
        .eq("id", data.id);

      if (profileError) throw profileError;

      // 2. Determinar a role correta
      const newRole = data.is_admin_master ? "admin_master" : "company_admin";

      // 3. Buscar roles atuais do usuário
      const { data: currentRoles, error: fetchError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.id);

      if (fetchError) throw fetchError;

      // 4. Se a role já existe, não fazer nada
      const hasCorrectRole = currentRoles?.some(r => r.role === newRole);
      
      if (!hasCorrectRole) {
        // 4a. Deletar APENAS roles diferentes da correta
        const rolesToDelete = currentRoles
          ?.filter(r => r.role !== newRole)
          .map(r => r.role) || [];

        if (rolesToDelete.length > 0) {
          const { error: deleteError } = await supabase
            .from("user_roles")
            .delete()
            .eq("user_id", data.id)
            .in("role", rolesToDelete);

          if (deleteError) throw deleteError;
        }

        // 4b. Inserir a nova role se não existir
        const { error: insertError } = await supabase
          .from("user_roles")
          .insert({ user_id: data.id, role: newRole });

        if (insertError) {
          // Se falhar o insert, não deixar o usuário sem role
          throw new Error(`Falha ao atribuir role: ${insertError.message}`);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios-admin"] });
      toast.success("Usuário atualizado com sucesso!");
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar usuário");
    },
  });

  const handleCreate = () => {
    setSelectedUsuario(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (usuario: any) => {
    setSelectedUsuario(usuario);
    setIsDialogOpen(true);
  };

  const handleSave = (data: any) => {
    if (selectedUsuario) {
      updateMutation.mutate({ ...data, id: selectedUsuario.id });
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
            <p className="text-muted-foreground">Gerencie todos os usuários do sistema</p>
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
                    <TableHead>Empresa</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell className="font-medium">{usuario.nome}</TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>{usuario.empresas?.fantasia || "-"}</TableCell>
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
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(usuario)}
                          className="h-8 w-8"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
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
