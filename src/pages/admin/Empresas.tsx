import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Eye } from "lucide-react";
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
import { EmpresaDialog } from "@/components/admin/EmpresaDialog";
import { toast } from "sonner";

export default function Empresas() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: empresas, isLoading } = useQuery({
    queryKey: ["empresas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("empresas")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("empresas").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["empresas"] });
      toast.success("Empresa criada com sucesso!");
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar empresa");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from("empresas")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["empresas"] });
      toast.success("Empresa atualizada com sucesso!");
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar empresa");
    },
  });

  const handleCreate = () => {
    setSelectedEmpresa(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (empresa: any) => {
    setSelectedEmpresa(empresa);
    setIsDialogOpen(true);
  };

  const handleSave = (data: any) => {
    if (selectedEmpresa) {
      updateMutation.mutate({ id: selectedEmpresa.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Empresas</h1>
            <p className="text-muted-foreground">Gerencie todas as empresas cadastradas</p>
          </div>
          <Button className="gap-2" onClick={handleCreate}>
            <Plus className="h-4 w-4" />
            Nova Empresa
          </Button>
        </div>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Lista de Empresas</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : empresas && empresas.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fantasia</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>WhatsApp</TableHead>
                  <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {empresas.map((empresa) => (
                    <TableRow key={empresa.id}>
                      <TableCell className="font-medium">{empresa.fantasia}</TableCell>
                      <TableCell>{empresa.cnpj}</TableCell>
                      <TableCell>{empresa.cidade}</TableCell>
                      <TableCell>{empresa.whatsapp}</TableCell>
                      <TableCell>
                        <Badge variant={empresa.ativo ? "default" : "secondary"}>
                          {empresa.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => navigate(`/admin/empresas/${empresa.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Detalhes
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(empresa)}>
                            Editar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                Nenhuma empresa cadastrada ainda
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <EmpresaDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSave}
        empresa={selectedEmpresa}
      />
    </DashboardLayout>
  );
}
