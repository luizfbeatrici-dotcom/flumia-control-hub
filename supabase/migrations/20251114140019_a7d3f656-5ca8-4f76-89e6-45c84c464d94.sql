-- Add column to store order quantity type (up to or from)
ALTER TABLE planos 
ADD COLUMN qtd_pedidos_tipo text DEFAULT 'ate' CHECK (qtd_pedidos_tipo IN ('ate', 'a_partir_de'));