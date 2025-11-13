-- Criar tabela de características dos planos
CREATE TABLE public.caracteristicas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  ordem INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de relacionamento entre planos e características
CREATE TABLE public.plano_caracteristicas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plano_id UUID NOT NULL REFERENCES public.planos(id) ON DELETE CASCADE,
  caracteristica_id UUID NOT NULL REFERENCES public.caracteristicas(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(plano_id, caracteristica_id)
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.caracteristicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plano_caracteristicas ENABLE ROW LEVEL SECURITY;

-- Políticas para caracteristicas
CREATE POLICY "Admin masters can manage all caracteristicas"
  ON public.caracteristicas
  FOR ALL
  USING (has_role(auth.uid(), 'admin_master'::app_role));

CREATE POLICY "Everyone can view active caracteristicas"
  ON public.caracteristicas
  FOR SELECT
  USING (ativo = true OR has_role(auth.uid(), 'admin_master'::app_role));

-- Políticas para plano_caracteristicas
CREATE POLICY "Admin masters can manage all plano_caracteristicas"
  ON public.plano_caracteristicas
  FOR ALL
  USING (has_role(auth.uid(), 'admin_master'::app_role));

CREATE POLICY "Everyone can view plano_caracteristicas"
  ON public.plano_caracteristicas
  FOR SELECT
  USING (true);

-- Trigger para updated_at
CREATE TRIGGER update_caracteristicas_updated_at
  BEFORE UPDATE ON public.caracteristicas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();