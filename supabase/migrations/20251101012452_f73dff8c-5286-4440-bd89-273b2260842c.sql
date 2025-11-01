-- Drop and recreate function with quantidade_solicitada in return
DROP FUNCTION IF EXISTS public.verificar_disponibilidade_produto(uuid, numeric, uuid);

CREATE OR REPLACE FUNCTION public.verificar_disponibilidade_produto(p_produto_id uuid, p_quantidade numeric, p_empresa_id uuid)
 RETURNS TABLE(disponivel boolean, saldo_atual numeric, limite_venda numeric, quantidade_solicitada numeric, mensagem text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
      p_quantidade,
      format('Quantidade solicitada (%s) excede o limite de venda (%s)', p_quantidade, v_limite);
    RETURN;
  END IF;

  -- Check if there is enough stock
  IF v_saldo < p_quantidade THEN
    RETURN QUERY SELECT 
      false,
      v_saldo,
      v_limite,
      p_quantidade,
      format('Estoque insuficiente. Disponível: %s, Solicitado: %s', v_saldo, p_quantidade);
    RETURN;
  END IF;

  -- Product is available
  RETURN QUERY SELECT 
    true,
    v_saldo,
    v_limite,
    p_quantidade,
    'Produto disponível'::text;
END;
$function$;