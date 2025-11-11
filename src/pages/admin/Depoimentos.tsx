import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface Depoimento {
  id: string;
  empresa_nome: string;
  autor: string;
  conteudo: string;
  ativo: boolean;
  ordem: number;
}

export default function Depoimentos() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDepoimento, setEditingDepoimento] = useState<Depoimento | null>(null);
  const [formData, setFormData] = useState({
    empresa_nome: "",
    autor: "",
    conteudo: "",
    ativo: true,
    ordem: 0,
  });

  const queryClient = useQueryClient();

  const { data: depoimentos, isLoading } = useQuery({
    queryKey: ["depoimentos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("depoimentos")
        .select("*")
        .order("ordem", { ascending: true });

      if (error) throw error;
      return data as Depoimento[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("depoimentos").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["depoimentos"] });
      toast.success("Depoimento criado com sucesso!");
      handleCloseDialog();
    },
    onError: () => {
      toast.error("Erro ao criar depoimento");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("depoimentos")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["depoimentos"] });
      toast.success("Depoimento atualizado com sucesso!");
      handleCloseDialog();
    },
    onError: () => {
      toast.error("Erro ao atualizar depoimento");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("depoimentos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["depoimentos"] });
      toast.success("Depoimento excluído com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir depoimento");
    },
  });

  const handleOpenDialog = (depoimento?: Depoimento) => {
    if (depoimento) {
      setEditingDepoimento(depoimento);
      setFormData({
        empresa_nome: depoimento.empresa_nome,
        autor: depoimento.autor,
        conteudo: depoimento.conteudo,
        ativo: depoimento.ativo,
        ordem: depoimento.ordem,
      });
    } else {
      setEditingDepoimento(null);
      setFormData({
        empresa_nome: "",
        autor: "",
        conteudo: "",
        ativo: true,
        ordem: depoimentos?.length ? depoimentos.length + 1 : 1,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingDepoimento(null);
    setFormData({
      empresa_nome: "",
      autor: "",
      conteudo: "",
      ativo: true,
      ordem: 0,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDepoimento) {
      updateMutation.mutate({ id: editingDepoimento.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este depoimento?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Depoimentos</h1>
          <p className="text-muted-foreground">
            Gerencie os depoimentos que aparecem na página inicial
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Depoimento
        </Button>
      </div>

      {isLoading ? (
        <p>Carregando...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead>Autor</TableHead>
              <TableHead>Conteúdo</TableHead>
              <TableHead>Ordem</TableHead>
              <TableHead>Ativo</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {depoimentos?.map((depoimento) => (
              <TableRow key={depoimento.id}>
                <TableCell>{depoimento.empresa_nome}</TableCell>
                <TableCell>{depoimento.autor}</TableCell>
                <TableCell className="max-w-md truncate">
                  {depoimento.conteudo}
                </TableCell>
                <TableCell>{depoimento.ordem}</TableCell>
                <TableCell>
                  {depoimento.ativo ? "Sim" : "Não"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(depoimento)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(depoimento.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingDepoimento ? "Editar Depoimento" : "Novo Depoimento"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="empresa_nome">Nome da Empresa</Label>
              <Input
                id="empresa_nome"
                value={formData.empresa_nome}
                onChange={(e) =>
                  setFormData({ ...formData, empresa_nome: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="autor">Autor</Label>
              <Input
                id="autor"
                value={formData.autor}
                onChange={(e) =>
                  setFormData({ ...formData, autor: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="conteudo">Conteúdo</Label>
              <Textarea
                id="conteudo"
                value={formData.conteudo}
                onChange={(e) =>
                  setFormData({ ...formData, conteudo: e.target.value })
                }
                rows={6}
                required
              />
            </div>
            <div>
              <Label htmlFor="ordem">Ordem</Label>
              <Input
                id="ordem"
                type="number"
                value={formData.ordem}
                onChange={(e) =>
                  setFormData({ ...formData, ordem: parseInt(e.target.value) })
                }
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, ativo: checked })
                }
              />
              <Label htmlFor="ativo">Ativo</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingDepoimento ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    </DashboardLayout>
  );
}
