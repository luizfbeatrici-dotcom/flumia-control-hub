import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Mail, Phone, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PessoaDialog } from "@/components/company/PessoaDialog";

export default function Clientes() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPessoa, setSelectedPessoa] = useState<any>(null);

  const { data: pessoas = [], isLoading } = useQuery({
    queryKey: ["pessoas", profile?.empresa_id],
    queryFn: async () => {
      if (!profile?.empresa_id) return [];

      const { data, error } = await supabase
        .from("pessoas")
        .select("*")
        .eq("empresa_id", profile.empresa_id)
        .order("nome");

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.empresa_id,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("pessoas").insert({
        ...data,
        empresa_id: profile?.empresa_id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pessoas"] });
      toast.success("Cliente criado com sucesso!");
      setIsDialogOpen(false);
      setSelectedPessoa(null);
    },
    onError: (error) => {
      toast.error("Erro ao criar cliente", {
        description: error.message,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const { id, ...updateData } = data;
      const { error } = await supabase
        .from("pessoas")
        .update(updateData)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pessoas"] });
      toast.success("Cliente atualizado com sucesso!");
      setIsDialogOpen(false);
      setSelectedPessoa(null);
    },
    onError: (error) => {
      toast.error("Erro ao atualizar cliente", {
        description: error.message,
      });
    },
  });

  const handleCreate = () => {
    setSelectedPessoa(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (pessoa: any) => {
    setSelectedPessoa(pessoa);
    setIsDialogOpen(true);
  };

  const handleSave = async (data: any) => {
    if (selectedPessoa) {
      updateMutation.mutate({ ...data, id: selectedPessoa.id });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
            <p className="text-muted-foreground">
              Gerencie seus clientes e informações de contato
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : pessoas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhum cliente encontrado
                  </TableCell>
                </TableRow>
              ) : (
                pessoas.map((pessoa) => (
                  <TableRow
                    key={pessoa.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleEdit(pessoa)}
                  >
                    <TableCell className="font-medium">{pessoa.nome}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {pessoa.cnpjf?.length > 11 ? "Pessoa Jurídica" : "Pessoa Física"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {pessoa.email && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {pessoa.email}
                          </div>
                        )}
                        {pessoa.celular && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {pessoa.celular}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      -
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">Ativo</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        <PessoaDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          pessoa={selectedPessoa}
          onSave={(data) => handleSave(data)}
        />
      </div>
    </DashboardLayout>
  );
}
