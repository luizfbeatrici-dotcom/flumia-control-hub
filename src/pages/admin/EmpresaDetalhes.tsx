import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Edit, Plus, Users, Package, ShoppingCart, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { EmpresaDialog } from "@/components/admin/EmpresaDialog";
import { ProdutoDialog } from "@/components/company/ProdutoDialog";
import { UsuarioDialog } from "@/components/admin/UsuarioDialog";
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
  const [activeTab, setActiveTab] = useState("info");
  const [isEmpresaDialogOpen, setIsEmpresaDialogOpen] = useState(false);
  const [isProdutoDialogOpen, setIsProdutoDialogOpen] = useState(false);
  const [isUsuarioDialogOpen, setIsUsuarioDialogOpen] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<any>(null);

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
          pessoas:pessoa_id(nome)
        `)
        .eq("empresa_id", id)
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

  const handleSaveEmpresa = (data: any) => {
    updateEmpresaMutation.mutate({ id: id!, data });
  };

  const handleSaveProduto = async (data: any) => {
    if (selectedProduto) {
      await updateProdutoMutation.mutateAsync({ produtoId: selectedProduto.id, data });
    } else {
      await createProdutoMutation.mutateAsync(data);
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

        {/* Cards de Estatísticas */}
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

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="produtos">Produtos</TabsTrigger>
            <TabsTrigger value="clientes">Clientes</TabsTrigger>
            <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
            <TabsTrigger value="usuarios">Usuários</TabsTrigger>
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

          {/* Aba Produtos */}
          <TabsContent value="produtos">
            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Produtos da Empresa</CardTitle>
                <Button size="sm" onClick={handleCreateProduto}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Produto
                </Button>
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
              <CardHeader>
                <CardTitle>Clientes (Pessoas)</CardTitle>
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
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pessoas.map((pessoa) => (
                        <TableRow key={pessoa.id}>
                          <TableCell className="font-medium">{pessoa.nome}</TableCell>
                          <TableCell>{pessoa.email || "-"}</TableCell>
                          <TableCell>{pessoa.celular || "-"}</TableCell>
                          <TableCell>{pessoa.cnpjf || "-"}</TableCell>
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
                        <TableHead>Status</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pedidos.map((pedido) => (
                        <TableRow key={pedido.id}>
                          <TableCell className="font-medium">
                            {(pedido.pessoas as any)?.nome || "-"}
                          </TableCell>
                          <TableCell>
                            <Badge>{pedido.status}</Badge>
                          </TableCell>
                          <TableCell>
                            R$ {Number(pedido.total || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>
                            {new Date(pedido.created_at).toLocaleDateString("pt-BR")}
                          </TableCell>
                        </TableRow>
                      ))}
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

      <UsuarioDialog
        open={isUsuarioDialogOpen}
        onOpenChange={setIsUsuarioDialogOpen}
        empresaId={id}
      />
    </DashboardLayout>
  );
}
