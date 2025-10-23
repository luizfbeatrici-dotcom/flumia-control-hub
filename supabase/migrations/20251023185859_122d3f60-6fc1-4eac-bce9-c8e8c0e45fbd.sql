-- Add app integration columns to empresas table
ALTER TABLE public.empresas
ADD COLUMN app_contato TEXT,
ADD COLUMN app_ativo BOOLEAN DEFAULT false,
ADD COLUMN app_meta_id TEXT,
ADD COLUMN app_whatsapp_id TEXT,
ADD COLUMN app_business_id TEXT;