-- Criar tabela empresa_config
CREATE TABLE IF NOT EXISTS public.empresa_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  mensagem_inicial TEXT,
  mensagem_nao_cliente TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(empresa_id)
);

-- Enable RLS
ALTER TABLE public.empresa_config ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admin masters can manage all empresa_config"
  ON public.empresa_config
  FOR ALL
  USING (has_role(auth.uid(), 'admin_master'::app_role));

CREATE POLICY "Company admins can manage their empresa_config"
  ON public.empresa_config
  FOR ALL
  USING (empresa_id = user_empresa_id(auth.uid()));

CREATE POLICY "Users can view empresa_config from their company"
  ON public.empresa_config
  FOR SELECT
  USING (
    empresa_id = user_empresa_id(auth.uid()) OR 
    has_role(auth.uid(), 'admin_master'::app_role)
  );

-- Trigger para updated_at
CREATE TRIGGER update_empresa_config_updated_at
  BEFORE UPDATE ON public.empresa_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();