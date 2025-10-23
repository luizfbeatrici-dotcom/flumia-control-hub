import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEmpresaSelector } from "@/contexts/EmpresaSelectorContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ProdutoDialog } from "@/components/company/ProdutoDialog";
import { toast } from "@/hooks/use-toast";

export default function Produtos() {
  const { profile, isAdminMaster } = useAuth();
  const { selectedEmpresaId } = useEmpresaSelector();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<any>(null);

  const empresaIdParaFiltrar = isAdminMaster ? selectedEmpresaId : profile?.empresa_id;

  const { data: produtos, isLoading } = useQuery({
    queryKey: ["produtos", empresaIdParaFiltrar],
    queryFn: async () => {
      let query = supabase.from("produtos").select("*");
      
      if (empresaIdParaFiltrar) {
        query = query.eq("empresa_id", empresaIdParaFiltrar);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("produtos").insert({
        ...data,
        empresa_id: profile?.empresa_id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["produtos", profile?.empresa_id] });
      toast({
        title: "Produto criado",
        description: "Produto cadastrado com sucesso!",
      });
      setIsDialogOpen(false);
      setSelectedProduto(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar produto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from("produtos")
        .update(data)
        .eq("id", id)
        .eq("empresa_id", profile?.empresa_id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["produtos", profile?.empresa_id] });
      toast({
        title: "Produto atualizado",
        description: "Produto editado com sucesso!",
      });
      setIsDialogOpen(false);
      setSelectedProduto(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar produto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = async (data: any) => {
    if (selectedProduto) {
      await updateMutation.mutateAsync({ id: selectedProduto.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleEdit = (produto: any) => {
    setSelectedProduto(produto);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedProduto(null);
    setIsDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Produtos</h1>
            <p className="text-muted-foreground">Gerencie seu catálogo de produtos</p>
          </div>
          <Button className="gap-2" onClick={handleCreate}>
            <Plus className="h-4 w-4" />
            Novo Produto
          </Button>
        </div>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Catálogo de Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : produtos && produtos.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {produtos.map((produto) => (
                    <TableRow key={produto.id}>
                      <TableCell className="font-medium">{produto.descricao}</TableCell>
                      <TableCell>{produto.sku || "-"}</TableCell>
                      <TableCell>{produto.categoria || "-"}</TableCell>
                      <TableCell>
                        R$ {Number(produto.preco1 || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={produto.ativo ? "default" : "secondary"}>
                          {produto.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(produto)}
                        >
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                Nenhum produto cadastrado ainda
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ProdutoDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        produto={selectedProduto}
        onSave={handleSave}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </DashboardLayout>
  );
}
