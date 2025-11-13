-- Create notification types enum
CREATE TYPE public.notification_type AS ENUM (
  'conversa_iniciada',
  'venda_finalizada',
  'pagamento_finalizado'
);

-- Create notification settings table (admin master only)
CREATE TABLE public.notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo notification_type NOT NULL UNIQUE,
  ativo BOOLEAN NOT NULL DEFAULT true,
  titulo TEXT NOT NULL,
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  tipo notification_type NOT NULL,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  link TEXT,
  lida BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  pedido_id UUID REFERENCES public.pedidos(id) ON DELETE CASCADE,
  contato_id UUID REFERENCES public.contatos(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_settings
CREATE POLICY "Admin masters can manage notification settings"
  ON public.notification_settings
  FOR ALL
  USING (has_role(auth.uid(), 'admin_master'));

CREATE POLICY "Everyone can view notification settings"
  ON public.notification_settings
  FOR SELECT
  USING (true);

-- RLS Policies for notifications
CREATE POLICY "Admin masters can manage all notifications"
  ON public.notifications
  FOR ALL
  USING (has_role(auth.uid(), 'admin_master'));

CREATE POLICY "Company users can view their notifications"
  ON public.notifications
  FOR SELECT
  USING (empresa_id = user_empresa_id(auth.uid()) OR has_role(auth.uid(), 'admin_master'));

CREATE POLICY "Company users can update their notifications"
  ON public.notifications
  FOR UPDATE
  USING (empresa_id = user_empresa_id(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON public.notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default notification settings
INSERT INTO public.notification_settings (tipo, titulo, descricao, ativo) VALUES
  ('conversa_iniciada', 'Conversa Iniciada', 'Notificar quando um novo contato iniciar uma conversa', true),
  ('venda_finalizada', 'Venda Finalizada', 'Notificar quando uma venda for finalizada', true),
  ('pagamento_finalizado', 'Pagamento Finalizado', 'Notificar quando um pagamento for confirmado', true);

-- Create index for better performance
CREATE INDEX idx_notifications_empresa_lida ON public.notifications(empresa_id, lida);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;