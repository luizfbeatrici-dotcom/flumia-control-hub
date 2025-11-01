-- Create mercadopago_config table
CREATE TABLE public.mercadopago_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  public_key text NOT NULL,
  access_token text NOT NULL,
  refresh_token text,
  token_type varchar(50),
  expires_in integer,
  notification_url text,
  url text NOT NULL DEFAULT 'https://api.mercadopago.com/v1/payments',
  client_id text,
  client_secret text,
  tipo varchar(10) NOT NULL DEFAULT 'test',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT mercadopago_config_tipo_check CHECK (lower(tipo) = ANY (ARRAY['prod'::text, 'test'::text])),
  CONSTRAINT mercadopago_config_empresa_tipo_unique UNIQUE (empresa_id, tipo)
);

-- Create index for better query performance
CREATE INDEX mercadopago_config_empresa_tipo_idx ON public.mercadopago_config USING btree (empresa_id, tipo);

-- Enable RLS
ALTER TABLE public.mercadopago_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admin masters can manage all mercadopago configs"
  ON public.mercadopago_config
  FOR ALL
  USING (has_role(auth.uid(), 'admin_master'));

CREATE POLICY "Company admins can manage their mercadopago config"
  ON public.mercadopago_config
  FOR ALL
  USING (empresa_id = user_empresa_id(auth.uid()));

CREATE POLICY "Users can view mercadopago config from their company"
  ON public.mercadopago_config
  FOR SELECT
  USING (empresa_id = user_empresa_id(auth.uid()) OR has_role(auth.uid(), 'admin_master'));

-- Trigger for updated_at
CREATE TRIGGER update_mercadopago_config_updated_at
  BEFORE UPDATE ON public.mercadopago_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();