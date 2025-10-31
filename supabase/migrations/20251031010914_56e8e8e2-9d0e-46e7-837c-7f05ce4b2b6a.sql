-- Add plano_id column to empresas table
ALTER TABLE public.empresas
ADD COLUMN plano_id uuid REFERENCES public.planos(id);