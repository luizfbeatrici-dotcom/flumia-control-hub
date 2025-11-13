-- Criar tabela de sub_etapas
CREATE TABLE public.sub_etapas (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  etapa_id uuid NOT NULL REFERENCES public.etapas(id) ON DELETE CASCADE,
  nome text NOT NULL,
  descricao text,
  ordem integer NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  campos_solicitados jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar índice para melhor performance
CREATE INDEX idx_sub_etapas_etapa_id ON public.sub_etapas(etapa_id);
CREATE INDEX idx_sub_etapas_ordem ON public.sub_etapas(ordem);

-- Habilitar RLS
ALTER TABLE public.sub_etapas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para sub_etapas
CREATE POLICY "Admin masters can manage all sub_etapas"
ON public.sub_etapas
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin_master'::app_role));

CREATE POLICY "All authenticated users can view sub_etapas"
ON public.sub_etapas
FOR SELECT
TO authenticated
USING (true);

-- Criar tabela de respostas das sub_etapas
CREATE TABLE public.contato_sub_etapa_respostas (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contato_id uuid NOT NULL REFERENCES public.contatos(id) ON DELETE CASCADE,
  sub_etapa_id uuid NOT NULL REFERENCES public.sub_etapas(id) ON DELETE CASCADE,
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  dados jsonb NOT NULL DEFAULT '{}'::jsonb,
  completada boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(contato_id, sub_etapa_id)
);

-- Criar índices
CREATE INDEX idx_contato_sub_etapa_respostas_contato_id ON public.contato_sub_etapa_respostas(contato_id);
CREATE INDEX idx_contato_sub_etapa_respostas_sub_etapa_id ON public.contato_sub_etapa_respostas(sub_etapa_id);
CREATE INDEX idx_contato_sub_etapa_respostas_empresa_id ON public.contato_sub_etapa_respostas(empresa_id);

-- Habilitar RLS
ALTER TABLE public.contato_sub_etapa_respostas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para respostas
CREATE POLICY "Admin masters can manage all respostas"
ON public.contato_sub_etapa_respostas
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin_master'::app_role));

CREATE POLICY "Company users can manage their respostas"
ON public.contato_sub_etapa_respostas
FOR ALL
TO authenticated
USING (empresa_id = user_empresa_id(auth.uid()));

CREATE POLICY "Users can view respostas from their company"
ON public.contato_sub_etapa_respostas
FOR SELECT
TO authenticated
USING (empresa_id = user_empresa_id(auth.uid()) OR has_role(auth.uid(), 'admin_master'::app_role));

-- Trigger para updated_at nas sub_etapas
CREATE TRIGGER update_sub_etapas_updated_at
BEFORE UPDATE ON public.sub_etapas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para updated_at nas respostas
CREATE TRIGGER update_contato_sub_etapa_respostas_updated_at
BEFORE UPDATE ON public.contato_sub_etapa_respostas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();