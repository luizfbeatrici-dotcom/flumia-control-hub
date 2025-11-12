-- Create messages log table
CREATE TABLE public.mensagens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contato_id uuid NOT NULL,
  empresa_id uuid NOT NULL,
  message_type varchar(20) NOT NULL,
  message_body text,
  wamid text,
  payload jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT fk_mensagens_contato FOREIGN KEY (contato_id) REFERENCES public.contatos(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_mensagens_contato_id ON public.mensagens(contato_id);
CREATE INDEX idx_mensagens_empresa_id ON public.mensagens(empresa_id);
CREATE INDEX idx_mensagens_created_at ON public.mensagens(created_at DESC);
CREATE INDEX idx_mensagens_wamid ON public.mensagens(wamid) WHERE wamid IS NOT NULL;

-- Enable RLS
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admin masters can manage all mensagens"
ON public.mensagens
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin_master'::app_role));

CREATE POLICY "Company users can manage their mensagens"
ON public.mensagens
FOR ALL
TO authenticated
USING (empresa_id = user_empresa_id(auth.uid()));

CREATE POLICY "Users can view mensagens from their company"
ON public.mensagens
FOR SELECT
TO authenticated
USING (
  empresa_id = user_empresa_id(auth.uid()) 
  OR has_role(auth.uid(), 'admin_master'::app_role)
);