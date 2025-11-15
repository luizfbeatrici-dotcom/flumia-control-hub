import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { 
  Bot, 
  ShoppingCart, 
  Database, 
  UserCheck, 
  Brain,
  Clock,
  CheckCircle2,
  XCircle,
  Check,
  X,
  MessageSquare,
  Quote
} from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import flumiaLogo from "@/assets/flumia-logo.png";
import heroAiBackground from "@/assets/hero-ai-background.png";
import withoutFlumia from "@/assets/without-flumia.png";
import withFlumia from "@/assets/with-flumia.png";
import whatsappNegociacaoProduto from "@/assets/whatsapp-negociacao-produto.jpg";
import whatsappResumoEntrega from "@/assets/whatsapp-resumo-entrega.jpg";
import whatsappBuscaRefinada from "@/assets/whatsapp-busca-refinada.jpg";
import whatsappDetalhesNegociacao from "@/assets/whatsapp-detalhes-negociacao.jpg";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { CookieConsent } from "@/components/CookieConsent";
import { trackVisitor, updateVisitorContact, startSessionTracking, trackEvent, trackSectionView } from "@/lib/visitorTracking";

const Index = () => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    mensagem: ""
  });

  const { user, isAdminMaster, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!authLoading && user) {
      navigate(isAdminMaster ? "/admin" : "/dashboard");
    }
  }, [authLoading, user, isAdminMaster, navigate]);

  // Rastreamento inicial de visitante e tracking da sessão
  useEffect(() => {
    const consent = localStorage.getItem("flumia_cookie_consent");
    if (consent === "accepted") {
      trackVisitor(true);
      startSessionTracking();
    } else if (consent === "declined") {
      trackVisitor(false);
    }
  }, []);

  // Intersection Observer para detectar visualização de seções
  useEffect(() => {
    const consent = localStorage.getItem("flumia_cookie_consent");
    if (consent !== "accepted") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            if (sectionId) {
              trackSectionView(sectionId);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    const sections = document.querySelectorAll('[data-section]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const handleCookieAccept = () => {
    trackVisitor(true);
    startSessionTracking();
  };

  const handleCookieDecline = () => {
    trackVisitor(false);
  };

  // Fetch plans from database
  const planosQuery = useQuery({
    queryKey: ["planos"],
    queryFn: async () => {
      const response = await (supabase as any)
        .from("planos")
        .select("*")
        .eq("exibir_landing_page", true)
        .order("valor_recorrente", { ascending: true });

      if (response.error) throw response.error;
      return response.data || [];
    },
  });
  
  const planos: any[] = planosQuery.data || [];

  // Fetch caracteristicas
  const { data: caracteristicas = [] } = useQuery({
    queryKey: ["caracteristicas"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("caracteristicas")
        .select("*")
        .eq("ativo", true)
        .order("ordem");
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch plano_caracteristicas
  const { data: planoCaracteristicas = [] } = useQuery({
    queryKey: ["plano_caracteristicas"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("plano_caracteristicas")
        .select("plano_id, caracteristica_id");
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch system settings for WhatsApp contact
  const { data: settings } = useQuery({
    queryKey: ["system-settings"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("system_settings")
        .select("*")
        .single();

      if (error) throw error;
      return data as any;
    },
  });

  // Fetch depoimentos
  const { data: depoimentos = [] } = useQuery({
    queryKey: ["depoimentos-landing"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("depoimentos")
        .select("*")
        .eq("ativo", true)
        .order("ordem", { ascending: true });

      if (error) throw error;
      return data as any[];
    },
  });

  // Fetch FAQs
  const { data: faqs = [] } = useQuery({
    queryKey: ["faqs-landing"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faqs")
        .select("*")
        .eq("ativo", true)
        .order("ordem", { ascending: true });

      if (error) throw error;
      return data as any[];
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Registra evento de envio de formulário
    trackEvent('form_submit', 'contact-form', 'Formulário de contato enviado');
    
    // Atualiza informações de contato do visitante
    await updateVisitorContact({
      nome: formData.nome,
      email: formData.email,
      telefone: formData.telefone,
      interesse: formData.mensagem,
    });
    
    toast.success("Mensagem enviada com sucesso! Entraremos em contato em breve.");
    setFormData({ nome: "", email: "", telefone: "", mensagem: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={flumiaLogo} alt="flum.ia Logo" className="h-8 w-8" />
            <span className="text-xl font-bold text-foreground">flum.ia</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a 
              href="#o-que-e" 
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              onClick={() => trackEvent('nav_click', 'nav-o-que-e', 'O que é')}
            >
              O que é
            </a>
            <a 
              href="#funcionalidades" 
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              onClick={() => trackEvent('nav_click', 'nav-funcionalidades', 'Funcionalidades')}
            >
              Funcionalidades
            </a>
            <a 
              href="#planos" 
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              onClick={() => trackEvent('nav_click', 'nav-planos', 'Planos')}
            >
              Planos
            </a>
            <a 
              href="#faq" 
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              onClick={() => trackEvent('nav_click', 'nav-faq', 'Perguntas Frequentes')}
            >
              Perguntas Frequentes
            </a>
            <a 
              href="#contato" 
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              onClick={() => trackEvent('nav_click', 'nav-contato', 'Contato')}
            >
              Contato
            </a>
          </nav>

          <Link to="/auth" onClick={() => trackEvent('cta_click', 'header-login', 'Acessar Plataforma')}>
            <Button size="lg" className="shadow-medium">
              Acessar Plataforma
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" data-section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 gradient-hero opacity-10"></div>
        <div className="container relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Brain className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Seu Time de Vendas Aprimorado com IA</span>
              </div>
              <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                <span className="text-destructive">PARE DE PERDER VENDAS.</span>
                <br />
                A flum.ia é a ponte entre o atendimento humano e a{" "}
                <span className="text-primary">automação inteligente</span>
              </h1>
              <p className="mb-8 text-lg text-muted-foreground">
                Transforme conversas em vendas e oportunidades em clientes, a qualquer hora, em qualquer lugar.
              </p>
              <a href="#planos" onClick={() => trackEvent('cta_click', 'hero-cta', 'Quero parar de perder vendas')}>
                <Button size="lg" className="shadow-glow text-lg px-8 py-6 h-auto">
                  QUERO PARAR DE PERDER VENDAS
                </Button>
              </a>
            </div>
            <div className="relative">
              <div className="relative mx-auto w-full max-w-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl rounded-full"></div>
                <img 
                  src={whatsappNegociacaoProduto} 
                  alt="Flumia Flow em ação" 
                  className="relative rounded-3xl shadow-2xl border-8 border-background"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nova Seção de Destaque da IA */}
      <section id="ia-destaque" data-section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="mb-4 text-3xl font-bold md:text-5xl">
              Vá Além do Chatbot: <br />
              <span className="text-primary">A Inteligência Artificial que Vende por Você</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Nossa IA não apenas responde perguntas - ela entende contexto, personaliza atendimento e fecha vendas
            </p>
          </div>

          <div className="space-y-24">
            {/* Subseção 1: Entendimento de Contexto */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                  <Brain className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Processamento de Linguagem Natural</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  Entende o que seu cliente realmente quer
                </h3>
                <p className="text-muted-foreground text-lg mb-6">
                  Nossa IA interpreta as mensagens dos seus clientes, compreende a intenção por trás de cada pergunta 
                  e busca automaticamente o produto certo - mesmo quando o cliente não sabe exatamente o que procura.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Busca inteligente por produtos usando linguagem natural</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Reconhece sinônimos, cores, marcas e características</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Sugere alternativas quando o produto não está disponível</span>
                  </li>
                </ul>
              </div>
              <div className="order-1 md:order-2">
                <div className="relative mx-auto w-full max-w-sm">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl"></div>
                  <img 
                    src={whatsappBuscaRefinada} 
                    alt="IA entendendo busca de produto" 
                    className="relative rounded-3xl shadow-2xl border-8 border-background"
                  />
                </div>
              </div>
            </div>


            {/* Subseção 3: Transação e Negociação */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                  <ShoppingCart className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Fechamento Automático</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  Negocia e fecha vendas automaticamente
                </h3>
                <p className="text-muted-foreground text-lg mb-6">
                  Da apresentação do produto até o fechamento, a IA gerencia todo o processo de venda: 
                  apresenta preços, calcula fretes, processa pagamentos e confirma pedidos.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Apresenta produtos com preço, SKU e disponibilidade em estoque</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Calcula frete e apresenta opções de entrega</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Processa pagamento via Pix e finaliza pedido automaticamente</span>
                  </li>
                </ul>
              </div>
              <div className="order-1 md:order-2">
                <div className="relative mx-auto w-full max-w-sm">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl"></div>
                  <img 
                    src={whatsappResumoEntrega} 
                    alt="IA fechando venda" 
                    className="relative rounded-3xl shadow-2xl border-8 border-background"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* O que é / Funcionalidades */}
      <section id="funcionalidades" data-section className="py-20 bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Uma plataforma completa para escalar suas vendas
            </h2>
            <p className="text-muted-foreground">
              flum.ia oferece tudo que você precisa para automatizar, gerenciar e potencializar seu atendimento
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="shadow-card border-border/50 hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Atendimento Automatizado</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Responda seus clientes automaticamente via WhatsApp, 24/7, sem perder nenhuma oportunidade de venda.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="shadow-card border-border/50 hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <ShoppingCart className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Gestão de Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Acompanhe pedidos, gerencie produtos e clientes em uma plataforma única e intuitiva.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="shadow-card border-border/50 hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/20">
                  <Database className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Integração com ERPs</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Conecte sua operação aos principais sistemas de gestão do mercado de forma simples e segura.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="shadow-card border-border/50 hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <UserCheck className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Autonomia para o Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Permita que seus clientes consultem preços, estoque e façam pedidos de forma independente.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="shadow-card border-border/50 hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <Brain className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Consultas com IA</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Inteligência artificial para entender e responder dúvidas dos clientes de forma natural.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="shadow-card border-border/50 hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/20">
                  <Clock className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Disponibilidade Total</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Atenda seus clientes a qualquer hora, todos os dias, sem necessidade de equipe 24/7.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Problema vs Solução */}
      <section id="o-que-e" className="py-20 bg-secondary/30">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              <span className="text-destructive">O QUE VOCÊ ESTÁ PERDENDO AGORA?</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              O Custo Real de Não Ter a flum.ia
            </p>
          </div>

          <div className="mx-auto max-w-5xl">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Problema */}
              <div className="space-y-6 bg-background/50 p-8 rounded-lg border border-destructive/20 relative overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-10"
                  style={{ backgroundImage: `url(${withoutFlumia})` }}
                ></div>
                
                <h3 className="text-2xl font-bold flex items-center gap-2 relative z-10">
                  <X className="h-6 w-6 text-red-500" />
                  Sem a flum.ia
                </h3>
                
                <div className="space-y-4 relative z-10">
                  <div className="flex gap-3">
                    <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">
                      Vendas perdidas fora do horário comercial
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">
                      Atendimento lento e inconsistente
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">
                      Dificuldade em gerenciar múltiplos canais
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">
                      Processos manuais e repetitivos
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">
                      Falta de integração com seu ERP
                    </p>
                  </div>
                </div>
              </div>

              {/* Solução */}
              <div className="space-y-6 bg-background/50 p-8 rounded-lg border border-primary/20 relative overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-10"
                  style={{ backgroundImage: `url(${withFlumia})` }}
                ></div>
                
                <h3 className="text-2xl font-bold flex items-center gap-2 relative z-10">
                  <Check className="h-6 w-6 text-[hsl(var(--primary))]" />
                  Com a flum.ia
                </h3>
                
                <div className="space-y-4 relative z-10">
                  <div className="flex gap-3">
                    <Check className="h-5 w-5 text-[hsl(var(--primary))] flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">
                      Atendimento 24/7 sem custo adicional
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Check className="h-5 w-5 text-[hsl(var(--primary))] flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">
                      Respostas instantâneas e padronizadas
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Check className="h-5 w-5 text-[hsl(var(--primary))] flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">
                      Centralização completa em uma plataforma
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Check className="h-5 w-5 text-[hsl(var(--primary))] flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">
                      Automação inteligente de tarefas
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Check className="h-5 w-5 text-[hsl(var(--primary))] flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">
                      Sincronização automática de dados
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" data-section className="py-20 bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Escolha o plano ideal para o seu negócio
            </h2>
            <p className="text-muted-foreground">
              Planos flexíveis que crescem junto com sua empresa
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 max-w-7xl mx-auto">
            {planos.map((plano: any, index: number) => {
              // Get caracteristicas IDs for this plano
              const planoCaracteristicaIds = planoCaracteristicas
                .filter((pc: any) => pc.plano_id === plano.id)
                .map((pc: any) => pc.caracteristica_id);

              return (
                <div key={plano.id} className="w-full max-w-sm">
                  <Card
                    className={index === 1 ? "shadow-glow border-primary/50 relative overflow-hidden" : "shadow-card border-border/50 hover:shadow-glow transition-all duration-300"}
                  >
                    {index === 1 && (
                      <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-2 py-0.5 text-[10px] font-semibold">
                        POPULAR
                      </div>
                    )}
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg">{plano.nome}</CardTitle>
                      <CardDescription className="text-xs">
                        {plano.qtd_pedidos} pedidos
                      </CardDescription>
                      <div className="mt-2">
                        <span className="text-2xl font-bold text-primary">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plano.valor_recorrente)}
                        </span>
                        <span className="text-xs text-muted-foreground">/mês</span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-xs">Até {plano.qtd_pedidos} pedidos</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-xs">
                            +{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plano.valor_pedido_adicional)}/pedido extra
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-xs">
                            Ativação: {plano.valor_implantacao_a_verificar 
                              ? "A verificar" 
                              : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plano.valor_implantacao)
                            }
                          </span>
                        </li>
                        {caracteristicas.map((caracteristica: any) => {
                          const planoTemCaracteristica = planoCaracteristicaIds.includes(caracteristica.id);
                          return (
                            <li key={caracteristica.id} className="flex items-start gap-2">
                              {planoTemCaracteristica ? (
                                <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                              ) : (
                                <X className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                              )}
                              <span className={`text-xs ${!planoTemCaracteristica ? 'text-muted-foreground' : ''}`}>
                                {caracteristica.nome}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button 
                        className="w-full text-xs py-2"
                        variant={index === 1 ? "default" : "outline"}
                        onClick={() => {
                          trackEvent('plan_click', `plan-${plano.nome}`, `Contratar ${plano.nome}`);
                          const phone = settings?.whatsapp_contato;
                          if (phone) {
                            const message = encodeURIComponent(`Olá! Gostaria de contratar o plano ${plano.nome}.`);
                            window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
                          }
                        }}
                      >
                        Começar Agora
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      {depoimentos && depoimentos.length > 0 && (
        <section className="py-20 bg-secondary/10">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center mb-16">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                O que nossos clientes dizem
              </h2>
            </div>
            <div className="max-w-4xl mx-auto">
              <Carousel className="w-full">
                <CarouselContent>
                  {depoimentos.map((depoimento: any) => (
                    <CarouselItem key={depoimento.id}>
                      <Card className="shadow-card border-border/50">
                        <CardContent className="p-8">
                          <Quote className="h-12 w-12 text-primary/30 mb-4" />
                          <p className="text-lg text-muted-foreground italic mb-6">
                            "{depoimento.conteudo}"
                          </p>
                          <div className="border-t pt-4 mt-4">
                            <p className="font-semibold text-foreground">
                              {depoimento.autor}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {depoimento.empresa_nome}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section id="faq" data-section className="py-20 bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Perguntas Frequentes
            </h2>
            <p className="text-muted-foreground">
              Tire suas dúvidas sobre o flum.ia
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqs?.map((faq: any, index: number) => (
                <AccordionItem key={faq.id} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-semibold">
                    {faq.pergunta}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.resposta}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" data-section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl">
            <div className="text-center mb-12">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Não perca mais tempo e dinheiro
              </h2>
              <p className="text-lg text-muted-foreground">
                Fale com um especialista e descubra como a flum.ia pode transformar suas vendas
              </p>
            </div>

            <Card className="shadow-card">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome completo</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Seu nome"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      type="tel"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      placeholder="(00) 00000-0000"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mensagem">Mensagem</Label>
                    <Textarea
                      id="mensagem"
                      value={formData.mensagem}
                      onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                      placeholder="Como podemos ajudar?"
                      rows={5}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    Enviar Mensagem
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <img src={flumiaLogo} alt="flum.ia Logo" className="h-6 w-6" />
              <span className="font-bold text-foreground">flum.ia</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © 2025 flum.ia. Todos os direitos reservados.
            </p>
            
            <Link to="/auth">
              <Button variant="ghost" size="sm">
                Acessar Plataforma
              </Button>
            </Link>
          </div>
        </div>
      </footer>

      {/* Cookie Consent Banner */}
      <CookieConsent 
        onAccept={handleCookieAccept}
        onDecline={handleCookieDecline}
      />

      {/* WhatsApp Button */}
      {settings?.whatsapp_contato && (
        <WhatsAppButton 
          phoneNumber={settings.whatsapp_contato}
          assistantName={settings.nome_assistente || "Assistente flum.ia"}
          initialMessage={settings.mensagem_inicial || "Olá! Como posso ajudar você hoje?"}
        />
      )}
    </div>
  );
};

export default Index;
