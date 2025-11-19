-- Criar constraint para permitir apenas um "Consumidor Final" (CPF 00000000000) por empresa
-- Primeiro, remover constraint se já existir
ALTER TABLE public.pessoas DROP CONSTRAINT IF EXISTS unique_consumidor_final_por_empresa;

-- Criar índice único parcial que permite apenas um CPF 00000000000 por empresa
CREATE UNIQUE INDEX unique_consumidor_final_por_empresa 
  ON public.pessoas (empresa_id, cnpjf) 
  WHERE cnpjf = '00000000000';