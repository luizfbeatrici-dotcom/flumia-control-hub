-- Add column to allow marking activation value as "to verify"
ALTER TABLE public.planos
ADD COLUMN valor_implantacao_a_verificar BOOLEAN NOT NULL DEFAULT false;