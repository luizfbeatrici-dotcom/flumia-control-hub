-- Add valor_implantacao column to planos table
ALTER TABLE public.planos
ADD COLUMN valor_implantacao numeric NOT NULL DEFAULT 0;