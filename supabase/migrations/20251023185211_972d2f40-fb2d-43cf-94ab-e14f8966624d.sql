-- Add RLS policy for admin masters to manage pessoa_enderecos
CREATE POLICY "Admin masters can manage all customer addresses"
ON public.pessoa_enderecos
FOR ALL
USING (has_role(auth.uid(), 'admin_master'::app_role));