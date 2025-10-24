-- Add token field to aplicativos table
ALTER TABLE public.aplicativos 
ADD COLUMN IF NOT EXISTS token TEXT;