import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEmpresaSelector } from "@/contexts/EmpresaSelectorContext";
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
import { Plus, Mail, Phone, MapPin, Loader2, Download, Upload, SquarePen } from "lucide-react";
import { toast } from "sonner";
import { PessoaDialog } from "@/components/company/PessoaDialog";
import { ImportClientesDialog } from "@/components/company/ImportClientesDialog";
import { downloadClientesTemplate, ClienteImportRow } from "@/lib/excelUtilsClientes";

export default function Clientes() {
  const { profile } = useAuth();
  const { selectedEmpresaId } = useEmpresaSelector();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPessoa, setSelectedPessoa] = useState<any>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  // Usa selectedEmpresaId se disponível (admin master), senão usa empresa_id do profile
  const empresaId = selectedEmpresaId || profile?.empresa_id;

  const { data: pessoas = [], isLoading } = useQuery({
    queryKey: ["pessoas", empresaId],
    queryFn: async () => {
      if (!empresaId) return [];

      const { data, error } = await supabase
        .from("pessoas")
        .select("*")
        .eq("empresa_id", empresaId)
        .order("nome");

      if (error) throw error;
      return data || [];
    },
    enabled: !!empresaId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("pessoas").insert({
        ...data,
        empresa_id: empresaId,
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

  const handleDownloadTemplate = () => {
    downloadClientesTemplate();
    toast.success("Template baixado com sucesso!");
  };

  const handleImportClientes = async (clientes: ClienteImportRow[]) => {
    try {
      const clientesData = clientes.map((cliente) => ({
        nome: cliente.nome,
        cnpjf: cliente.cnpjf,
        email: cliente.email,
        celular: cliente.celular,
        empresa_id: empresaId,
      }));

      const { error } = await supabase.from("pessoas").insert(clientesData);

      if (error) throw error;

      // Importar endereços se houver
      const clientesComEndereco = clientes.filter(
        (c) => c.endereco || c.bairro || c.cidade || c.cep
      );

      if (clientesComEndereco.length > 0) {
        const { data: pessoasInseridas } = await supabase
          .from("pessoas")
          .select("id, nome")
          .eq("empresa_id", empresaId)
          .order("created_at", { ascending: false })
          .limit(clientesData.length);

        if (pessoasInseridas) {
          const enderecosData = clientesComEndereco
            .map((cliente, index) => {
              const pessoa = pessoasInseridas.find((p) => p.nome === cliente.nome);
              if (!pessoa) return null;

              return {
                pessoa_id: pessoa.id,
                endereco: cliente.endereco || "",
                bairro: cliente.bairro,
                cidade: cliente.cidade,
                cep: cliente.cep,
                complemento: cliente.complemento,
                principal: true,
              };
            })
            .filter((e) => e !== null);

          if (enderecosData.length > 0) {
            await supabase.from("pessoa_enderecos").insert(enderecosData);
          }
        }
      }

      queryClient.invalidateQueries({ queryKey: ["pessoas"] });
      toast.success(`${clientes.length} cliente(s) importado(s) com sucesso!`);
    } catch (error) {
      console.error("Erro ao importar clientes:", error);
      throw error;
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
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Baixar Modelo
            </Button>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Importar Clientes
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </div>
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
                <TableHead className="text-right">Ações</TableHead>
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
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Nenhum cliente encontrado
                  </TableCell>
                </TableRow>
              ) : (
                pessoas.map((pessoa) => (
                  <TableRow key={pessoa.id}>
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
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(pessoa)}
                      >
                        Editar
                      </Button>
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

        <ImportClientesDialog
          open={isImportDialogOpen}
          onOpenChange={setIsImportDialogOpen}
          onImport={handleImportClientes}
        />
      </div>
    </DashboardLayout>
  );
}
