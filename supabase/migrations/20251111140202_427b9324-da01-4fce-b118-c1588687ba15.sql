-- Create depoimentos table
CREATE TABLE public.depoimentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_nome TEXT NOT NULL,
  autor TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.depoimentos ENABLE ROW LEVEL SECURITY;

-- Create policies for depoimentos
CREATE POLICY "Admin masters can manage all depoimentos"
ON public.depoimentos
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin_master'::app_role));

CREATE POLICY "Everyone can view active depoimentos"
ON public.depoimentos
FOR SELECT
TO authenticated
USING (ativo = true OR has_role(auth.uid(), 'admin_master'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_depoimentos_updated_at
BEFORE UPDATE ON public.depoimentos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert example depoimentos
INSERT INTO public.depoimentos (empresa_nome, autor, conteudo, ordem) VALUES
('A1 peças', 'Mariana Costa, proprietária', 'Desde que começamos a usar o Flumiaflow, nosso atendimento pelo WhatsApp ficou profissional e rápido. Em uma semana já vimos o ticket médio subir: cliente faz pedido, consigo emitir nota e organizar entrega sem sair da conversa. É como ter um vendedor 24/7 na loja.', 1),
('Construmais', 'Rafael Almeida, gerente operacional', 'O fluxo de pedidos mudou o jogo. Antes perdíamos vendas por conta de mensagens perdidas; agora tudo aparece organizado, com histórico do cliente e finalização de pagamento direto pelo chat. Reduziu retrabalho e aumentou as entregas feitas no prazo.', 2),
('HotBoutique', 'Ana Beatriz Soares, sócia', 'Uso o Flumiaflow para combinar estoque, emitir nota e alinhar entregas com motoboy — tudo sem planilha. Em dias de promoção conseguimos processar o dobro de pedidos com a mesma equipe. Prático e confiável.', 3);