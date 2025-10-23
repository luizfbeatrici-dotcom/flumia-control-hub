import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, MapPin, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { EnderecoDialog } from "./EnderecoDialog";

const pessoaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(255),
  email: z.string().email("Email inválido").max(255).optional().nullable().or(z.literal("")),
  celular: z.string().max(20).optional().nullable(),
  cnpjf: z.string().max(18).optional().nullable(),
});

type PessoaFormValues = z.infer<typeof pessoaSchema>;

interface PessoaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pessoa?: any;
  onSave: (data: PessoaFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function PessoaDialog({
  open,
  onOpenChange,
  pessoa,
  onSave,
  isLoading,
}: PessoaDialogProps) {
  const queryClient = useQueryClient();
  const [isEnderecoDialogOpen, setIsEnderecoDialogOpen] = useState(false);
  const [selectedEndereco, setSelectedEndereco] = useState<any>(null);

  const form = useForm<PessoaFormValues>({
    resolver: zodResolver(pessoaSchema),
    defaultValues: {
      nome: "",
      email: "",
      celular: "",
      cnpjf: "",
    },
  });

  // Fetch endereços da pessoa
  const { data: enderecos, isLoading: isLoadingEnderecos } = useQuery({
    queryKey: ["enderecos", pessoa?.id],
    queryFn: async () => {
      if (!pessoa?.id) return [];
      const { data, error } = await supabase
        .from("pessoa_enderecos")
        .select("*")
        .eq("pessoa_id", pessoa.id)
        .order("principal", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!pessoa?.id && open,
  });

  // Create endereco mutation
  const createEnderecoMutation = useMutation({
    mutationFn: async (data: any) => {
      // Se marcar como principal, desmarcar os outros
      if (data.principal && pessoa?.id) {
        await supabase
          .from("pessoa_enderecos")
          .update({ principal: false })
          .eq("pessoa_id", pessoa.id);
      }

      const { error } = await supabase.from("pessoa_enderecos").insert({
        ...data,
        pessoa_id: pessoa?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enderecos", pessoa?.id] });
      toast.success("Endereço criado com sucesso!");
      setIsEnderecoDialogOpen(false);
      setSelectedEndereco(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar endereço");
    },
  });

  // Update endereco mutation
  const updateEnderecoMutation = useMutation({
    mutationFn: async ({ enderecoId, data }: { enderecoId: string; data: any }) => {
      // Se marcar como principal, desmarcar os outros
      if (data.principal && pessoa?.id) {
        await supabase
          .from("pessoa_enderecos")
          .update({ principal: false })
          .eq("pessoa_id", pessoa.id)
          .neq("id", enderecoId);
      }

      const { error } = await supabase
        .from("pessoa_enderecos")
        .update(data)
        .eq("id", enderecoId)
        .eq("pessoa_id", pessoa?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enderecos", pessoa?.id] });
      toast.success("Endereço atualizado com sucesso!");
      setIsEnderecoDialogOpen(false);
      setSelectedEndereco(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar endereço");
    },
  });

  // Delete endereco mutation
  const deleteEnderecoMutation = useMutation({
    mutationFn: async (enderecoId: string) => {
      const { error } = await supabase
        .from("pessoa_enderecos")
        .delete()
        .eq("id", enderecoId)
        .eq("pessoa_id", pessoa?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enderecos", pessoa?.id] });
      toast.success("Endereço excluído com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao excluir endereço");
    },
  });

  useEffect(() => {
    if (pessoa) {
      form.reset({
        nome: pessoa.nome || "",
        email: pessoa.email || "",
        celular: pessoa.celular || "",
        cnpjf: pessoa.cnpjf || "",
      });
    } else {
      form.reset({
        nome: "",
        email: "",
        celular: "",
        cnpjf: "",
      });
    }
  }, [pessoa, form]);

  const onSubmit = async (data: PessoaFormValues) => {
    await onSave(data);
    form.reset();
  };

  const handleSaveEndereco = async (data: any) => {
    if (selectedEndereco) {
      await updateEnderecoMutation.mutateAsync({ enderecoId: selectedEndereco.id, data });
    } else {
      await createEnderecoMutation.mutateAsync(data);
    }
  };

  const handleEditEndereco = (endereco: any) => {
    setSelectedEndereco(endereco);
    setIsEnderecoDialogOpen(true);
  };

  const handleCreateEndereco = () => {
    setSelectedEndereco(null);
    setIsEnderecoDialogOpen(true);
  };

  const handleDeleteEndereco = (enderecoId: string) => {
    if (confirm("Tem certeza que deseja excluir este endereço?")) {
      deleteEnderecoMutation.mutate(enderecoId);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {pessoa ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do cliente. Campos com * são obrigatórios.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Nome *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome completo" {...field} />
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="email@exemplo.com"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="celular"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Celular</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="(00) 00000-0000"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cnpjf"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>CPF/CNPJ</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="000.000.000-00 ou 00.000.000/0000-00"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Seção de Endereços */}
              <Separator className="my-6" />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Endereços</h3>
                  </div>
                  {pessoa && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleCreateEndereco}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  )}
                </div>

                {!pessoa ? (
                  <div className="py-8 text-center text-sm text-muted-foreground border rounded-md bg-muted/50">
                    <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Salve o cliente primeiro para adicionar endereços</p>
                  </div>
                ) : (

                  isLoadingEnderecos ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    </div>
                  ) : enderecos && enderecos.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Endereço</TableHead>
                            <TableHead>Bairro</TableHead>
                            <TableHead>Cidade</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {enderecos.map((endereco) => (
                            <TableRow key={endereco.id}>
                              <TableCell className="font-medium">
                                {endereco.endereco}
                                {endereco.complemento && `, ${endereco.complemento}`}
                              </TableCell>
                              <TableCell>{endereco.bairro || "-"}</TableCell>
                              <TableCell>{endereco.cidade || "-"}</TableCell>
                              <TableCell>
                                {endereco.principal && (
                                  <Badge variant="default">Principal</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditEndereco(endereco)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteEndereco(endereco.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-sm text-muted-foreground border rounded-md">
                      Nenhum endereço cadastrado
                    </div>
                  )
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <EnderecoDialog
        open={isEnderecoDialogOpen}
        onOpenChange={setIsEnderecoDialogOpen}
        endereco={selectedEndereco}
        onSave={handleSaveEndereco}
        isLoading={createEnderecoMutation.isPending || updateEnderecoMutation.isPending}
      />
    </>
  );
}
