-- Add aplicativo_id to pedidos table
ALTER TABLE public.pedidos
ADD COLUMN aplicativo_id uuid REFERENCES public.aplicativos(id);

-- Add index for better query performance
CREATE INDEX idx_pedidos_aplicativo_id ON public.pedidos(aplicativo_id);