-- Remove columns from empresas table
ALTER TABLE public.empresas
DROP COLUMN IF EXISTS app_contato,
DROP COLUMN IF EXISTS app_ativo,
DROP COLUMN IF EXISTS app_meta_id,
DROP COLUMN IF EXISTS app_whatsapp_id,
DROP COLUMN IF EXISTS app_business_id;

-- Create aplicativos table
CREATE TABLE public.aplicativos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  contato TEXT,
  ativo BOOLEAN DEFAULT true,
  meta_id TEXT,
  whatsapp_id TEXT,
  business_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.aplicativos ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admin masters can manage all aplicativos"
ON public.aplicativos
FOR ALL
USING (has_role(auth.uid(), 'admin_master'::app_role));

CREATE POLICY "Company admins can manage their aplicativos"
ON public.aplicativos
FOR ALL
USING (empresa_id = user_empresa_id(auth.uid()));

CREATE POLICY "Users can view aplicativos from their company"
ON public.aplicativos
FOR SELECT
USING (
  empresa_id = user_empresa_id(auth.uid()) OR 
  has_role(auth.uid(), 'admin_master'::app_role)
);

-- Add trigger for updated_at
CREATE TRIGGER update_aplicativos_updated_at
BEFORE UPDATE ON public.aplicativos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();