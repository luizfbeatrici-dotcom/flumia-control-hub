-- Add limite_venda column to produtos table
ALTER TABLE public.produtos 
ADD COLUMN limite_venda numeric DEFAULT NULL;

COMMENT ON COLUMN public.produtos.limite_venda IS 'Quantidade máxima permitida por venda deste produto';

-- Create estoque table to control product inventory
CREATE TABLE public.estoque (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id uuid NOT NULL,
  produto_id uuid NOT NULL,
  saldo numeric NOT NULL DEFAULT 0,
  saldo_minimo numeric DEFAULT 0,
  saldo_maximo numeric DEFAULT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT fk_estoque_produto FOREIGN KEY (produto_id) REFERENCES public.produtos(id) ON DELETE CASCADE,
  CONSTRAINT unique_produto_empresa UNIQUE (empresa_id, produto_id)
);

COMMENT ON TABLE public.estoque IS 'Controle de estoque dos produtos';

-- Create index for faster queries
CREATE INDEX idx_estoque_produto_id ON public.estoque(produto_id);
CREATE INDEX idx_estoque_empresa_id ON public.estoque(empresa_id);

-- Enable RLS on estoque table
ALTER TABLE public.estoque ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for estoque table
CREATE POLICY "Users can view estoque from their company"
  ON public.estoque
  FOR SELECT
  USING (
    empresa_id = user_empresa_id(auth.uid()) 
    OR has_role(auth.uid(), 'admin_master'::app_role)
  );

CREATE POLICY "Company users can manage their estoque"
  ON public.estoque
  FOR ALL
  USING (empresa_id = user_empresa_id(auth.uid()));

CREATE POLICY "Admin masters can manage all estoque"
  ON public.estoque
  FOR ALL
  USING (has_role(auth.uid(), 'admin_master'::app_role));

-- Create trigger to update updated_at on estoque
CREATE TRIGGER update_estoque_updated_at
  BEFORE UPDATE ON public.estoque
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to check product availability
CREATE OR REPLACE FUNCTION public.verificar_disponibilidade_produto(
  p_produto_id uuid,
  p_quantidade numeric,
  p_empresa_id uuid
)
RETURNS TABLE (
  disponivel boolean,
  saldo_atual numeric,
  limite_venda numeric,
  mensagem text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_saldo numeric;
  v_limite numeric;
BEGIN
  -- Get current stock and sale limit
  SELECT 
    COALESCE(e.saldo, 0),
    p.limite_venda
  INTO v_saldo, v_limite
  FROM produtos p
  LEFT JOIN estoque e ON e.produto_id = p.id AND e.empresa_id = p_empresa_id
  WHERE p.id = p_produto_id AND p.empresa_id = p_empresa_id;

  -- Check if product has sale limit
  IF v_limite IS NOT NULL AND p_quantidade > v_limite THEN
    RETURN QUERY SELECT 
      false,
      v_saldo,
      v_limite,
      format('Quantidade solicitada (%s) excede o limite de venda (%s)', p_quantidade, v_limite);
    RETURN;
  END IF;

  -- Check if there is enough stock
  IF v_saldo < p_quantidade THEN
    RETURN QUERY SELECT 
      false,
      v_saldo,
      v_limite,
      format('Estoque insuficiente. Disponível: %s, Solicitado: %s', v_saldo, p_quantidade);
    RETURN;
  END IF;

  -- Product is available
  RETURN QUERY SELECT 
    true,
    v_saldo,
    v_limite,
    'Produto disponível'::text;
END;
$$;