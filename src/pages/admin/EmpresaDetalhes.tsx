import { useState, useMemo } from "react";
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
import { ArrowLeft, Edit, Plus, Users, Package, ShoppingCart, MessageSquare, Smartphone, Key, Copy, Trash2, BookOpen, Download, Upload, Eye, Settings, Phone, CreditCard, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { formatDateFromDB } from "@/lib/dateUtils";
import { EmpresaDialog } from "@/components/admin/EmpresaDialog";
import { ProdutoDialog } from "@/components/company/ProdutoDialog";
import { ImportProdutosDialog } from "@/components/company/ImportProdutosDialog";
import { PessoaDialog } from "@/components/company/PessoaDialog";
import { UsuarioDialog } from "@/components/admin/UsuarioDialog";
import { AplicativoDialog } from "@/components/admin/AplicativoDialog";
import { ApiTokenDialog } from "@/components/admin/ApiTokenDialog";
import { ApiDocumentation } from "@/components/admin/ApiDocumentation";
import { EmpresaTiposEntregaTab } from "@/components/admin/EmpresaTiposEntregaTab";
import { downloadProdutosTemplate, ProdutoImportRow } from "@/lib/excelUtils";
import { downloadClientesTemplate, ClienteImportRow } from "@/lib/excelUtilsClientes";
import { ImportClientesDialog } from "@/components/company/ImportClientesDialog";
import { MercadoPagoDialog } from "@/components/admin/MercadoPagoDialog";
import { useAuth } from "@/hooks/useAuth";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SalesFunnelWidget } from "@/components/company/SalesFunnelWidget";

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
  const [isMercadoPagoDialogOpen, setIsMercadoPagoDialogOpen] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<any>(null);
  const [selectedPessoa, setSelectedPessoa] = useState<any>(null);
  const [selectedAplicativo, setSelectedAplicativo] = useState<any>(null);
  const [selectedPedidoId, setSelectedPedidoId] = useState<string | null>(null);
  const [selectedMercadoPagoTipo, setSelectedMercadoPagoTipo] = useState<"test" | "prod">("test");
  
  // Filtros para contatos
  const [filterEtapa, setFilterEtapa] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCriadoEm, setFilterCriadoEm] = useState<string>("");
  const [filterUltimaAtualizacao, setFilterUltimaAtualizacao] = useState<string>("");

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

  // Fetch produtos com estoque
  const { data: produtos, isLoading: isLoadingProdutos } = useQuery({
    queryKey: ["produtos", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("produtos")
        .select(`
          *,
          estoque (
            saldo,
            saldo_minimo,
            saldo_maximo
          )
        `)
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

  // Fetch Mercado Pago configs
  const { data: mercadoPagoConfigs, isLoading: isLoadingMercadoPagoConfigs } = useQuery({
    queryKey: ["mercadopago-configs", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mercadopago_config")
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
          pessoas:pessoa_id(nome, cnpjf, celular, email),
          pessoa_enderecos:endereco_id(endereco, complemento, bairro, cidade, cep),
          pagamentos (status, date_approved, date_last_updated, date_created),
          contatos:contato_id(name, whatsapp_from, etapas:etapa_id(nome, descricao))
        `)
        .eq("empresa_id", id)
        .order("numero", { ascending: false });
      if (error) throw error;
      
      return data?.map(pedido => ({
        ...pedido,
        etapa: (pedido.contatos as any)?.etapas
      }));
    },
  });

  // Fetch contatos com etapas
  const { data: contatos, isLoading: isLoadingContatos } = useQuery({
    queryKey: ["contatos", id],
    queryFn: async () => {
      // Buscar contatos
      const { data: contatosData, error: contatosError } = await supabase
        .from("contatos")
        .select("*")
        .eq("empresa_id", id)
        .order("created_at", { ascending: false });
      
      if (contatosError) throw contatosError;
      if (!contatosData) return [];

      // Buscar pessoas relacionadas
      const pessoaIds = contatosData
        .map(c => c.pessoa_id)
        .filter(Boolean);
      
      const { data: pessoasData } = await supabase
        .from("pessoas")
        .select("id, nome, cnpjf, celular, email")
        .in("id", pessoaIds);

      // Buscar etapas relacionadas
      const etapaIds = [
        ...contatosData.map(c => c.etapa_id),
        ...contatosData.map(c => c.etapa_old_id)
      ].filter(Boolean);

      const { data: etapasData } = await supabase
        .from("etapas")
        .select("id, nome")
        .in("id", etapaIds);

      // Combinar os dados
      return contatosData.map(contato => ({
        ...contato,
        pessoas: pessoasData?.find(p => p.id === contato.pessoa_id),
        etapa_atual: etapasData?.find(e => e.id === contato.etapa_id),
        etapa_anterior: etapasData?.find(e => e.id === contato.etapa_old_id)
      }));
    },
  });

  // Fetch etapas para o filtro
  const { data: etapas } = useQuery({
    queryKey: ["etapas", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("etapas")
        .select("*")
        .eq("ativo", true)
        .order("ordem", { ascending: true }) as any;
      if (error) throw error;
      return data;
    },
  });

  // Filtrar contatos
  const contatosFiltrados = useMemo(() => {
    if (!contatos) return [];
    
    return contatos.filter((contato) => {
      // Filtro por etapa
      if (filterEtapa && filterEtapa !== "all" && contato.etapa_id !== filterEtapa) {
        return false;
      }
      
      // Filtro por status
      if (filterStatus && filterStatus !== "all" && contato.status !== filterStatus) {
        return false;
      }
      
      // Filtro por data de criação
      if (filterCriadoEm) {
        const contatoDate = new Date(contato.created_at).toISOString().split('T')[0];
        if (contatoDate !== filterCriadoEm) {
          return false;
        }
      }
      
      // Filtro por última atualização
      if (filterUltimaAtualizacao) {
        const contatoDate = new Date(contato.updated_at).toISOString().split('T')[0];
        if (contatoDate !== filterUltimaAtualizacao) {
          return false;
        }
      }
      
      return true;
    });
  }, [contatos, filterEtapa, filterStatus, filterCriadoEm, filterUltimaAtualizacao]);

  // Obter lista única de status
  const statusList = useMemo(() => {
    if (!contatos) return [];
    const statusSet = new Set(contatos.map(c => c.status).filter(Boolean));
    return Array.from(statusSet).sort();
  }, [contatos]);

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

  // Fetch conversas ativas (contatos com status ativo)
  const { data: conversasAtivasCount } = useQuery({
    queryKey: ["conversas-ativas", id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("contatos")
        .select("*", { count: "exact", head: true })
        .eq("empresa_id", id)
        .eq("status", "ativo");
      if (error) throw error;
      return count;
    },
  });

  // Fetch planos
  const { data: planos } = useQuery({
    queryKey: ["planos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("planos")
        .select("*")
        .order("created_at", { ascending: false });
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
      const { saldo, saldo_minimo, saldo_maximo, ...produtoData } = data;
      
      const { data: produtoResult, error: produtoError } = await supabase
        .from("produtos")
        .insert({
          ...produtoData,
          empresa_id: id,
        })
        .select()
        .single();
      
      if (produtoError) throw produtoError;
      
      // Criar registro de estoque
      if (produtoResult) {
        const { error: estoqueError } = await supabase
          .from("estoque")
          .insert({
            produto_id: produtoResult.id,
            empresa_id: id,
            saldo: saldo || 0,
            saldo_minimo: saldo_minimo || 0,
            saldo_maximo: saldo_maximo || null,
          });
        
        if (estoqueError) throw estoqueError;
      }
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
      const { saldo, saldo_minimo, saldo_maximo, ...produtoData } = data;
      
      const { error: produtoError } = await supabase
        .from("produtos")
        .update(produtoData)
        .eq("id", produtoId)
        .eq("empresa_id", id);
      
      if (produtoError) throw produtoError;
      
      // Verificar se existe registro de estoque
      const { data: estoqueExistente } = await supabase
        .from("estoque")
        .select("id")
        .eq("produto_id", produtoId)
        .eq("empresa_id", id)
        .maybeSingle();
      
      if (estoqueExistente) {
        // Atualizar estoque existente
        const { error: estoqueError } = await supabase
          .from("estoque")
          .update({
            saldo: saldo || 0,
            saldo_minimo: saldo_minimo || 0,
            saldo_maximo: saldo_maximo || null,
          })
          .eq("produto_id", produtoId)
          .eq("empresa_id", id);
        
        if (estoqueError) throw estoqueError;
      } else {
        // Criar novo registro de estoque
        const { error: estoqueError } = await supabase
          .from("estoque")
          .insert({
            produto_id: produtoId,
            empresa_id: id,
            saldo: saldo || 0,
            saldo_minimo: saldo_minimo || 0,
            saldo_maximo: saldo_maximo || null,
          });
        
        if (estoqueError) throw estoqueError;
      }
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

  // Mercado Pago mutations
  const createMercadoPagoConfigMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("mercadopago_config").insert({
        ...data,
        empresa_id: id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mercadopago-configs", id] });
      toast.success("Configuração do Mercado Pago criada com sucesso!");
      setIsMercadoPagoDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar configuração");
    },
  });

  const updateMercadoPagoConfigMutation = useMutation({
    mutationFn: async ({ configId, data }: { configId: string; data: any }) => {
      const { error } = await supabase
        .from("mercadopago_config")
        .update(data)
        .eq("id", configId)
        .eq("empresa_id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mercadopago-configs", id] });
      toast.success("Configuração do Mercado Pago atualizada com sucesso!");
      setIsMercadoPagoDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar configuração");
    },
  });

  const handleSaveMercadoPagoConfig = async (data: any) => {
    const existingConfig = mercadoPagoConfigs?.find(
      (c: any) => c.tipo === selectedMercadoPagoTipo
    );
    
    if (existingConfig) {
      await updateMercadoPagoConfigMutation.mutateAsync({ 
        configId: existingConfig.id, 
        data 
      });
    } else {
      await createMercadoPagoConfigMutation.mutateAsync(data);
    }
  };

  const handleEditMercadoPagoConfig = (tipo: "test" | "prod") => {
    setSelectedMercadoPagoTipo(tipo);
    setIsMercadoPagoDialogOpen(true);
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
                {conversasAtivasCount || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Contatos com status ativo
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

        {/* Widget de Funil de Vendas */}
        <SalesFunnelWidget empresaId={id!} />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="aplicativos">Aplicativos</TabsTrigger>
            <TabsTrigger value="produtos">Produtos</TabsTrigger>
            <TabsTrigger value="clientes">Clientes</TabsTrigger>
            <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
            <TabsTrigger value="contatos">
              <Phone className="h-4 w-4 mr-2" />
              Contatos
            </TabsTrigger>
            <TabsTrigger value="usuarios">Usuários</TabsTrigger>
            <TabsTrigger value="api-tokens">
              <Key className="h-4 w-4 mr-2" />
              API Tokens
            </TabsTrigger>
            <TabsTrigger value="mercadopago">
              <CreditCard className="h-4 w-4 mr-2" />
              Mercado Pago
            </TabsTrigger>
            <TabsTrigger value="entregas">Tipos de Entrega</TabsTrigger>
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
                    {empresa.whatsapp ? (
                      <a 
                        href={`https://wa.me/${empresa.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base text-primary hover:underline cursor-pointer"
                      >
                        {empresa.whatsapp}
                      </a>
                    ) : (
                      <p className="text-base">-</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Celular</p>
                    {empresa.celular ? (
                      <a 
                        href={`https://wa.me/${empresa.celular.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base text-primary hover:underline cursor-pointer"
                      >
                        {empresa.celular}
                      </a>
                    ) : (
                      <p className="text-base">-</p>
                    )}
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
                        <TableHead>Saldo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {produtos.map((produto) => {
                        const estoqueData = Array.isArray(produto.estoque) ? produto.estoque[0] : produto.estoque;
                        const saldo = estoqueData?.saldo || 0;
                        return (
                          <TableRow key={produto.id}>
                            <TableCell className="font-medium">{produto.descricao}</TableCell>
                            <TableCell>{produto.sku || "-"}</TableCell>
                            <TableCell>{produto.categoria || "-"}</TableCell>
                            <TableCell>
                              R$ {Number(produto.preco1 || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell>
                              <span className={saldo <= 0 ? "text-destructive font-medium" : ""}>
                                {Number(saldo).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </span>
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
                        );
                      })}
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
                        <TableHead>Nº Pedido</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Valor Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Etapa</TableHead>
                        <TableHead>Finalizado em</TableHead>
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
                              #{pedido.numero}
                            </TableCell>
                            <TableCell className="font-medium">
                              {(pedido.pessoas as any)?.nome || "-"}
                            </TableCell>
                            <TableCell>
                              {formatDateFromDB(pedido.created_at)}
                            </TableCell>
                            <TableCell>
                              R$ {Number(pedido.total || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusColor(pedido.status)}>
                                {getStatusLabel(pedido.status)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {(pedido as any).etapa?.nome || (pedido as any).etapa?.descricao || "-"}
                            </TableCell>
                            <TableCell>
                              {pedido.finalizado_em
                                ? {formatDateFromDB(pedido.finalizado_em)}
                                : "-"}
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
                    <div className="bg-muted/50 border border-muted rounded-lg p-4 space-y-3">
                      <h4 className="font-semibold text-sm">Endpoints Disponíveis:</h4>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Produtos:</p>
                          <div className="space-y-1 text-sm font-mono pl-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-purple-500/10 text-purple-700">GET</Badge>
                              <code className="text-xs">https://flum.ia/api/v1/produtos</code>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-green-500/10 text-green-700">POST</Badge>
                              <code className="text-xs">https://flum.ia/api/v1/produtos</code>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-blue-500/10 text-blue-700">PUT</Badge>
                              <code className="text-xs">https://flum.ia/api/v1/produtos</code>
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Pessoas:</p>
                          <div className="space-y-1 text-sm font-mono pl-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-purple-500/10 text-purple-700">GET</Badge>
                              <code className="text-xs">https://flum.ia/api/v1/pessoas</code>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-green-500/10 text-green-700">POST</Badge>
                              <code className="text-xs">https://flum.ia/api/v1/pessoas</code>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-blue-500/10 text-blue-700">PUT</Badge>
                              <code className="text-xs">https://flum.ia/api/v1/pessoas</code>
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Pedidos:</p>
                          <div className="space-y-1 text-sm font-mono pl-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-purple-500/10 text-purple-700">GET</Badge>
                              <code className="text-xs">https://flum.ia/api/v1/pedidos</code>
                            </div>
                          </div>
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

          {/* Aba Contatos */}
          <TabsContent value="contatos">
            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Contatos da Empresa</CardTitle>
                  <CardDescription>
                    Histórico de contatos registrados
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => queryClient.invalidateQueries({ queryKey: ["contatos", id] })}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
              </CardHeader>
              <CardContent>
                {/* Filtros */}
                <div className="mb-6 grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Etapa</label>
                    <Select value={filterEtapa} onValueChange={setFilterEtapa}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {etapas?.map((etapa) => (
                          <SelectItem key={etapa.id} value={etapa.id}>
                            {etapa.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {statusList.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Criado em</label>
                    <Input
                      type="date"
                      value={filterCriadoEm}
                      onChange={(e) => setFilterCriadoEm(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Última Atualização</label>
                    <Input
                      type="date"
                      value={filterUltimaAtualizacao}
                      onChange={(e) => setFilterUltimaAtualizacao(e.target.value)}
                    />
                  </div>
                </div>

                {isLoadingContatos ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  </div>
                ) : contatosFiltrados && contatosFiltrados.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>WhatsApp</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Etapa</TableHead>
                        <TableHead>Etapa Anterior</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Criado em</TableHead>
                        <TableHead>Última Atualização</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contatosFiltrados.map((contato) => (
                        <TableRow key={contato.id}>
                          <TableCell className="font-medium">{contato.name || "-"}</TableCell>
                          <TableCell className="font-mono text-xs">{contato.whatsapp_from}</TableCell>
                          <TableCell>
                            {contato.pessoas?.nome || "-"}
                          </TableCell>
                          <TableCell>
                            {contato.etapa_atual?.nome || "-"}
                          </TableCell>
                          <TableCell>
                            {contato.etapa_anterior?.nome || "-"}
                          </TableCell>
                          <TableCell>
                            {contato.status || "-"}
                          </TableCell>
                          <TableCell>
                            {new Date(contato.created_at).toLocaleString("pt-BR")}
                          </TableCell>
                          <TableCell>
                            {new Date(contato.updated_at).toLocaleString("pt-BR")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    Nenhum contato registrado
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Mercado Pago */}
          <TabsContent value="mercadopago" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Configuração de Teste */}
              <Card className="shadow-soft">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Ambiente de Teste</CardTitle>
                    <CardDescription>
                      Configurações para testes do Mercado Pago
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">Test</Badge>
                </CardHeader>
                <CardContent>
                  {isLoadingMercadoPagoConfigs ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    </div>
                  ) : mercadoPagoConfigs?.find((c: any) => c.tipo === "test") ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Public Key</p>
                        <p className="text-sm font-mono truncate">
                          {mercadoPagoConfigs.find((c: any) => c.tipo === "test")?.public_key}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">URL da API</p>
                        <p className="text-sm truncate">
                          {mercadoPagoConfigs.find((c: any) => c.tipo === "test")?.url}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleEditMercadoPagoConfig("test")}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar Configuração
                      </Button>
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-sm text-muted-foreground mb-4">
                        Nenhuma configuração de teste cadastrada
                      </p>
                      <Button
                        size="sm"
                        onClick={() => handleEditMercadoPagoConfig("test")}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Configurar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Configuração de Produção */}
              <Card className="shadow-soft">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Ambiente de Produção</CardTitle>
                    <CardDescription>
                      Configurações para produção do Mercado Pago
                    </CardDescription>
                  </div>
                  <Badge>Prod</Badge>
                </CardHeader>
                <CardContent>
                  {isLoadingMercadoPagoConfigs ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    </div>
                  ) : mercadoPagoConfigs?.find((c: any) => c.tipo === "prod") ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Public Key</p>
                        <p className="text-sm font-mono truncate">
                          {mercadoPagoConfigs.find((c: any) => c.tipo === "prod")?.public_key}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">URL da API</p>
                        <p className="text-sm truncate">
                          {mercadoPagoConfigs.find((c: any) => c.tipo === "prod")?.url}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleEditMercadoPagoConfig("prod")}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar Configuração
                      </Button>
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-sm text-muted-foreground mb-4">
                        Nenhuma configuração de produção cadastrada
                      </p>
                      <Button
                        size="sm"
                        onClick={() => handleEditMercadoPagoConfig("prod")}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Configurar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Aba Tipos de Entrega */}
          <TabsContent value="entregas" className="space-y-4">
            <EmpresaTiposEntregaTab empresaId={id!} />
          </TabsContent>

          {/* Aba Parâmetros - Visível apenas para Admin Master */}
          {isAdminMaster && (
            <TabsContent value="parametros" className="space-y-4">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Parâmetros</CardTitle>
                  <CardDescription>
                    Configure o plano da empresa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const planoId = formData.get("plano_id");

                      updateEmpresa({
                        plano_id: planoId || null,
                      });
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <label htmlFor="plano_id" className="text-sm font-medium">
                        Plano de Assinatura
                      </label>
                      <Select
                        name="plano_id"
                        value={empresa?.plano_id || undefined}
                        onValueChange={(value) => {
                          updateEmpresa({
                            plano_id: value || null,
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Nenhum plano selecionado" />
                        </SelectTrigger>
                        <SelectContent>
                          {planos && planos.length > 0 ? (
                            planos.map((plano: any) => (
                              <SelectItem key={plano.id} value={plano.id}>
                                {plano.nome} - R$ {Number(plano.valor_recorrente || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} ({plano.qtd_pedidos} pedidos)
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-plans" disabled>
                              Nenhum plano cadastrado
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Selecione o plano de assinatura da empresa
                      </p>
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
            <DialogTitle>Detalhes do Pedido #{pedidos?.find((p) => p.id === selectedPedidoId)?.numero}</DialogTitle>
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

                  {/* Informações do Contato */}
                  {pedido.contatos && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Contato</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Nome</p>
                            <p className="font-medium">{(pedido.contatos as any)?.name || "-"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Celular</p>
                            <p className="font-medium">{(pedido.contatos as any)?.whatsapp_from || "-"}</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <Separator />

                  {/* Informações do Pedido */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Pedido</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Data do Pedido</p>
                        <p className="font-medium">
                          {formatDateFromDB(pedido.created_at)}
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

                  {/* Informações de Pagamento */}
                  {pedido.pagamentos && pedido.pagamentos.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Pagamento</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <Badge variant={
                              (pedido.pagamentos[0] as any).status === 'approved' ? 'default' :
                              (pedido.pagamentos[0] as any).status === 'cancelled' ? 'destructive' :
                              (pedido.pagamentos[0] as any).status === 'rejected' ? 'destructive' :
                              'secondary'
                            }>
                              {(pedido.pagamentos[0] as any).status === 'pending' ? 'Pendente' :
                               (pedido.pagamentos[0] as any).status === 'approved' ? 'Aprovado' :
                               (pedido.pagamentos[0] as any).status === 'cancelled' ? 'Cancelado' :
                               (pedido.pagamentos[0] as any).status === 'rejected' ? 'Rejeitado' :
                               (pedido.pagamentos[0] as any).status}
                            </Badge>
                          </div>
                          {(pedido.pagamentos[0] as any).date_created && (
                            <div>
                              <p className="text-sm text-muted-foreground">Data de Criação</p>
                              <p className="font-medium">
                                {formatDateFromDB((pedido.pagamentos[0] as any).date_created)}
                              </p>
                            </div>
                          )}
                          {(pedido.pagamentos[0] as any).date_approved && (
                            <div>
                              <p className="text-sm text-muted-foreground">Data de Aprovação</p>
                              <p className="font-medium">
                                {formatDateFromDB((pedido.pagamentos[0] as any).date_approved)}
                              </p>
                            </div>
                          )}
                          {(pedido.pagamentos[0] as any).date_last_updated && (
                            <div>
                              <p className="text-sm text-muted-foreground">Última Atualização</p>
                              <p className="font-medium">
                                {formatDateFromDB((pedido.pagamentos[0] as any).date_last_updated)}
                              </p>
                            </div>
                          )}
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
                      <div className="space-y-4">
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
                        
                        {/* Resumo Financeiro */}
                        <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal (Produtos):</span>
                            <span className="font-medium">
                              R$ {pedidoItens.reduce((sum, item) => sum + Number(item.valor_total || 0), 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Frete:</span>
                            <span className="font-medium">
                              R$ {Number(pedido.vlr_frete || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <Separator />
                          <div className="flex justify-between text-lg font-bold">
                            <span>Total:</span>
                            <span className="text-primary">
                              R$ {Number(pedido.total || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      </div>
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

      <MercadoPagoDialog
        open={isMercadoPagoDialogOpen}
        onOpenChange={setIsMercadoPagoDialogOpen}
        config={mercadoPagoConfigs?.find((c: any) => c.tipo === selectedMercadoPagoTipo)}
        onSave={handleSaveMercadoPagoConfig}
        isLoading={createMercadoPagoConfigMutation.isPending || updateMercadoPagoConfigMutation.isPending}
      />
    </DashboardLayout>
  );
}
