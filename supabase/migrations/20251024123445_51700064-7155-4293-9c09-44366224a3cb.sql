-- Inserir cliente de teste
INSERT INTO pessoas (empresa_id, nome, cnpjf, celular, email)
VALUES (
  'd399d2f5-a2a3-4cf0-b456-77d0e1e2bbb3',
  'João Silva Santos',
  '123.456.789-00',
  '(11) 98765-4321',
  'joao.silva@email.com'
);

-- Inserir endereço do cliente
INSERT INTO pessoa_enderecos (pessoa_id, endereco, complemento, bairro, cidade, cep, principal)
SELECT 
  id,
  'Rua das Flores, 123',
  'Apt 45',
  'Centro',
  'São Paulo',
  '01234-567',
  true
FROM pessoas 
WHERE empresa_id = 'd399d2f5-a2a3-4cf0-b456-77d0e1e2bbb3' 
  AND nome = 'João Silva Santos'
LIMIT 1;

-- Inserir produtos de teste
INSERT INTO produtos (empresa_id, descricao, sku, preco1, unidade, categoria, ativo)
VALUES 
  ('d399d2f5-a2a3-4cf0-b456-77d0e1e2bbb3', 'Notebook Dell Inspiron 15', 'NB-DELL-001', 3500.00, 'UN', 'Informática', true),
  ('d399d2f5-a2a3-4cf0-b456-77d0e1e2bbb3', 'Mouse Logitech MX Master 3', 'MS-LOG-002', 450.00, 'UN', 'Periféricos', true),
  ('d399d2f5-a2a3-4cf0-b456-77d0e1e2bbb3', 'Teclado Mecânico RGB', 'KB-RGB-003', 680.00, 'UN', 'Periféricos', true);

-- Inserir pedido de teste
INSERT INTO pedidos (empresa_id, pessoa_id, endereco_id, status, total, observacoes)
SELECT 
  'd399d2f5-a2a3-4cf0-b456-77d0e1e2bbb3',
  p.id,
  pe.id,
  'processing',
  5080.00,
  'Pedido de teste - Entregar no período da manhã. Cliente prefere pagamento no cartão.'
FROM pessoas p
JOIN pessoa_enderecos pe ON pe.pessoa_id = p.id
WHERE p.empresa_id = 'd399d2f5-a2a3-4cf0-b456-77d0e1e2bbb3' 
  AND p.nome = 'João Silva Santos'
LIMIT 1;

-- Inserir itens do pedido
INSERT INTO pedido_itens (pedido_id, produto_id, quantidade, valor_unitario, valor_total)
SELECT 
  ped.id,
  prod.id,
  CASE 
    WHEN prod.sku = 'NB-DELL-001' THEN 1
    WHEN prod.sku = 'MS-LOG-002' THEN 2
    WHEN prod.sku = 'KB-RGB-003' THEN 1
  END,
  prod.preco1,
  CASE 
    WHEN prod.sku = 'NB-DELL-001' THEN prod.preco1 * 1
    WHEN prod.sku = 'MS-LOG-002' THEN prod.preco1 * 2
    WHEN prod.sku = 'KB-RGB-003' THEN prod.preco1 * 1
  END
FROM pedidos ped
CROSS JOIN produtos prod
WHERE ped.empresa_id = 'd399d2f5-a2a3-4cf0-b456-77d0e1e2bbb3'
  AND prod.empresa_id = 'd399d2f5-a2a3-4cf0-b456-77d0e1e2bbb3'
  AND prod.sku IN ('NB-DELL-001', 'MS-LOG-002', 'KB-RGB-003')
  AND ped.id = (
    SELECT id FROM pedidos 
    WHERE empresa_id = 'd399d2f5-a2a3-4cf0-b456-77d0e1e2bbb3' 
    ORDER BY created_at DESC 
    LIMIT 1
  );