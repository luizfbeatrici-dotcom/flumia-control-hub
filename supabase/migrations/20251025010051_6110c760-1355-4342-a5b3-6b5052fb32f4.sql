-- Fix anonymous access issues for profiles and empresas tables
-- These policies should already exist based on the schema, but we'll ensure they're in place

-- First, let's verify and recreate the policies if needed
-- Drop existing policies to avoid conflicts (if they exist)
DROP POLICY IF EXISTS "Deny anonymous access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Deny anonymous access to empresas" ON public.empresas;
DROP POLICY IF EXISTS "Deny anonymous access to pessoas" ON public.pessoas;
DROP POLICY IF EXISTS "Deny anonymous access to pessoa_enderecos" ON public.pessoa_enderecos;

-- Recreate the policies with explicit deny for anonymous users
-- This ensures that only authenticated users can access these tables

-- Profiles table - deny anonymous access
CREATE POLICY "Deny anonymous access to profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Empresas table - deny anonymous access  
CREATE POLICY "Deny anonymous access to empresas" 
ON public.empresas 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Pessoas table - deny anonymous access (already exists but ensuring consistency)
CREATE POLICY "Deny anonymous access to pessoas" 
ON public.pessoas 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Pessoa enderecos table - deny anonymous access (already exists but ensuring consistency)
CREATE POLICY "Deny anonymous access to pessoa_enderecos" 
ON public.pessoa_enderecos 
FOR SELECT 
USING (auth.uid() IS NOT NULL);