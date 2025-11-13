import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Trash2, Edit2, Plus, GripVertical } from "lucide-react";

interface CaracteristicasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CaracteristicasDialog({ open, onOpenChange }: CaracteristicasDialogProps) {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState({
    nome: "",
    descricao: "",
    ordem: ""
  });

  const { data: caracteristicas, isLoading } = useQuery({
    queryKey: ["caracteristicas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("caracteristicas")
        .select("*")
        .eq("ativo", true)
        .order("ordem");
      if (error) throw error;
      return data || [];
    },
    enabled: open,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { error } = await supabase.from("caracteristicas").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caracteristicas"] });
      toast.success("Característica criada com sucesso!");
      resetForm();
    },
    onError: (err: any) => toast.error(err.message || "Erro ao criar característica"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const { error } = await supabase.from("caracteristicas").update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caracteristicas"] });
      toast.success("Característica atualizada com sucesso!");
      resetForm();
    },
    onError: (err: any) => toast.error(err.message || "Erro ao atualizar característica"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("caracteristicas").update({ ativo: false }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caracteristicas"] });
      toast.success("Característica removida com sucesso!");
    },
    onError: (err: any) => toast.error(err.message || "Erro ao remover característica"),
  });

  const resetForm = () => {
    setFormValues({ nome: "", descricao: "", ordem: "" });
    setEditingId(null);
  };

  const handleEdit = (caracteristica: any) => {
    setEditingId(caracteristica.id);
    setFormValues({
      nome: caracteristica.nome,
      descricao: caracteristica.descricao || "",
      ordem: caracteristica.ordem.toString(),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nome: formValues.nome.trim(),
      descricao: formValues.descricao.trim() || null,
      ordem: Number(formValues.ordem || 0),
    };

    if (!payload.nome) {
      toast.error("Informe o nome da característica");
      return;
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Características dos Planos</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome da Característica</label>
              <Input
                placeholder="Ex.: Suporte 24/7"
                value={formValues.nome}
                onChange={(e) => setFormValues((s) => ({ ...s, nome: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição (opcional)</label>
              <Textarea
                placeholder="Detalhes adicionais..."
                value={formValues.descricao}
                onChange={(e) => setFormValues((s) => ({ ...s, descricao: e.target.value }))}
                rows={1}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ordem</label>
              <Input
                type="number"
                placeholder="0"
                value={formValues.ordem}
                onChange={(e) => setFormValues((s) => ({ ...s, ordem: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {editingId ? (
                <><Edit2 className="mr-2 h-4 w-4" /> Atualizar</>
              ) : (
                <><Plus className="mr-2 h-4 w-4" /> Adicionar</>
              )}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            )}
          </div>
        </form>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="w-24">Ordem</TableHead>
                <TableHead className="w-24 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : caracteristicas?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhuma característica cadastrada
                  </TableCell>
                </TableRow>
              ) : (
                caracteristicas?.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                    <TableCell className="font-medium">{item.nome}</TableCell>
                    <TableCell className="text-muted-foreground">{item.descricao || "-"}</TableCell>
                    <TableCell>{item.ordem}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
