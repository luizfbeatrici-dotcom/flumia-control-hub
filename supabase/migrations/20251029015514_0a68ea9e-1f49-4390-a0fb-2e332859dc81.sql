-- Adicionar campos faltantes na tabela pedidos
ALTER TABLE public.pedidos
ADD COLUMN IF NOT EXISTS whatsapp_from text,
ADD COLUMN IF NOT EXISTS finalizado_em timestamp with time zone,
ADD COLUMN IF NOT EXISTS vlr_frete numeric(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tipo_entrega text,
ADD COLUMN IF NOT EXISTS contato_id uuid REFERENCES public.contatos(id);

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_pedidos_whatsapp_from ON public.pedidos(whatsapp_from);
CREATE INDEX IF NOT EXISTS idx_pedidos_contato_id ON public.pedidos(contato_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_finalizado_em ON public.pedidos(finalizado_em);

-- Adicionar comentários para documentação
COMMENT ON COLUMN public.pedidos.whatsapp_from IS 'Número do WhatsApp de origem do pedido';
COMMENT ON COLUMN public.pedidos.finalizado_em IS 'Data e hora em que o pedido foi finalizado';
COMMENT ON COLUMN public.pedidos.vlr_frete IS 'Valor do frete do pedido';
COMMENT ON COLUMN public.pedidos.tipo_entrega IS 'Tipo de entrega (delivery, retirada, etc)';
COMMENT ON COLUMN public.pedidos.contato_id IS 'Referência ao contato do WhatsApp que originou o pedido';