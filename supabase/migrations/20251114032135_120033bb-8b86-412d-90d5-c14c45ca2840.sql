-- Criar função para criar cliente Consumidor Final automaticamente
CREATE OR REPLACE FUNCTION public.create_consumidor_final()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insere o cliente Consumidor Final para a nova empresa
  INSERT INTO public.pessoas (empresa_id, nome, cnpjf)
  VALUES (NEW.id, 'Consumidor Final', '00000000000');
  
  RETURN NEW;
END;
$$;

-- Criar trigger para executar após insert em empresas
CREATE TRIGGER on_empresa_created
  AFTER INSERT ON public.empresas
  FOR EACH ROW
  EXECUTE FUNCTION public.create_consumidor_final();

-- Inserir Consumidor Final para todas as empresas existentes
INSERT INTO public.pessoas (empresa_id, nome, cnpjf)
SELECT id, 'Consumidor Final', '00000000000'
FROM public.empresas
WHERE NOT EXISTS (
  SELECT 1 FROM public.pessoas 
  WHERE pessoas.empresa_id = empresas.id 
  AND pessoas.nome = 'Consumidor Final'
);