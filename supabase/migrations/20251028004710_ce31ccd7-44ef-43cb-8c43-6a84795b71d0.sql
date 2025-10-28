-- Criar tabela de etapas da jornada de contato
CREATE TABLE public.etapas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  ordem INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de contatos WhatsApp
CREATE TABLE public.contatos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL,
  whatsapp_from TEXT NOT NULL,
  name TEXT,
  wa_id TEXT NOT NULL,
  etapa_id UUID NOT NULL,
  menu INTEGER,
  pessoa_id UUID,
  etapa_old_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT contatos_etapa_fk FOREIGN KEY (etapa_id) REFERENCES public.etapas(id) ON DELETE RESTRICT,
  CONSTRAINT contatos_etapa_old_fk FOREIGN KEY (etapa_old_id) REFERENCES public.etapas(id) ON DELETE SET NULL,
  CONSTRAINT contatos_pessoa_fk FOREIGN KEY (pessoa_id) REFERENCES public.pessoas(id) ON DELETE SET NULL
);

-- Índices para melhor performance
CREATE INDEX idx_contatos_empresa_id ON public.contatos(empresa_id);
CREATE INDEX idx_contatos_wa_id ON public.contatos(wa_id);
CREATE INDEX idx_contatos_pessoa_id ON public.contatos(pessoa_id);
CREATE INDEX idx_etapas_empresa_id ON public.etapas(empresa_id);

-- Enable RLS
ALTER TABLE public.etapas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contatos ENABLE ROW LEVEL SECURITY;

-- RLS Policies para etapas
CREATE POLICY "Admin masters can manage all etapas"
ON public.etapas
FOR ALL
USING (has_role(auth.uid(), 'admin_master'::app_role));

CREATE POLICY "Company users can manage their etapas"
ON public.etapas
FOR ALL
USING (empresa_id = user_empresa_id(auth.uid()));

CREATE POLICY "Users can view etapas from their company"
ON public.etapas
FOR SELECT
USING (
  empresa_id = user_empresa_id(auth.uid()) OR 
  has_role(auth.uid(), 'admin_master'::app_role)
);

-- RLS Policies para contatos
CREATE POLICY "Admin masters can manage all contatos"
ON public.contatos
FOR ALL
USING (has_role(auth.uid(), 'admin_master'::app_role));

CREATE POLICY "Company users can manage their contatos"
ON public.contatos
FOR ALL
USING (empresa_id = user_empresa_id(auth.uid()));

CREATE POLICY "Users can view contatos from their company"
ON public.contatos
FOR SELECT
USING (
  empresa_id = user_empresa_id(auth.uid()) OR 
  has_role(auth.uid(), 'admin_master'::app_role)
);

CREATE POLICY "Deny anonymous access to contatos"
ON public.contatos
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Deny anonymous access to etapas"
ON public.etapas
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_etapas_updated_at
BEFORE UPDATE ON public.etapas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contatos_updated_at
BEFORE UPDATE ON public.contatos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();