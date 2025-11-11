import { Link } from "react-router-dom";
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
  MessageSquare,
  Quote
} from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import flumiaLogo from "@/assets/flumia-logo.png";
import { useState } from "react";
import { toast } from "sonner";

const Index = () => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    mensagem: ""
  });

  // Fetch plans from database
  const { data: planos = [] } = useQuery({
    queryKey: ["planos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("planos")
        .select("*")
        .order("valor_recorrente", { ascending: true });

      if (error) throw error;
      return data as any[];
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Mensagem enviada com sucesso! Entraremos em contato em breve.");
    setFormData({ nome: "", email: "", telefone: "", mensagem: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={flumiaLogo} alt="Flumia Logo" className="h-8 w-8" />
            <span className="text-xl font-bold text-foreground">Flumia</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#o-que-e" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              O que é
            </a>
            <a href="#funcionalidades" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Funcionalidades
            </a>
            <a href="#planos" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Planos
            </a>
            <a href="#contato" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Contato
            </a>
          </nav>

          <Link to="/auth">
            <Button size="lg" className="shadow-medium">
              Acessar Plataforma
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 gradient-hero opacity-10"></div>
        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              A ponte entre o atendimento humano e a{" "}
              <span className="text-primary">automação inteligente</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Transforme conversas em vendas e oportunidades em clientes, a qualquer hora, em qualquer lugar.
            </p>
            <a href="#planos">
              <Button size="lg" className="shadow-glow text-lg px-8 py-6 h-auto">
                Conheça os Planos
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* O que é / Funcionalidades */}
      <section id="funcionalidades" className="py-20 bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Uma plataforma completa para escalar suas vendas
            </h2>
            <p className="text-muted-foreground">
              Flumia oferece tudo que você precisa para automatizar, gerenciar e potencializar seu atendimento
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
      <section id="o-que-e" className="py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Chega de perder vendas por problemas que podemos resolver
            </h2>
          </div>

          <div className="mx-auto max-w-5xl">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Problema */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <XCircle className="h-6 w-6 text-destructive" />
                  Sem a Flumia
                </h3>
                
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">
                      Vendas perdidas fora do horário comercial
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">
                      Atendimento lento e inconsistente
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">
                      Dificuldade em gerenciar múltiplos canais
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">
                      Processos manuais e repetitivos
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">
                      Falta de integração com seu ERP
                    </p>
                  </div>
                </div>
              </div>

              {/* Solução */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                  Com a Flumia
                </h3>
                
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">
                      Atendimento 24/7 sem custo adicional
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">
                      Respostas instantâneas e padronizadas
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">
                      Centralização completa em uma plataforma
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">
                      Automação inteligente de tarefas
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
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
      <section id="planos" className="py-20 bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Escolha o plano ideal para o seu negócio
            </h2>
            <p className="text-muted-foreground">
              Planos flexíveis que crescem junto com sua empresa
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-4 max-w-7xl mx-auto">
            {planos.map((plano: any, index: number) => (
              <Card
                key={plano.id}
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
                      <span className="text-xs">Atendimento 24/7</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-xs">Gestão de pedidos</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Link to="/auth" className="w-full">
                    <Button className="w-full text-xs py-2" variant={index === 1 ? "default" : "outline"}>
                      Começar Agora
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
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
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Perguntas Frequentes
            </h2>
            <p className="text-muted-foreground">
              Tire suas dúvidas sobre o Flumia Flow
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
      <section id="contato" className="py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl">
            <div className="text-center mb-12">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Ficou com alguma dúvida?
              </h2>
              <p className="text-muted-foreground">
                Preencha o formulário abaixo e nossa equipe entrará em contato
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
              <img src={flumiaLogo} alt="Flumia Logo" className="h-6 w-6" />
              <span className="font-bold text-foreground">Flumia</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © 2025 Flumia. Todos os direitos reservados.
            </p>
            
            <Link to="/auth">
              <Button variant="ghost" size="sm">
                Acessar Plataforma
              </Button>
            </Link>
          </div>
        </div>
      </footer>

      {/* WhatsApp Button */}
      {settings?.whatsapp_contato && (
        <WhatsAppButton 
          phoneNumber={settings.whatsapp_contato}
          assistantName={settings.nome_assistente || "Assistente Flumia"}
          initialMessage={settings.mensagem_inicial || "Olá! Como posso ajudar você hoje?"}
        />
      )}
    </div>
  );
};

export default Index;
