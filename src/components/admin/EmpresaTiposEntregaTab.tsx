import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface EmpresaTiposEntregaTabProps {
  empresaId: string;
}

export function EmpresaTiposEntregaTab({ empresaId }: EmpresaTiposEntregaTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    tipo_entrega_id: "",
    valor_frete: "",
    observacao: "",
    prazo_estimado: "",
    ativo: true,
  });
  const queryClient = useQueryClient();

  const { data: tiposEntrega = [] } = useQuery({
    queryKey: ["tipos-entrega"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tipos_entrega")
        .select("*")
        .eq("ativo", true)
        .order("nome");
      if (error) throw error;
      return data;
    },
  });

  const { data: empresaTiposEntrega = [] } = useQuery({
    queryKey: ["empresa-tipos-entrega", empresaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("empresa_tipos_entrega")
        .select("*, tipos_entrega:tipo_entrega_id(nome, descricao)")
        .eq("empresa_id", empresaId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from("empresa_tipos_entrega")
        .insert({
          ...data,
          empresa_id: empresaId,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["empresa-tipos-entrega", empresaId] });
      toast.success("Tipo de entrega adicionado com sucesso!");
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast.error("Erro ao adicionar tipo de entrega: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from("empresa_tipos_entrega")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["empresa-tipos-entrega", empresaId] });
      toast.success("Tipo de entrega atualizado com sucesso!");
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar tipo de entrega: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("empresa_tipos_entrega")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["empresa-tipos-entrega", empresaId] });
      toast.success("Tipo de entrega removido com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao remover tipo de entrega: " + error.message);
    },
  });

  const handleOpenDialog = (item?: any) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        tipo_entrega_id: item.tipo_entrega_id,
        valor_frete: item.valor_frete?.toString() || "",
        observacao: item.observacao || "",
        prazo_estimado: item.prazo_estimado || "",
        ativo: item.ativo,
      });
    } else {
      setEditingId(null);
      setFormData({
        tipo_entrega_id: "",
        valor_frete: "",
        observacao: "",
        prazo_estimado: "",
        ativo: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      tipo_entrega_id: formData.tipo_entrega_id,
      valor_frete: parseFloat(formData.valor_frete) || 0,
      observacao: formData.observacao,
      prazo_estimado: formData.prazo_estimado,
      ativo: formData.ativo,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja remover este tipo de entrega?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Tipos de Entrega</h3>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Tipo de Entrega
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Valor Frete</TableHead>
              <TableHead>Prazo Estimado</TableHead>
              <TableHead>Observação</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {empresaTiposEntrega.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Nenhum tipo de entrega configurado
                </TableCell>
              </TableRow>
            ) : (
              empresaTiposEntrega.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.tipos_entrega?.nome}
                  </TableCell>
                  <TableCell>R$ {item.valor_frete?.toFixed(2)}</TableCell>
                  <TableCell>{item.prazo_estimado || "-"}</TableCell>
                  <TableCell>{item.observacao || "-"}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        item.ativo
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {item.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar" : "Adicionar"} Tipo de Entrega
            </DialogTitle>
            <DialogDescription>
              Configure o tipo de entrega para esta empresa
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tipo_entrega_id">Tipo de Entrega</Label>
              <Select
                value={formData.tipo_entrega_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, tipo_entrega_id: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposEntrega.map((tipo: any) => (
                    <SelectItem key={tipo.id} value={tipo.id}>
                      {tipo.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor_frete">Valor do Frete (R$)</Label>
              <Input
                id="valor_frete"
                type="number"
                step="0.01"
                min="0"
                value={formData.valor_frete}
                onChange={(e) =>
                  setFormData({ ...formData, valor_frete: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prazo_estimado">Prazo Estimado</Label>
              <Input
                id="prazo_estimado"
                placeholder="Ex: 2-3 dias úteis"
                value={formData.prazo_estimado}
                onChange={(e) =>
                  setFormData({ ...formData, prazo_estimado: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacao">Observação</Label>
              <Textarea
                id="observacao"
                placeholder="Informações adicionais"
                value={formData.observacao}
                onChange={(e) =>
                  setFormData({ ...formData, observacao: e.target.value })
                }
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, ativo: checked })
                }
              />
              <Label htmlFor="ativo">Ativo</Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editingId ? "Atualizar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
