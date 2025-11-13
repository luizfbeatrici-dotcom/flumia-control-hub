-- Add exibir_landing_page column to planos table
ALTER TABLE public.planos 
ADD COLUMN exibir_landing_page BOOLEAN NOT NULL DEFAULT true;