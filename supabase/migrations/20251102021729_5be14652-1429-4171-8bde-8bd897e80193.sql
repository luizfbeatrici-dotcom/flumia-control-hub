-- Create tipos_entrega table (master list of delivery types)
CREATE TABLE public.tipos_entrega (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create empresa_tipos_entrega table (company-specific delivery types with pricing)
CREATE TABLE public.empresa_tipos_entrega (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  tipo_entrega_id UUID NOT NULL REFERENCES public.tipos_entrega(id) ON DELETE RESTRICT,
  valor_frete NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  prazo_estimado TEXT,
  observacao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT empresa_tipos_entrega_unique UNIQUE (empresa_id, tipo_entrega_id)
);

-- Enable RLS
ALTER TABLE public.tipos_entrega ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresa_tipos_entrega ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tipos_entrega
CREATE POLICY "Admin masters can manage delivery types"
  ON public.tipos_entrega
  FOR ALL
  USING (has_role(auth.uid(), 'admin_master'));

CREATE POLICY "Users can view active delivery types"
  ON public.tipos_entrega
  FOR SELECT
  USING (ativo = true OR has_role(auth.uid(), 'admin_master'));

-- RLS Policies for empresa_tipos_entrega
CREATE POLICY "Admin masters can manage all company delivery types"
  ON public.empresa_tipos_entrega
  FOR ALL
  USING (has_role(auth.uid(), 'admin_master'));

CREATE POLICY "Company users can manage their delivery types"
  ON public.empresa_tipos_entrega
  FOR ALL
  USING (empresa_id = user_empresa_id(auth.uid()));

CREATE POLICY "Users can view delivery types from their company"
  ON public.empresa_tipos_entrega
  FOR SELECT
  USING (empresa_id = user_empresa_id(auth.uid()) OR has_role(auth.uid(), 'admin_master'));

-- Add triggers for updated_at
CREATE TRIGGER update_tipos_entrega_updated_at
  BEFORE UPDATE ON public.tipos_entrega
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_empresa_tipos_entrega_updated_at
  BEFORE UPDATE ON public.empresa_tipos_entrega
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default delivery types
INSERT INTO public.tipos_entrega (nome, descricao) VALUES
  ('Entrega Motoboy', 'Entrega padrão por motoboy'),
  ('Entrega Express', 'Entrega rápida/expressa'),
  ('Retirada no Local', 'Cliente retira no estabelecimento');

-- Create index for better performance
CREATE INDEX idx_empresa_tipos_entrega_empresa ON public.empresa_tipos_entrega(empresa_id);
CREATE INDEX idx_empresa_tipos_entrega_tipo ON public.empresa_tipos_entrega(tipo_entrega_id);