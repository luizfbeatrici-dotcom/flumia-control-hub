-- Create platform_config table for system-wide configurations
CREATE TABLE IF NOT EXISTS public.platform_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  smtp_host TEXT,
  smtp_port INTEGER DEFAULT 587,
  smtp_user TEXT,
  smtp_password TEXT,
  smtp_from_email TEXT,
  smtp_from_name TEXT,
  smtp_use_tls BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_config ENABLE ROW LEVEL SECURITY;

-- Policy: Only admin_master can select
CREATE POLICY "Admin master can select platform config"
ON public.platform_config
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin_master'));

-- Policy: Only admin_master can insert
CREATE POLICY "Admin master can insert platform config"
ON public.platform_config
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin_master'));

-- Policy: Only admin_master can update
CREATE POLICY "Admin master can update platform config"
ON public.platform_config
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin_master'))
WITH CHECK (public.has_role(auth.uid(), 'admin_master'));

-- Policy: Only admin_master can delete
CREATE POLICY "Admin master can delete platform config"
ON public.platform_config
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin_master'));

-- Create trigger for updated_at
CREATE TRIGGER update_platform_config_updated_at
BEFORE UPDATE ON public.platform_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default record
INSERT INTO public.platform_config (id) 
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;