-- Drop the old tipo_entrega text column
ALTER TABLE public.pedidos DROP COLUMN IF EXISTS tipo_entrega;

-- Add the new empresa_tipo_entrega_id column as foreign key
ALTER TABLE public.pedidos 
ADD COLUMN empresa_tipo_entrega_id uuid REFERENCES public.empresa_tipos_entrega(id) ON DELETE SET NULL;