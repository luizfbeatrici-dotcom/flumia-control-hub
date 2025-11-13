-- Remove as políticas antigas primeiro
DROP POLICY IF EXISTS "Admin masters can manage all etapas" ON public.etapas;
DROP POLICY IF EXISTS "Company users can manage their etapas" ON public.etapas;
DROP POLICY IF EXISTS "Users can view etapas from their company" ON public.etapas;
DROP POLICY IF EXISTS "Deny anonymous access to etapas" ON public.etapas;

-- Agora remove a coluna empresa_id
ALTER TABLE public.etapas DROP COLUMN IF EXISTS empresa_id;

-- Criar novas políticas para etapas globais
CREATE POLICY "Admin masters can manage all etapas"
ON public.etapas
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin_master'::app_role));

CREATE POLICY "All authenticated users can view etapas"
ON public.etapas
FOR SELECT
TO authenticated
USING (true);