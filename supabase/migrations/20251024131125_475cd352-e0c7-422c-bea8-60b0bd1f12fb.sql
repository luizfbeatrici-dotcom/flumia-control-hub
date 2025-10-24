-- Adicionar campos de parâmetros financeiros na tabela empresas
ALTER TABLE public.empresas
ADD COLUMN IF NOT EXISTS taxa_transacao numeric(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS valor_mensal numeric(10,2) DEFAULT 0;

COMMENT ON COLUMN public.empresas.taxa_transacao IS 'Percentual de taxa de transação cobrada do cliente';
COMMENT ON COLUMN public.empresas.valor_mensal IS 'Valor mensal cobrado do cliente';