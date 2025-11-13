-- Add etapa_id to notification_settings table
ALTER TABLE public.notification_settings
ADD COLUMN etapa_id UUID REFERENCES public.etapas(id) ON DELETE SET NULL;

-- Update existing records with NULL etapa_id (will need to be configured)
UPDATE public.notification_settings SET etapa_id = NULL WHERE etapa_id IS NULL;