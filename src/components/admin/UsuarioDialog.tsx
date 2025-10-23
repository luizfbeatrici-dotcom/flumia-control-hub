import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";

const usuarioSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(255),
  email: z.string().email("Email inválido").max(255),
  senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").optional(),
  nova_senha: z.string().min(6, "Nova senha deve ter no mínimo 6 caracteres").optional(),
  empresa_id: z.string().optional(),
  is_admin_master: z.boolean().default(false),
  ativo: z.boolean().default(true),
}).refine((data) => {
  // Se NÃO for admin master, empresa_id é obrigatória
  if (!data.is_admin_master && !data.empresa_id) {
    return false;
  }
  return true;
}, {
  message: "Empresa é obrigatória para usuários que não são administradores da plataforma",
  path: ["empresa_id"],
});

type UsuarioFormData = z.infer<typeof usuarioSchema>;

interface UsuarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (data: UsuarioFormData) => void;
  usuario?: any;
  empresaId?: string;
}

export function UsuarioDialog({ open, onOpenChange, onSave, usuario, empresaId }: UsuarioDialogProps) {
  const { isAdminMaster, profile, signUp } = useAuth();
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const { data: empresas } = useQuery({
    queryKey: ["empresas-select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("empresas")
        .select("id, fantasia")
        .eq("ativo", true)
        .order("fantasia");
      if (error) throw error;
      return data;
    },
    enabled: isAdminMaster,
  });

  const form = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: usuario ? {
      nome: usuario.nome,
      email: usuario.email,
      empresa_id: usuario.empresa_id || "",
      is_admin_master: usuario.user_roles?.some((ur: any) => ur.role === 'admin_master') || false,
      ativo: usuario.ativo ?? true,
    } : {
      nome: "",
      email: "",
      senha: "",
      empresa_id: empresaId || (isAdminMaster ? "" : (profile?.empresa_id || "")),
      is_admin_master: false,
      ativo: true,
    },
  });

  const isAdminMasterChecked = form.watch("is_admin_master");

  // Reset form quando o dialog abrir ou o usuário mudar
  useEffect(() => {
    if (open) {
      if (usuario) {
        form.reset({
          nome: usuario.nome,
          email: usuario.email,
          empresa_id: usuario.empresa_id || "",
          is_admin_master: usuario.user_roles?.some((ur: any) => ur.role === 'admin_master') || false,
          ativo: usuario.ativo ?? true,
        });
      } else {
        form.reset({
          nome: "",
          email: "",
          senha: "",
          empresa_id: empresaId || (isAdminMaster ? "" : (profile?.empresa_id || "")),
          is_admin_master: false,
          ativo: true,
        });
      }
    }
  }, [open, usuario, empresaId, isAdminMaster, profile?.empresa_id, form]);

  const handleResetPassword = async () => {
    if (!usuario?.email) return;
    
    setIsResettingPassword(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(usuario.email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      
      if (error) throw error;
      
      toast.success("Email de redefinição de senha enviado com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao enviar email de redefinição");
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleSubmit = async (data: UsuarioFormData) => {
    if (onSave) {
      onSave(data);
    } else {
      // Default behavior: create user via signUp
      await signUp(
        data.email, 
        data.senha || "", 
        data.nome, 
        data.empresa_id || null,
        data.is_admin_master
      );
      onOpenChange(false);
    }
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{usuario ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
          <DialogDescription>
            {usuario ? "Atualize as informações do usuário" : "Cadastre um novo usuário no sistema"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" disabled={!!usuario} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!usuario && (
              <FormField
                control={form.control}
                name="senha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha *</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {usuario && (
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <KeyRound className="h-4 w-4" />
                      <span className="text-sm font-medium">Redefinir Senha</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Enviar email de redefinição de senha para o usuário
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResetPassword}
                    disabled={isResettingPassword}
                  >
                    {isResettingPassword ? "Enviando..." : "Enviar Email"}
                  </Button>
                </div>
              </div>
            )}
            {!usuario && (
              <FormField
                control={form.control}
                name="is_admin_master"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Administrador da plataforma</FormLabel>
                  </FormItem>
                )}
              />
            )}
            {isAdminMaster && !empresaId && !isAdminMasterChecked && (
              <FormField
                control={form.control}
                name="empresa_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empresa *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma empresa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {empresas?.map((empresa) => (
                          <SelectItem key={empresa.id} value={empresa.id}>
                            {empresa.fantasia}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {usuario && (
              <FormField
                control={form.control}
                name="ativo"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Status do Usuário</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        {field.value ? "Usuário pode acessar a plataforma" : "Usuário bloqueado de acessar a plataforma"}
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
