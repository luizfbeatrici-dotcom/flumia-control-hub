-- Add policies to explicitly deny anonymous access to sensitive tables
-- This prevents unauthenticated users from querying PII and business data

-- Block anonymous access to profiles table (user emails)
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Block anonymous access to empresas table (business contact info)
CREATE POLICY "Deny anonymous access to empresas"
ON public.empresas
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Block anonymous access to pessoas table (customer PII)
CREATE POLICY "Deny anonymous access to pessoas"
ON public.pessoas
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Block anonymous access to pessoa_enderecos table (customer addresses)
CREATE POLICY "Deny anonymous access to pessoa_enderecos"
ON public.pessoa_enderecos
FOR SELECT
USING (auth.uid() IS NOT NULL);