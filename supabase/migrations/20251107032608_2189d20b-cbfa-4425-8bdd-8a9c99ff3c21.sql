-- Adicionar coluna numero sequencial na tabela pedidos
ALTER TABLE pedidos ADD COLUMN numero SERIAL;

-- Criar índice para melhor performance
CREATE INDEX idx_pedidos_numero ON pedidos(numero);

-- Atualizar pedidos existentes com números sequenciais
UPDATE pedidos 
SET numero = subquery.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num
  FROM pedidos
) AS subquery
WHERE pedidos.id = subquery.id;