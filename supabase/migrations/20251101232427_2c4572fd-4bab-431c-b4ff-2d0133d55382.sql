-- Função para recalcular o total do pedido
CREATE OR REPLACE FUNCTION public.recalcular_total_pedido()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Recalcula o total do pedido somando todos os valores_total dos itens
  UPDATE pedidos
  SET total = (
    SELECT COALESCE(SUM(valor_total), 0)
    FROM pedido_itens
    WHERE pedido_id = COALESCE(NEW.pedido_id, OLD.pedido_id)
  )
  WHERE id = COALESCE(NEW.pedido_id, OLD.pedido_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Criar trigger para recalcular total do pedido automaticamente
CREATE TRIGGER trigger_recalcular_total_pedido
AFTER INSERT OR UPDATE OR DELETE ON public.pedido_itens
FOR EACH ROW
EXECUTE FUNCTION public.recalcular_total_pedido();