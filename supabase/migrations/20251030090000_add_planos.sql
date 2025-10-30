-- Criar tabela de planos de bilhetagem
CREATE TABLE IF NOT EXISTS public.planos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  valor_recorrente NUMERIC(10,2) NOT NULL DEFAULT 0,
  qtd_pedidos INTEGER NOT NULL DEFAULT 0,
  valor_pedido_adicional NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.planos ENABLE ROW LEVEL SECURITY;

-- Políticas: apenas admin_master pode gerenciar
CREATE POLICY "Admin masters can manage planos"
ON public.planos
FOR ALL
USING (has_role(auth.uid(), 'admin_master'::app_role));

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_planos_updated_at ON public.planos;
CREATE TRIGGER update_planos_updated_at
BEFORE UPDATE ON public.planos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.planos IS 'Planos de bilhetagem';
COMMENT ON COLUMN public.planos.valor_recorrente IS 'Valor recorrente mensal do plano';
COMMENT ON COLUMN public.planos.qtd_pedidos IS 'Quantidade de pedidos incluídos no plano';
COMMENT ON COLUMN public.planos.valor_pedido_adicional IS 'Valor por pedido adicional após a cota';


