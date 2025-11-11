-- Create FAQ table
CREATE TABLE IF NOT EXISTS public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pergunta text NOT NULL,
  resposta text NOT NULL,
  ordem integer NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admin masters can manage all FAQs"
  ON public.faqs
  FOR ALL
  USING (has_role(auth.uid(), 'admin_master'::app_role));

CREATE POLICY "Everyone can view active FAQs"
  ON public.faqs
  FOR SELECT
  USING (ativo = true OR has_role(auth.uid(), 'admin_master'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_faqs_updated_at
  BEFORE UPDATE ON public.faqs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial FAQs
INSERT INTO public.faqs (pergunta, resposta, ordem, ativo) VALUES
('O que é o Flumia Flow?', 'O Flumia Flow é um vendedor digital automatizado para WhatsApp. Ele atende clientes, gera orçamentos, fecha pedidos e integra tudo ao seu ERP, funcionando 24 horas por dia.', 1, true),
('Para quem o Flumia Flow é indicado?', 'Para lojistas de pequeno e médio porte, principalmente do varejo (materiais de construção, autopeças, lojas de serviços, etc.) que desejam vender mais, reduzir custos e organizar o televendas.', 2, true),
('O Flumia Flow substitui vendedores humanos?', 'Não. O Flumia Flow complementa e potencializa a equipe de vendas, eliminando tarefas repetitivas e atendendo em grande escala. Sua equipe pode focar no que realmente importa: fechar grandes negócios e cuidar dos clientes estratégicos.', 3, true),
('O Flumia Flow faz ligações telefônicas?', 'Não. Ele atua exclusivamente no WhatsApp Business, onde realiza todo o atendimento automatizado de ponta a ponta.', 4, true),
('O Flumia Flow responde em tempo real?', 'Sim. Ele responde instantaneamente, 24h por dia, mesmo em finais de semana e feriados.', 5, true),
('Ele gera orçamentos automaticamente?', 'Sim. O Flumia Flow gera orçamentos e pedidos no WhatsApp, podendo integrar ao seu ERP para atualizar estoque, preços e formas de pagamento.', 6, true),
('Posso personalizar o jeito que ele fala com os clientes?', 'Sim. A comunicação é personalizada com a identidade da sua empresa, transmitindo confiança e proximidade.', 7, true),
('O Flumia Flow aceita pagamentos?', 'Sim. Ele pode enviar links de pagamento integrados, facilitando o fechamento do pedido dentro do WhatsApp.', 8, true),
('O que o Flumia Flow não faz?', 'Não faz ligações telefônicas. Não atua fora do WhatsApp (mas pode ser integrado a outros canais futuramente). Não substitui o relacionamento humano em casos complexos.', 9, true),
('Quanto custa o Flumia Flow?', 'O valor é acessível e varia conforme a demanda de atendimentos da sua empresa. Nosso time comercial pode montar a melhor proposta para você.', 10, true),
('O que preciso para começar?', 'Basta ter um número de WhatsApp Business e solicitar a ativação do Flumia Flow. Em poucos dias, sua loja já pode estar atendendo e vendendo de forma automática.', 11, true);