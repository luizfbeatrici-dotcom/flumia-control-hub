-- Remove a coluna numero atual (SERIAL global)
ALTER TABLE pedidos DROP COLUMN numero;

-- Adiciona coluna numero como integer
ALTER TABLE pedidos ADD COLUMN numero INTEGER;

-- Criar função para gerar número sequencial por empresa
CREATE OR REPLACE FUNCTION gerar_numero_pedido()
RETURNS TRIGGER AS $$
BEGIN
  -- Gera o próximo número baseado no maior número existente da empresa
  SELECT COALESCE(MAX(numero), 0) + 1 
  INTO NEW.numero
  FROM pedidos
  WHERE empresa_id = NEW.empresa_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Criar trigger para gerar número automaticamente em novos pedidos
CREATE TRIGGER trigger_gerar_numero_pedido
  BEFORE INSERT ON pedidos
  FOR EACH ROW
  WHEN (NEW.numero IS NULL)
  EXECUTE FUNCTION gerar_numero_pedido();

-- Atualizar pedidos existentes com números sequenciais por empresa
WITH pedidos_numerados AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY empresa_id ORDER BY created_at) as novo_numero
  FROM pedidos
)
UPDATE pedidos
SET numero = pedidos_numerados.novo_numero
FROM pedidos_numerados
WHERE pedidos.id = pedidos_numerados.id;

-- Tornar a coluna NOT NULL após popular os dados
ALTER TABLE pedidos ALTER COLUMN numero SET NOT NULL;

-- Criar índice composto para garantir unicidade por empresa
CREATE UNIQUE INDEX idx_pedidos_empresa_numero ON pedidos(empresa_id, numero);

-- Recriar o índice de performance
DROP INDEX IF EXISTS idx_pedidos_numero;
CREATE INDEX idx_pedidos_numero ON pedidos(numero);