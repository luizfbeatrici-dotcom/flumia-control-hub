-- Add aplicativo_id column to mensagens table to link messages to WhatsApp applications
ALTER TABLE public.mensagens 
ADD COLUMN aplicativo_id uuid REFERENCES public.aplicativos(id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_mensagens_aplicativo_id ON public.mensagens(aplicativo_id);

-- Add comment to document the relationship
COMMENT ON COLUMN public.mensagens.aplicativo_id IS 'Reference to the WhatsApp application (aplicativo) used to send/receive this message';