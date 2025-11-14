-- Adicionar coluna contato_id na tabela pagamentos
ALTER TABLE pagamentos
ADD COLUMN contato_id uuid REFERENCES contatos(id);

-- Popular a coluna com os dados existentes através do relacionamento com pedidos
UPDATE pagamentos
SET contato_id = pedidos.contato_id
FROM pedidos
WHERE pagamentos.pedido_id = pedidos.id;

-- Criar índice para melhorar performance nas consultas por contato
CREATE INDEX idx_pagamentos_contato_id ON pagamentos(contato_id);