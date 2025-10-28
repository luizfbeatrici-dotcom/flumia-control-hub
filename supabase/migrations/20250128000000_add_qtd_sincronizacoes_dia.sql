-- Adicionar campo de quantidade de sincronizações por dia na tabela empresas
ALTER TABLE public.empresas
ADD COLUMN IF NOT EXISTS qtd_sincronizacoes_dia INTEGER DEFAULT 1;

COMMENT ON COLUMN public.empresas.qtd_sincronizacoes_dia IS 'Quantidade de sincronizações permitidas por dia';

