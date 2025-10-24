-- Limpar dados de teste anteriores
DELETE FROM pedido_itens 
WHERE pedido_id IN (
  SELECT id FROM pedidos 
  WHERE empresa_id = 'd399d2f5-a2a3-4cf0-b456-77d0e1e2bbb3'
);

DELETE FROM pedidos 
WHERE empresa_id = 'd399d2f5-a2a3-4cf0-b456-77d0e1e2bbb3';

DELETE FROM pessoa_enderecos 
WHERE pessoa_id IN (
  SELECT id FROM pessoas 
  WHERE empresa_id = 'd399d2f5-a2a3-4cf0-b456-77d0e1e2bbb3'
);

DELETE FROM pessoas 
WHERE empresa_id = 'd399d2f5-a2a3-4cf0-b456-77d0e1e2bbb3';

DELETE FROM produtos 
WHERE empresa_id = 'd399d2f5-a2a3-4cf0-b456-77d0e1e2bbb3';

-- Criar cliente de teste
INSERT INTO pessoas (id, empresa_id, nome, cnpjf, celular, email)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'd399d2f5-a2a3-4cf0-b456-77d0e1e2bbb3',
  'João Silva Santos',
  '123.456.789-00',
  '(11) 98765-4321',
  'joao.silva@email.com'
);

-- Criar endereço do cliente
INSERT INTO pessoa_enderecos (id, pessoa_id, endereco, complemento, bairro, cidade, cep, principal)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Rua das Flores, 123',
  'Apt 45',
  'Centro',
  'São Paulo',
  '01234-567',
  true
);

-- Criar produtos de teste
INSERT INTO produtos (id, empresa_id, descricao, sku, preco1, unidade, categoria, ativo)
VALUES 
  ('33333333-3333-3333-3333-333333333333', 'd399d2f5-a2a3-4cf0-b456-77d0e1e2bbb3', 'Notebook Dell Inspiron 15', 'NB-DELL-001', 3500.00, 'UN', 'Informática', true),
  ('44444444-4444-4444-4444-444444444444', 'd399d2f5-a2a3-4cf0-b456-77d0e1e2bbb3', 'Mouse Logitech MX Master 3', 'MS-LOG-002', 450.00, 'UN', 'Periféricos', true),
  ('55555555-5555-5555-5555-555555555555', 'd399d2f5-a2a3-4cf0-b456-77d0e1e2bbb3', 'Teclado Mecânico RGB', 'KB-RGB-003', 680.00, 'UN', 'Periféricos', true);

-- Criar pedido de teste
INSERT INTO pedidos (id, empresa_id, pessoa_id, endereco_id, status, total, observacoes)
VALUES (
  '66666666-6666-6666-6666-666666666666',
  'd399d2f5-a2a3-4cf0-b456-77d0e1e2bbb3',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'processing',
  5080.00,
  'Pedido de teste - Entregar no período da manhã. Cliente prefere pagamento no cartão.'
);

-- Criar itens do pedido (3500 + 900 + 680 = 5080)
INSERT INTO pedido_itens (pedido_id, produto_id, quantidade, valor_unitario, valor_total)
VALUES 
  ('66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', 1, 3500.00, 3500.00),
  ('66666666-6666-6666-6666-666666666666', '44444444-4444-4444-4444-444444444444', 2, 450.00, 900.00),
  ('66666666-6666-6666-6666-666666666666', '55555555-5555-5555-5555-555555555555', 1, 680.00, 680.00);