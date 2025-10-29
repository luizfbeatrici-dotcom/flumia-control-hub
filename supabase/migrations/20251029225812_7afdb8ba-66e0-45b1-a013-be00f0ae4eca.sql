-- Adicionar campo versao_api na tabela aplicativos
ALTER TABLE public.aplicativos
ADD COLUMN IF NOT EXISTS versao_api text NOT NULL DEFAULT 'v22.0';

-- Adicionar comentário para documentação
COMMENT ON COLUMN public.aplicativos.versao_api IS 'Versão da API do Facebook Graph utilizada (ex: v22.0)';