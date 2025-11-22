-- ============================================
-- ADICIONAR LOGO PARA EMPRESAS
-- ============================================

-- 1. Adicionar campo logo_url na tabela empresas
ALTER TABLE public.empresas 
ADD COLUMN IF NOT EXISTS logo_url text;

COMMENT ON COLUMN public.empresas.logo_url IS 'URL do logo da empresa armazenado no Supabase Storage';

-- 2. Criar bucket para logos de empresas (público)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'empresa-logos',
  'empresa-logos',
  true, -- bucket público para exibição dos logos
  5242880, -- 5MB limite
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;