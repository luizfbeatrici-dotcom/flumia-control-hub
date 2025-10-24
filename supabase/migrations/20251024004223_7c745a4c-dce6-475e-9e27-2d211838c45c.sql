-- Criar tabela para armazenar tokens de API das empresas
CREATE TABLE public.api_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  ativo BOOLEAN DEFAULT true,
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.api_tokens ENABLE ROW LEVEL SECURITY;

-- Policies para api_tokens
CREATE POLICY "Admin masters can manage all API tokens"
  ON public.api_tokens
  FOR ALL
  USING (has_role(auth.uid(), 'admin_master'::app_role));

CREATE POLICY "Company admins can manage their API tokens"
  ON public.api_tokens
  FOR ALL
  USING (empresa_id = user_empresa_id(auth.uid()));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_api_tokens_updated_at
  BEFORE UPDATE ON public.api_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Criar índice para melhorar performance de lookup por token
CREATE INDEX idx_api_tokens_token ON public.api_tokens(token) WHERE ativo = true;
CREATE INDEX idx_api_tokens_empresa_id ON public.api_tokens(empresa_id);