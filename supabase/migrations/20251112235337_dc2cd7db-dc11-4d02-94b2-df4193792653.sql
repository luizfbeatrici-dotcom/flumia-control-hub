-- Add column to track last customer interaction date
ALTER TABLE public.contatos
ADD COLUMN ultima_interacao TIMESTAMP WITH TIME ZONE;

-- Add comment to explain the column
COMMENT ON COLUMN public.contatos.ultima_interacao IS 'Data e hora da última mensagem enviada pelo cliente';