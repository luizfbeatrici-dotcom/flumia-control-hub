-- Add columns to store different message types data (audio, image, interactive)
ALTER TABLE public.mensagens
ADD COLUMN audio_data JSONB,
ADD COLUMN image_data JSONB,
ADD COLUMN interactive_data JSONB;

-- Add comments to document the structure
COMMENT ON COLUMN public.mensagens.audio_data IS 'Audio message data: {mime_type, id, voice, sha256}';
COMMENT ON COLUMN public.mensagens.image_data IS 'Image message data: {id, mime_type, sha256}';
COMMENT ON COLUMN public.mensagens.interactive_data IS 'Interactive message data: {type, button_reply: {id, title}}';

-- Add indexes for querying by message type
CREATE INDEX IF NOT EXISTS idx_mensagens_audio ON public.mensagens USING GIN (audio_data) WHERE audio_data IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mensagens_image ON public.mensagens USING GIN (image_data) WHERE image_data IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mensagens_interactive ON public.mensagens USING GIN (interactive_data) WHERE interactive_data IS NOT NULL;