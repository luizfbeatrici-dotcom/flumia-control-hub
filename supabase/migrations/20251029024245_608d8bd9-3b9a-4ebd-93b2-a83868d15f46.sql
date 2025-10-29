-- Adicionar campo aplicativo_id na tabela contatos
ALTER TABLE public.contatos
ADD COLUMN IF NOT EXISTS aplicativo_id uuid REFERENCES public.aplicativos(id);

-- Adicionar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_contatos_aplicativo_id ON public.contatos(aplicativo_id);

-- Adicionar comentário para documentação
COMMENT ON COLUMN public.contatos.aplicativo_id IS 'Referência ao aplicativo de WhatsApp que originou o contato';