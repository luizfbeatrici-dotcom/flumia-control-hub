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

interface FAQ {
  id: string;
  pergunta: string;
  resposta: string;
  ativo: boolean;
  ordem: number;
}

export default function FAQ() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState({
    pergunta: "",
    resposta: "",
    ativo: true,
    ordem: 0,
  });

  const queryClient = useQueryClient();

  const { data: faqs, isLoading } = useQuery({
    queryKey: ["faqs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faqs")
        .select("*")
        .order("ordem", { ascending: true });

      if (error) throw error;
      return data as FAQ[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("faqs").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      toast.success("FAQ criada com sucesso!");
      handleCloseDialog();
    },
    onError: () => {
      toast.error("Erro ao criar FAQ");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("faqs")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      toast.success("FAQ atualizada com sucesso!");
      handleCloseDialog();
    },
    onError: () => {
      toast.error("Erro ao atualizar FAQ");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("faqs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      toast.success("FAQ excluída com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir FAQ");
    },
  });

  const handleOpenDialog = (faq?: FAQ) => {
    if (faq) {
      setEditingFAQ(faq);
      setFormData({
        pergunta: faq.pergunta,
        resposta: faq.resposta,
        ativo: faq.ativo,
        ordem: faq.ordem,
      });
    } else {
      setEditingFAQ(null);
      setFormData({
        pergunta: "",
        resposta: "",
        ativo: true,
        ordem: faqs?.length ? faqs.length + 1 : 1,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingFAQ(null);
    setFormData({
      pergunta: "",
      resposta: "",
      ativo: true,
      ordem: 0,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFAQ) {
      updateMutation.mutate({ id: editingFAQ.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta FAQ?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Perguntas Frequentes
          </h1>
          <p className="text-muted-foreground">
            Gerencie as perguntas e respostas que aparecem na página inicial
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Nova FAQ
        </Button>
      </div>

      {isLoading ? (
        <p>Carregando...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pergunta</TableHead>
              <TableHead>Resposta</TableHead>
              <TableHead>Ordem</TableHead>
              <TableHead>Ativo</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {faqs?.map((faq) => (
              <TableRow key={faq.id}>
                <TableCell className="max-w-xs truncate">{faq.pergunta}</TableCell>
                <TableCell className="max-w-md truncate">
                  {faq.resposta}
                </TableCell>
                <TableCell>{faq.ordem}</TableCell>
                <TableCell>{faq.ativo ? "Sim" : "Não"}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(faq)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(faq.id)}
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
              {editingFAQ ? "Editar FAQ" : "Nova FAQ"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="pergunta">Pergunta</Label>
              <Input
                id="pergunta"
                value={formData.pergunta}
                onChange={(e) =>
                  setFormData({ ...formData, pergunta: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="resposta">Resposta</Label>
              <Textarea
                id="resposta"
                value={formData.resposta}
                onChange={(e) =>
                  setFormData({ ...formData, resposta: e.target.value })
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
                {editingFAQ ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    </DashboardLayout>
  );
}
