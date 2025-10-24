import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Edit, Plus, Users, Package, ShoppingCart, MessageSquare, Smartphone, Key, Copy, Trash2, BookOpen, Download, Upload, Eye, Settings } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { EmpresaDialog } from "@/components/admin/EmpresaDialog";
import { ProdutoDialog } from "@/components/company/ProdutoDialog";
import { ImportProdutosDialog } from "@/components/company/ImportProdutosDialog";
import { PessoaDialog } from "@/components/company/PessoaDialog";
import { UsuarioDialog } from "@/components/admin/UsuarioDialog";
import { AplicativoDialog } from "@/components/admin/AplicativoDialog";
import { ApiTokenDialog } from "@/components/admin/ApiTokenDialog";
import { ApiDocumentation } from "@/components/admin/ApiDocumentation";
import { downloadProdutosTemplate, ProdutoImportRow } from "@/lib/excelUtils";
import { downloadClientesTemplate, ClienteImportRow } from "@/lib/excelUtilsClientes";
import { ImportClientesDialog } from "@/components/company/ImportClientesDialog";
import { useAuth } from "@/hooks/useAuth";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function EmpresaDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdminMaster } = useAuth();
  const [activeTab, setActiveTab] = useState("info");
  const [isEmpresaDialogOpen, setIsEmpresaDialogOpen] = useState(false);
  const [isProdutoDialogOpen, setIsProdutoDialogOpen] = useState(false);
  const [isImportProdutosDialogOpen, setIsImportProdutosDialogOpen] = useState(false);
  const [isPessoaDialogOpen, setIsPessoaDialogOpen] = useState(false);
  const [isImportClientesDialogOpen, setIsImportClientesDialogOpen] = useState(false);
  const [isUsuarioDialogOpen, setIsUsuarioDialogOpen] = useState(false);
  const [isAplicativoDialogOpen, setIsAplicativoDialogOpen] = useState(false);
  const [isApiTokenDialogOpen, setIsApiTokenDialogOpen] = useState(false);
  const [isApiDocOpen, setIsApiDocOpen] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<any>(null);
  const [selectedPessoa, setSelectedPessoa] = useState<any>(null);
  const [selectedAplicativo, setSelectedAplicativo] = useState<any>(null);
  const [selectedPedidoId, setSelectedPedidoId] = useState<string | null>(null);

  // Fetch empresa data
  const { data: empresa, isLoading: isLoadingEmpresa } = useQuery({
    queryKey: ["empresa", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("empresas")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Fetch produtos
  const { data: produtos, isLoading: isLoadingProdutos } = useQuery({
    queryKey: ["produtos", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .eq("empresa_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch pessoas
  const { data: pessoas, isLoading: isLoadingPessoas } = useQuery({
    queryKey: ["pessoas", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pessoas")
        .select("*")
        .eq("empresa_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch aplicativos
  const { data: aplicativos, isLoading: isLoadingAplicativos } = useQuery({
    queryKey: ["aplicativos", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aplicativos")
        .select("*")
        .eq("empresa_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch API tokens
  const { data: apiTokens, isLoading: isLoadingApiTokens } = useQuery({
    queryKey: ["api-tokens", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("api_tokens")
        .select("*")
        .eq("empresa_id", id)
        .order("created_at", { ascending: false});
      if (error) throw error;
      return data;
    },
  });


  // Fetch usuarios
  const { data: usuarios, isLoading: isLoadingUsuarios } = useQuery({
    queryKey: ["usuarios-empresa", id],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("empresa_id", id);
      
      if (error) throw error;

      const usersWithRoles = await Promise.all(
        profiles.map(async (profile) => {
          const { data: rolesData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", profile.id);
          
          return {
            ...profile,
            roles: rolesData?.map(r => r.role) || [],
          };
        })
      );

      return usersWithRoles;
    },
  });

  // Fetch pedidos
  const { data: pedidos, isLoading: isLoadingPedidos } = useQuery({
    queryKey: ["pedidos", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pedidos")
        .select(`
          *,
          pessoas:pessoa_id(nome, cnpjf, celular, email),
          pessoa_enderecos:endereco_id(endereco, complemento, bairro, cidade, cep)
        `)
        .eq("empresa_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch pedido items for selected pedido
  const { data: pedidoItens } = useQuery({
    queryKey: ["pedido-itens", selectedPedidoId],
    enabled: !!selectedPedidoId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pedido_itens")
        .select(`
          *,
          produtos:produto_id(descricao, sku, unidade)
        `)
        .eq("pedido_id", selectedPedidoId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch conversas ativas (jornadas)
  const { data: jornadas } = useQuery({
    queryKey: ["jornadas", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jornadas")
        .select("id")
        .eq("empresa_id", id);
      if (error) throw error;
      return data;
    },
  });

  // Fetch total de vendas do mês atual
  const { data: vendasMesAtual } = useQuery({
    queryKey: ["vendas-mes-atual", id],
    queryFn: async () => {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      const { data, error } = await supabase
        .from("pedidos")
        .select("total")
        .eq("empresa_id", id)
        .gte("created_at", firstDay.toISOString())
        .lte("created_at", lastDay.toISOString());
      
      if (error) throw error;
      
      const totalVendas = data?.reduce((acc, pedido) => acc + (Number(pedido.total) || 0), 0) || 0;
      return totalVendas;
    },
  });

  // Update empresa mutation
  const updateEmpresaMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from("empresas")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["empresa", id] });
      queryClient.invalidateQueries({ queryKey: ["empresas"] });
      toast.success("Empresa atualizada com sucesso!");
      setIsEmpresaDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar empresa");
    },
  });

  const updateEmpresa = (data: any) => {
    updateEmpresaMutation.mutate({ id: id!, data });
  };

  // Produto mutations
  const createProdutoMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("produtos").insert({
        ...data,
        empresa_id: id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["produtos", id] });
      toast.success("Produto criado com sucesso!");
      setIsProdutoDialogOpen(false);
      setSelectedProduto(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar produto");
    },
  });

  const updateProdutoMutation = useMutation({
    mutationFn: async ({ produtoId, data }: { produtoId: string; data: any }) => {
      const { error } = await supabase
        .from("produtos")
        .update(data)
        .eq("id", produtoId)
        .eq("empresa_id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["produtos", id] });
      toast.success("Produto atualizado com sucesso!");
      setIsProdutoDialogOpen(false);
      setSelectedProduto(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar produto");
    },
  });

  // Pessoa mutations
  const createPessoaMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("pessoas").insert({
        ...data,
        empresa_id: id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pessoas", id] });
      toast.success("Cliente criado com sucesso!");
      setIsPessoaDialogOpen(false);
      setSelectedPessoa(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar cliente");
    },
  });

  const updatePessoaMutation = useMutation({
    mutationFn: async ({ pessoaId, data }: { pessoaId: string; data: any }) => {
      const { error } = await supabase
        .from("pessoas")
        .update(data)
        .eq("id", pessoaId)
        .eq("empresa_id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pessoas", id] });
      toast.success("Cliente atualizado com sucesso!");
      setIsPessoaDialogOpen(false);
      setSelectedPessoa(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar cliente");
    },
  });

  const handleSaveEmpresa = (data: any) => {
    updateEmpresaMutation.mutate({ id: id!, data });
  };

  // Aplicativo mutations
  const createAplicativoMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("aplicativos").insert({
        ...data,
        empresa_id: id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aplicativos", id] });
      toast.success("Aplicativo criado com sucesso!");
      setIsAplicativoDialogOpen(false);
      setSelectedAplicativo(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar aplicativo");
    },
  });

  const updateAplicativoMutation = useMutation({
    mutationFn: async ({ aplicativoId, data }: { aplicativoId: string; data: any }) => {
      const { error } = await supabase
        .from("aplicativos")
        .update(data)
        .eq("id", aplicativoId)
        .eq("empresa_id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aplicativos", id] });
      toast.success("Aplicativo atualizado com sucesso!");
      setIsAplicativoDialogOpen(false);
      setSelectedAplicativo(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar aplicativo");
    },
  });

  const handleSaveAplicativo = async (data: any) => {
    if (selectedAplicativo) {
      await updateAplicativoMutation.mutateAsync({ aplicativoId: selectedAplicativo.id, data });
    } else {
      await createAplicativoMutation.mutateAsync(data);
    }
  };

  const handleEditAplicativo = (aplicativo: any) => {
    setSelectedAplicativo(aplicativo);
    setIsAplicativoDialogOpen(true);
  };

  const handleCreateAplicativo = () => {
    setSelectedAplicativo(null);
    setIsAplicativoDialogOpen(true);
  };

  // API Token mutations
  const createApiTokenMutation = useMutation({
    mutationFn: async (data: any) => {
      // Gerar token seguro
      const token = crypto.randomUUID() + '-' + crypto.randomUUID();
      
      const { data: newToken, error } = await supabase.from("api_tokens").insert({
        ...data,
        empresa_id: id,
        token,
      }).select().single();
      
      if (error) throw error;
      return newToken;
    },
    onSuccess: (newToken) => {
      queryClient.invalidateQueries({ queryKey: ["api-tokens", id] });
      toast.success("Token criado com sucesso!");
      // Copiar token para clipboard
      navigator.clipboard.writeText(newToken.token);
      toast.info("Token copiado para a área de transferência");
      setIsApiTokenDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar token");
    },
  });

  const deleteApiTokenMutation = useMutation({
    mutationFn: async (tokenId: string) => {
      const { error } = await supabase
        .from("api_tokens")
        .delete()
        .eq("id", tokenId)
        .eq("empresa_id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-tokens", id] });
      toast.success("Token excluído com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao excluir token");
    },
  });

  const toggleApiTokenMutation = useMutation({
    mutationFn: async ({ tokenId, ativo }: { tokenId: string; ativo: boolean }) => {
      const { error } = await supabase
        .from("api_tokens")
        .update({ ativo })
        .eq("id", tokenId)
        .eq("empresa_id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-tokens", id] });
      toast.success("Status do token atualizado!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar token");
    },
  });

  const handleSaveApiToken = async (data: any) => {
    await createApiTokenMutation.mutateAsync(data);
  };

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast.success("Token copiado para a área de transferência!");
  };

  const handleDeleteToken = (tokenId: string) => {
    if (confirm("Tem certeza que deseja excluir este token? Esta ação não pode ser desfeita.")) {
      deleteApiTokenMutation.mutate(tokenId);
    }
  };

  const handleToggleToken = (tokenId: string, currentStatus: boolean) => {
    toggleApiTokenMutation.mutate({ tokenId, ativo: !currentStatus });
  };

  const handleSaveProduto = async (data: any) => {
    if (selectedProduto) {
      await updateProdutoMutation.mutateAsync({ produtoId: selectedProduto.id, data });
    } else {
      await createProdutoMutation.mutateAsync(data);
    }
  };

  const handleSavePessoa = async (data: any) => {
    if (selectedPessoa) {
      await updatePessoaMutation.mutateAsync({ pessoaId: selectedPessoa.id, data });
    } else {
      await createPessoaMutation.mutateAsync(data);
    }
  };

  const handleEditProduto = (produto: any) => {
    setSelectedProduto(produto);
    setIsProdutoDialogOpen(true);
  };

  const handleCreateProduto = () => {
    setSelectedProduto(null);
    setIsProdutoDialogOpen(true);
  };

  const handleEditPessoa = (pessoa: any) => {
    setSelectedPessoa(pessoa);
    setIsPessoaDialogOpen(true);
  };

  const handleCreatePessoa = () => {
    setSelectedPessoa(null);
    setIsPessoaDialogOpen(true);
  };

  const handleDownloadTemplate = () => {
    downloadProdutosTemplate();
    toast.success("Download iniciado. O arquivo template foi baixado com sucesso!");
  };

  const handleImportProdutos = async (produtos: ProdutoImportRow[]) => {
    if (!id) {
      throw new Error("Empresa não identificada");
    }

    const chunkSize = 100;

    for (let i = 0; i < produtos.length; i += chunkSize) {
      const chunk = produtos.slice(i, i + chunkSize);
      const dataToInsert = chunk.map(p => ({
        empresa_id: id,
        descricao: p.descricao,
        sku: p.sku || null,
        complemento: p.complemento || null,
        preco1: p.preco1,
        preco2: p.preco2 || null,
        unidade: p.unidade || null,
        categoria: p.categoria || null,
        departamento: p.departamento || null,
        grupo: p.grupo || null,
        subgrupo: p.subgrupo || null,
        visibilidade: p.visibilidade || "visible",
        ativo: p.ativo !== undefined ? p.ativo : true,
      }));

      const { error } = await supabase.from("produtos").insert(dataToInsert);
      
      if (error) throw error;
    }

    queryClient.invalidateQueries({ queryKey: ["produtos", id] });
  };

  const handleDownloadClientesTemplate = () => {
    downloadClientesTemplate();
    toast.success("Download iniciado. O arquivo template foi baixado com sucesso!");
  };

  const handleImportClientes = async (clientes: ClienteImportRow[]) => {
    if (!id) {
      throw new Error("Empresa não identificada");
    }

    try {
      const clientesData = clientes.map((cliente) => ({
        nome: cliente.nome,
        cnpjf: cliente.cnpjf,
        email: cliente.email,
        celular: cliente.celular,
        empresa_id: id,
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
          .eq("empresa_id", id)
          .order("created_at", { ascending: false })
          .limit(clientesData.length);

        if (pessoasInseridas) {
          const enderecosData = clientesComEndereco
            .map((cliente) => {
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

      queryClient.invalidateQueries({ queryKey: ["pessoas", id] });
      toast.success(`${clientes.length} cliente(s) importado(s) com sucesso!`);
    } catch (error) {
      console.error("Erro ao importar clientes:", error);
      throw error;
    }
  };

  if (isLoadingEmpresa) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!empresa) {
    return (
      <DashboardLayout>
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Empresa não encontrada</p>
          <Button onClick={() => navigate("/admin/empresas")} className="mt-4">
            Voltar
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/admin/empresas">Empresas</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{empresa.fantasia}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin/empresas")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <h1 className="text-3xl font-bold">{empresa.fantasia}</h1>
              <Badge variant={empresa.ativo ? "default" : "secondary"}>
                {empresa.ativo ? "Ativa" : "Inativa"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Cards de Estatísticas - Primeira linha */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Clientes
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pessoas?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Clientes cadastrados
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Produtos
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {produtos?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Produtos ativos
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Pedidos
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pedidos?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Pedidos realizados
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Conversas Ativas
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {jornadas?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Jornadas registradas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Cards de Estatísticas - Segunda linha */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Vendas do Mês
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(vendasMesAtual || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total de vendas no mês atual
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="aplicativos">Aplicativos</TabsTrigger>
            <TabsTrigger value="produtos">Produtos</TabsTrigger>
            <TabsTrigger value="clientes">Clientes</TabsTrigger>
            <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
            <TabsTrigger value="usuarios">Usuários</TabsTrigger>
            <TabsTrigger value="api-tokens">
              <Key className="h-4 w-4 mr-2" />
              API Tokens
            </TabsTrigger>
            {isAdminMaster && (
              <TabsTrigger value="parametros">
                <Settings className="h-4 w-4 mr-2" />
                Parâmetros
              </TabsTrigger>
            )}
          </TabsList>

          {/* Aba Informações */}
          <TabsContent value="info">
            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Dados Cadastrais</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEmpresaDialogOpen(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Razão Social</p>
                    <p className="text-base">{empresa.razao_social}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">CNPJ</p>
                    <p className="text-base">{empresa.cnpj}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Cidade</p>
                    <p className="text-base">{empresa.cidade || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Endereço</p>
                    <p className="text-base">{empresa.endereco || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">WhatsApp</p>
                    <p className="text-base">{empresa.whatsapp || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Celular</p>
                    <p className="text-base">{empresa.celular || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Domínio</p>
                    <p className="text-base">{empresa.dominio || "-"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Aplicativos */}
          <TabsContent value="aplicativos">
            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Aplicativos</CardTitle>
                <Button size="sm" onClick={handleCreateAplicativo}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Aplicativo
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingAplicativos ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  </div>
                ) : aplicativos && aplicativos.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Contato</TableHead>
                        <TableHead>ID Meta</TableHead>
                        <TableHead>ID WhatsApp</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {aplicativos.map((aplicativo) => (
                        <TableRow key={aplicativo.id}>
                          <TableCell className="font-medium">{aplicativo.nome}</TableCell>
                          <TableCell>{aplicativo.contato || "-"}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {aplicativo.meta_id || "-"}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {aplicativo.whatsapp_id || "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={aplicativo.ativo ? "default" : "secondary"}>
                              {aplicativo.ativo ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditAplicativo(aplicativo)}
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
                    Nenhum aplicativo cadastrado
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Produtos */}
          <TabsContent value="produtos">
            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Produtos da Empresa</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleDownloadTemplate}>
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Modelo
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsImportProdutosDialogOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Importar Produtos
                  </Button>
                  <Button size="sm" onClick={handleCreateProduto}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Produto
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingProdutos ? (
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
                              onClick={() => handleEditProduto(produto)}
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
                    Nenhum produto cadastrado
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Clientes */}
          <TabsContent value="clientes">
            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Clientes (Pessoas)</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleDownloadClientesTemplate}>
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Modelo
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsImportClientesDialogOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Importar Clientes
                  </Button>
                  <Button size="sm" onClick={handleCreatePessoa}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Cliente
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingPessoas ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  </div>
                ) : pessoas && pessoas.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>E-mail</TableHead>
                        <TableHead>Celular</TableHead>
                        <TableHead>CNPJ/CPF</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pessoas.map((pessoa) => (
                        <TableRow key={pessoa.id}>
                          <TableCell className="font-medium">{pessoa.nome}</TableCell>
                          <TableCell>{pessoa.email || "-"}</TableCell>
                          <TableCell>{pessoa.celular || "-"}</TableCell>
                          <TableCell>{pessoa.cnpjf || "-"}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditPessoa(pessoa)}
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
                    Nenhum cliente cadastrado
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Pedidos */}
          <TabsContent value="pedidos">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingPedidos ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  </div>
                ) : pedidos && pedidos.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Valor Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pedidos.map((pedido) => {
                        const getStatusColor = (status: string) => {
                          const statusMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
                            pending: "secondary",
                            processing: "default",
                            completed: "outline",
                            cancelled: "destructive",
                          };
                          return statusMap[status] || "secondary";
                        };

                        const getStatusLabel = (status: string) => {
                          const labelMap: Record<string, string> = {
                            pending: "Pendente",
                            processing: "Em Processamento",
                            completed: "Concluído",
                            cancelled: "Cancelado",
                          };
                          return labelMap[status] || status;
                        };

                        return (
                          <TableRow key={pedido.id}>
                            <TableCell className="font-medium">
                              {(pedido.pessoas as any)?.nome || "-"}
                            </TableCell>
                            <TableCell>
                              {new Date(pedido.created_at).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}
                            </TableCell>
                            <TableCell>
                              R$ {Number(pedido.total || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusColor(pedido.status)}>
                                {getStatusLabel(pedido.status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedPedidoId(pedido.id)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Detalhes
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    Nenhum pedido cadastrado
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Usuários */}
          <TabsContent value="usuarios">
            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Usuários da Empresa</CardTitle>
                <Button size="sm" onClick={() => setIsUsuarioDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Usuário
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingUsuarios ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  </div>
                ) : usuarios && usuarios.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>E-mail</TableHead>
                        <TableHead>Roles</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usuarios.map((usuario) => (
                        <TableRow key={usuario.id}>
                          <TableCell className="font-medium">{usuario.nome}</TableCell>
                          <TableCell>{usuario.email}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {usuario.roles.map((role: string) => (
                                <Badge key={role} variant="outline">
                                  {role}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={usuario.ativo ? "default" : "secondary"}>
                              {usuario.ativo ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    Nenhum usuário vinculado
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba API Tokens */}
          <TabsContent value="api-tokens">
            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>API Tokens</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Gerencie tokens de acesso aos webhooks da empresa
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsApiDocOpen(true)}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Ver Documentação
                  </Button>
                  <Button size="sm" onClick={() => setIsApiTokenDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Token
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingApiTokens ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  </div>
                ) : apiTokens && apiTokens.length > 0 ? (
                  <div className="space-y-4">
                    <div className="bg-muted/50 border border-muted rounded-lg p-4 space-y-2">
                      <h4 className="font-semibold text-sm">Endpoints Disponíveis:</h4>
                      <div className="space-y-1 text-sm font-mono">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-green-500/10 text-green-700">POST</Badge>
                          <code className="text-xs">https://hybuoksgodflxjhjoufv.supabase.co/functions/v1/webhook-produtos</code>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-700">PUT</Badge>
                          <code className="text-xs">https://hybuoksgodflxjhjoufv.supabase.co/functions/v1/webhook-produtos</code>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-green-500/10 text-green-700">POST</Badge>
                          <code className="text-xs">https://hybuoksgodflxjhjoufv.supabase.co/functions/v1/webhook-pessoas</code>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-700">PUT</Badge>
                          <code className="text-xs">https://hybuoksgodflxjhjoufv.supabase.co/functions/v1/webhook-pessoas</code>
                        </div>
                      </div>
                    </div>
                    
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Token</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Criado em</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {apiTokens.map((token) => (
                          <TableRow key={token.id}>
                            <TableCell className="font-medium">{token.descricao}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <code className="text-xs bg-muted px-2 py-1 rounded">
                                  {token.token.substring(0, 20)}...
                                </code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopyToken(token.token)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={token.ativo ? "default" : "secondary"}>
                                {token.ativo ? "Ativo" : "Inativo"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(token.created_at).toLocaleDateString("pt-BR")}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleToken(token.id, token.ativo)}
                                >
                                  {token.ativo ? "Desativar" : "Ativar"}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteToken(token.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    Nenhum token criado ainda
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Parâmetros - Visível apenas para Admin Master */}
          {isAdminMaster && (
            <TabsContent value="parametros" className="space-y-4">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Parâmetros Financeiros</CardTitle>
                  <CardDescription>
                    Configure os valores cobrados do cliente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const taxaTransacao = formData.get("taxa_transacao");
                      const valorMensal = formData.get("valor_mensal");

                      updateEmpresa({
                        taxa_transacao: taxaTransacao ? Number(taxaTransacao) : 0,
                        valor_mensal: valorMensal ? Number(valorMensal) : 0,
                      });
                    }}
                    className="space-y-4"
                  >
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label htmlFor="taxa_transacao" className="text-sm font-medium">
                          Taxa de Transação (%)
                        </label>
                        <Input
                          id="taxa_transacao"
                          name="taxa_transacao"
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          defaultValue={empresa?.taxa_transacao || 0}
                          placeholder="0.00"
                        />
                        <p className="text-xs text-muted-foreground">
                          Percentual cobrado por transação
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="valor_mensal" className="text-sm font-medium">
                          Valor Mensal (R$)
                        </label>
                        <Input
                          id="valor_mensal"
                          name="valor_mensal"
                          type="number"
                          step="0.01"
                          min="0"
                          defaultValue={empresa?.valor_mensal || 0}
                          placeholder="0.00"
                        />
                        <p className="text-xs text-muted-foreground">
                          Valor fixo cobrado mensalmente
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveTab("info")}
                        disabled={updateEmpresaMutation.isPending}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={updateEmpresaMutation.isPending}>
                        {updateEmpresaMutation.isPending ? "Salvando..." : "Salvar"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>

      <EmpresaDialog
        open={isEmpresaDialogOpen}
        onOpenChange={setIsEmpresaDialogOpen}
        onSave={handleSaveEmpresa}
        empresa={empresa}
      />

      <ProdutoDialog
        open={isProdutoDialogOpen}
        onOpenChange={setIsProdutoDialogOpen}
        produto={selectedProduto}
        onSave={handleSaveProduto}
        isLoading={createProdutoMutation.isPending || updateProdutoMutation.isPending}
      />

      <ImportProdutosDialog
        open={isImportProdutosDialogOpen}
        onOpenChange={setIsImportProdutosDialogOpen}
        onImport={handleImportProdutos}
      />

      <PessoaDialog
        open={isPessoaDialogOpen}
        onOpenChange={setIsPessoaDialogOpen}
        pessoa={selectedPessoa}
        onSave={handleSavePessoa}
        isLoading={createPessoaMutation.isPending || updatePessoaMutation.isPending}
      />

      <ImportClientesDialog
        open={isImportClientesDialogOpen}
        onOpenChange={setIsImportClientesDialogOpen}
        onImport={handleImportClientes}
      />

      <UsuarioDialog
        open={isUsuarioDialogOpen}
        onOpenChange={setIsUsuarioDialogOpen}
        empresaId={id}
      />

      <AplicativoDialog
        open={isAplicativoDialogOpen}
        onOpenChange={setIsAplicativoDialogOpen}
        aplicativo={selectedAplicativo}
        onSave={handleSaveAplicativo}
        isLoading={createAplicativoMutation.isPending || updateAplicativoMutation.isPending}
      />

      <ApiTokenDialog
        open={isApiTokenDialogOpen}
        onOpenChange={setIsApiTokenDialogOpen}
        onSave={handleSaveApiToken}
      />

      <ApiDocumentation
        open={isApiDocOpen}
        onOpenChange={setIsApiDocOpen}
        baseUrl={`${import.meta.env.VITE_SUPABASE_URL}/functions/v1`}
      />

      {/* Dialog de Detalhes do Pedido */}
      <Dialog open={!!selectedPedidoId} onOpenChange={() => setSelectedPedidoId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
            {selectedPedidoId && pedidos && (() => {
              const pedido = pedidos.find((p) => p.id === selectedPedidoId);
              if (!pedido) return null;

              const getStatusLabel = (status: string) => {
                const labelMap: Record<string, string> = {
                  pending: "Pendente",
                  processing: "Em Processamento",
                  completed: "Concluído",
                  cancelled: "Cancelado",
                };
                return labelMap[status] || status;
              };

              const getStatusColor = (status: string) => {
                const statusMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
                  pending: "secondary",
                  processing: "default",
                  completed: "outline",
                  cancelled: "destructive",
                };
                return statusMap[status] || "secondary";
              };

              return (
                <div className="space-y-6">
                  {/* Informações do Cliente */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Cliente</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Nome</p>
                        <p className="font-medium">{(pedido.pessoas as any)?.nome || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">CPF/CNPJ</p>
                        <p className="font-medium">{(pedido.pessoas as any)?.cnpjf || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{(pedido.pessoas as any)?.email || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Celular</p>
                        <p className="font-medium">{(pedido.pessoas as any)?.celular || "-"}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Informações do Pedido */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Pedido</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Data do Pedido</p>
                        <p className="font-medium">
                          {new Date(pedido.created_at).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge variant={getStatusColor(pedido.status)}>
                          {getStatusLabel(pedido.status)}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Valor Total</p>
                        <p className="text-xl font-bold text-primary">
                          R$ {Number(pedido.total || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Endereço de Entrega */}
                  {pedido.pessoa_enderecos && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Endereço de Entrega</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <p className="text-sm text-muted-foreground">Endereço</p>
                            <p className="font-medium">{(pedido.pessoa_enderecos as any)?.endereco || "-"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Complemento</p>
                            <p className="font-medium">{(pedido.pessoa_enderecos as any)?.complemento || "-"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Bairro</p>
                            <p className="font-medium">{(pedido.pessoa_enderecos as any)?.bairro || "-"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Cidade</p>
                            <p className="font-medium">{(pedido.pessoa_enderecos as any)?.cidade || "-"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">CEP</p>
                            <p className="font-medium">{(pedido.pessoa_enderecos as any)?.cep || "-"}</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Observações */}
                  {pedido.observacoes && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Observações</h3>
                        <p className="text-sm">{pedido.observacoes}</p>
                      </div>
                    </>
                  )}

                  <Separator />

                  {/* Itens do Pedido */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Itens do Pedido</h3>
                    {pedidoItens && pedidoItens.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Produto</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead className="text-right">Qtd</TableHead>
                            <TableHead className="text-right">Valor Unit.</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pedidoItens.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{(item.produtos as any)?.descricao || "-"}</p>
                                  {(item.produtos as any)?.unidade && (
                                    <p className="text-xs text-muted-foreground">
                                      Unidade: {(item.produtos as any).unidade}
                                    </p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {(item.produtos as any)?.sku || "-"}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {Number(item.quantidade).toLocaleString("pt-BR")}
                              </TableCell>
                              <TableCell className="text-right">
                                R$ {Number(item.valor_unitario || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                R$ {Number(item.valor_total || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhum item encontrado para este pedido
                      </p>
                    )}
                  </div>
                </div>
              );
            })()}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
