-- Criar tabela para mensagens enviadas
CREATE TABLE public.mensagens_enviadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  contato_id UUID NOT NULL REFERENCES public.contatos(id) ON DELETE CASCADE,
  aplicativo_id UUID REFERENCES public.aplicativos(id) ON DELETE SET NULL,
  wamid TEXT,
  message_type VARCHAR NOT NULL,
  message_body TEXT,
  interactive_data JSONB,
  image_data JSONB,
  audio_data JSONB,
  status VARCHAR DEFAULT 'pending', -- pending, sent, delivered, read, failed
  error_message TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Criar índices para otimizar consultas
CREATE INDEX idx_mensagens_enviadas_empresa_id ON public.mensagens_enviadas(empresa_id);
CREATE INDEX idx_mensagens_enviadas_contato_id ON public.mensagens_enviadas(contato_id);
CREATE INDEX idx_mensagens_enviadas_created_at ON public.mensagens_enviadas(created_at DESC);
CREATE INDEX idx_mensagens_enviadas_status ON public.mensagens_enviadas(status);

-- Habilitar RLS
ALTER TABLE public.mensagens_enviadas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Admin masters can manage all sent messages"
  ON public.mensagens_enviadas
  FOR ALL
  USING (has_role(auth.uid(), 'admin_master'::app_role));

CREATE POLICY "Company users can manage their sent messages"
  ON public.mensagens_enviadas
  FOR ALL
  USING (empresa_id = user_empresa_id(auth.uid()));

CREATE POLICY "Users can view sent messages from their company"
  ON public.mensagens_enviadas
  FOR SELECT
  USING (
    empresa_id = user_empresa_id(auth.uid()) 
    OR has_role(auth.uid(), 'admin_master'::app_role)
  );

-- Trigger para atualizar updated_at
CREATE TRIGGER update_mensagens_enviadas_updated_at
  BEFORE UPDATE ON public.mensagens_enviadas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();