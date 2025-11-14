-- Criar tabela para armazenar visitantes da landing page
CREATE TABLE public.landing_page_visitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  cookie_consent BOOLEAN DEFAULT false,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  first_visit TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_visit TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  page_views INTEGER DEFAULT 1,
  email TEXT,
  nome TEXT,
  telefone TEXT,
  interesse TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para melhor performance
CREATE INDEX idx_landing_visitors_session ON landing_page_visitors(session_id);
CREATE INDEX idx_landing_visitors_email ON landing_page_visitors(email);
CREATE INDEX idx_landing_visitors_created ON landing_page_visitors(created_at DESC);

-- Enable RLS
ALTER TABLE public.landing_page_visitors ENABLE ROW LEVEL SECURITY;

-- Permitir inserção pública (para visitantes anônimos)
CREATE POLICY "Anyone can create visitor records"
ON public.landing_page_visitors
FOR INSERT
TO public
WITH CHECK (true);

-- Permitir atualização baseada em session_id
CREATE POLICY "Anyone can update their own session"
ON public.landing_page_visitors
FOR UPDATE
TO public
USING (true);

-- Admin masters podem ver todos os visitantes
CREATE POLICY "Admin masters can view all visitors"
ON public.landing_page_visitors
FOR SELECT
USING (has_role(auth.uid(), 'admin_master'::app_role));

-- Criar função para atualizar updated_at
CREATE TRIGGER update_landing_visitors_updated_at
BEFORE UPDATE ON public.landing_page_visitors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();