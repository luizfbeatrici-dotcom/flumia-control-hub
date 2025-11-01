-- Create pagamentos table
CREATE TABLE public.pagamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE RESTRICT,
  pedido_id uuid NOT NULL REFERENCES public.pedidos(id) ON DELETE RESTRICT,
  pix_url text NOT NULL,
  pix_base64 text NOT NULL,
  id_transacao text NOT NULL,
  ticket_url text,
  date_created timestamp with time zone,
  date_of_expiration timestamp with time zone,
  status text DEFAULT 'pending',
  mercadopago_config_id uuid REFERENCES public.mercadopago_config(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  date_approved timestamp with time zone,
  date_last_updated timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT pagamentos_status_check CHECK (
    status IN ('pending', 'approved', 'authorized', 'in_process', 'in_mediation', 'rejected', 'cancelled', 'refunded', 'charged_back')
  )
);

-- Create index on mercadopago_config_id for better query performance
CREATE INDEX pagamentos_mercadopago_config_id_idx ON public.pagamentos(mercadopago_config_id);

-- Create index on pedido_id for better query performance
CREATE INDEX pagamentos_pedido_id_idx ON public.pagamentos(pedido_id);

-- Create index on empresa_id for better query performance
CREATE INDEX pagamentos_empresa_id_idx ON public.pagamentos(empresa_id);

-- Enable RLS
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admin masters can manage all pagamentos"
  ON public.pagamentos
  FOR ALL
  USING (has_role(auth.uid(), 'admin_master'));

CREATE POLICY "Company users can manage their pagamentos"
  ON public.pagamentos
  FOR ALL
  USING (empresa_id = user_empresa_id(auth.uid()));

CREATE POLICY "Users can view pagamentos from their company"
  ON public.pagamentos
  FOR SELECT
  USING (
    empresa_id = user_empresa_id(auth.uid()) OR 
    has_role(auth.uid(), 'admin_master')
  );

-- Add trigger for updated_at
CREATE TRIGGER update_pagamentos_updated_at
  BEFORE UPDATE ON public.pagamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();