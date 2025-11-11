-- Criar tabela para pré-cadastro de clientes
CREATE TABLE public.pre_cadastros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL,
  nome TEXT NOT NULL,
  cpf TEXT,
  email TEXT,
  endereco TEXT,
  complemento TEXT,
  bairro TEXT,
  cidade TEXT,
  cep TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.pre_cadastros ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Admin masters can manage all pre_cadastros" 
ON public.pre_cadastros 
FOR ALL 
USING (has_role(auth.uid(), 'admin_master'));

CREATE POLICY "Company users can manage their pre_cadastros" 
ON public.pre_cadastros 
FOR ALL 
USING (empresa_id = user_empresa_id(auth.uid()));

CREATE POLICY "Users can view pre_cadastros from their company" 
ON public.pre_cadastros 
FOR SELECT 
USING (
  empresa_id = user_empresa_id(auth.uid()) OR 
  has_role(auth.uid(), 'admin_master')
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_pre_cadastros_updated_at
BEFORE UPDATE ON public.pre_cadastros
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();