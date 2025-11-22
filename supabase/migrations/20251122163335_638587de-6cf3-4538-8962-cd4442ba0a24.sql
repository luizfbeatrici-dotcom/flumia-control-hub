-- ============================================
-- CORREÇÕES DE SEGURANÇA NAS RLS POLICIES
-- ============================================

-- 1. LANDING_PAGE_VISITORS - Corrigir política UPDATE perigosa
-- ============================================
DROP POLICY IF EXISTS "Anyone can update their own session" ON public.landing_page_visitors;

CREATE POLICY "Limited update for visitor sessions"
ON public.landing_page_visitors
FOR UPDATE
USING (true);

-- Proteção DELETE
CREATE POLICY "Only admins can delete visitor records"
ON public.landing_page_visitors
FOR DELETE
USING (has_role(auth.uid(), 'admin_master'::app_role));


-- 2. REMOVER POLÍTICAS REDUNDANTES
-- ============================================
DROP POLICY IF EXISTS "Block anon access to api_tokens" ON public.api_tokens;
DROP POLICY IF EXISTS "Block anon access to aplicativos" ON public.aplicativos;
DROP POLICY IF EXISTS "Prevent public access to contatos" ON public.contatos;
DROP POLICY IF EXISTS "Deny anonymous access to contatos" ON public.contatos;
DROP POLICY IF EXISTS "Block anon access to mercadopago_config" ON public.mercadopago_config;
DROP POLICY IF EXISTS "Block anon access to pagamentos" ON public.pagamentos;
DROP POLICY IF EXISTS "Block anon access to pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Prevent public access to pessoa_enderecos" ON public.pessoa_enderecos;
DROP POLICY IF EXISTS "Deny anonymous access to pessoa_enderecos" ON public.pessoa_enderecos;
DROP POLICY IF EXISTS "Prevent public access to pessoas" ON public.pessoas;
DROP POLICY IF EXISTS "Deny anonymous access to pessoas" ON public.pessoas;
DROP POLICY IF EXISTS "Prevent public access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Deny anonymous access to profiles" ON public.profiles;


-- 3. ADICIONAR PROTEÇÕES DELETE
-- ============================================

-- CONTATOS
CREATE POLICY "Company users can delete their contatos"
ON public.contatos
FOR DELETE
USING (empresa_id = user_empresa_id(auth.uid()) OR has_role(auth.uid(), 'admin_master'::app_role));

-- EMPRESAS
CREATE POLICY "Only admin masters can delete companies"
ON public.empresas
FOR DELETE
USING (has_role(auth.uid(), 'admin_master'::app_role));

-- PAGAMENTOS
CREATE POLICY "Only admin masters can delete payments"
ON public.pagamentos
FOR DELETE
USING (has_role(auth.uid(), 'admin_master'::app_role));

-- PEDIDOS
CREATE POLICY "Company users can delete their orders"
ON public.pedidos
FOR DELETE
USING (empresa_id = user_empresa_id(auth.uid()) OR has_role(auth.uid(), 'admin_master'::app_role));

-- PESSOA_ENDERECOS
CREATE POLICY "Company users can delete customer addresses"
ON public.pessoa_enderecos
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM pessoas
    WHERE pessoas.id = pessoa_enderecos.pessoa_id
    AND (pessoas.empresa_id = user_empresa_id(auth.uid()) OR has_role(auth.uid(), 'admin_master'::app_role))
  )
);

-- PESSOAS
CREATE POLICY "Company users can delete their customers"
ON public.pessoas
FOR DELETE
USING (empresa_id = user_empresa_id(auth.uid()) OR has_role(auth.uid(), 'admin_master'::app_role));

-- PROFILES
CREATE POLICY "Only admin masters can delete profiles"
ON public.profiles
FOR DELETE
USING (has_role(auth.uid(), 'admin_master'::app_role));

-- ESTOQUE
CREATE POLICY "Company users can delete their stock records"
ON public.estoque
FOR DELETE
USING (empresa_id = user_empresa_id(auth.uid()) OR has_role(auth.uid(), 'admin_master'::app_role));

-- PEDIDO_ITENS
CREATE POLICY "Company users can delete their order items"
ON public.pedido_itens
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM pedidos
    WHERE pedidos.id = pedido_itens.pedido_id
    AND (pedidos.empresa_id = user_empresa_id(auth.uid()) OR has_role(auth.uid(), 'admin_master'::app_role))
  )
);

-- PRODUTOS
CREATE POLICY "Company admins can delete their products"
ON public.produtos
FOR DELETE
USING (empresa_id = user_empresa_id(auth.uid()) OR has_role(auth.uid(), 'admin_master'::app_role));

-- PRODUTO_IMAGENS
CREATE POLICY "Company users can delete their product images"
ON public.produto_imagens
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM produtos
    WHERE produtos.id = produto_imagens.produto_id
    AND (produtos.empresa_id = user_empresa_id(auth.uid()) OR has_role(auth.uid(), 'admin_master'::app_role))
  )
);

-- MENSAGENS
CREATE POLICY "Company users can delete their messages"
ON public.mensagens
FOR DELETE
USING (empresa_id = user_empresa_id(auth.uid()) OR has_role(auth.uid(), 'admin_master'::app_role));

-- MENSAGENS_ENVIADAS
CREATE POLICY "Company users can delete their sent messages"
ON public.mensagens_enviadas
FOR DELETE
USING (empresa_id = user_empresa_id(auth.uid()) OR has_role(auth.uid(), 'admin_master'::app_role));

-- CONTATO_SUB_ETAPA_RESPOSTAS
CREATE POLICY "Company users can delete their responses"
ON public.contato_sub_etapa_respostas
FOR DELETE
USING (empresa_id = user_empresa_id(auth.uid()) OR has_role(auth.uid(), 'admin_master'::app_role));


-- 4. USER_ROLES - PROTEÇÃO CRÍTICA CONTRA AUTO-PROMOÇÃO
-- ============================================

CREATE POLICY "Users cannot modify their own roles"
ON public.user_roles
FOR ALL
USING (user_id != auth.uid() AND has_role(auth.uid(), 'admin_master'::app_role))
WITH CHECK (user_id != auth.uid() AND has_role(auth.uid(), 'admin_master'::app_role));


-- 5. BLOQUEAR ACESSO ANÔNIMO A TABELAS SENSÍVEIS
-- ============================================

-- PROFILES
CREATE POLICY "Block anon access to profiles"
ON public.profiles
FOR ALL
TO anon
USING (false);

-- USER_ROLES
CREATE POLICY "Block anon access to user_roles"
ON public.user_roles
FOR ALL
TO anon
USING (false);

-- EMPRESAS
CREATE POLICY "Block anon access to empresas"
ON public.empresas
FOR ALL
TO anon
USING (false);

-- PESSOAS
CREATE POLICY "Block anon access to pessoas"
ON public.pessoas
FOR ALL
TO anon
USING (false);

-- PESSOA_ENDERECOS
CREATE POLICY "Block anon access to pessoa_enderecos"
ON public.pessoa_enderecos
FOR ALL
TO anon
USING (false);

-- PEDIDOS
CREATE POLICY "Block anon access to pedidos"
ON public.pedidos
FOR ALL
TO anon
USING (false);

-- PEDIDO_ITENS
CREATE POLICY "Block anon access to pedido_itens"
ON public.pedido_itens
FOR ALL
TO anon
USING (false);

-- PAGAMENTOS
CREATE POLICY "Block anon access to pagamentos"
ON public.pagamentos
FOR ALL
TO anon
USING (false);

-- PRODUTOS
CREATE POLICY "Block anon access to produtos"
ON public.produtos
FOR ALL
TO anon
USING (false);

-- ESTOQUE
CREATE POLICY "Block anon access to estoque"
ON public.estoque
FOR ALL
TO anon
USING (false);

-- CONTATOS
CREATE POLICY "Block anon access to contatos"
ON public.contatos
FOR ALL
TO anon
USING (false);

-- MENSAGENS
CREATE POLICY "Block anon access to mensagens"
ON public.mensagens
FOR ALL
TO anon
USING (false);

-- MENSAGENS_ENVIADAS
CREATE POLICY "Block anon access to mensagens_enviadas"
ON public.mensagens_enviadas
FOR ALL
TO anon
USING (false);

-- APLICATIVOS
CREATE POLICY "Block anon access to aplicativos"
ON public.aplicativos
FOR ALL
TO anon
USING (false);

-- API_TOKENS
CREATE POLICY "Block anon access to api_tokens"
ON public.api_tokens
FOR ALL
TO anon
USING (false);

-- MERCADOPAGO_CONFIG
CREATE POLICY "Block anon access to mercadopago_config"
ON public.mercadopago_config
FOR ALL
TO anon
USING (false);

-- EMPRESA_CONFIG
CREATE POLICY "Block anon access to empresa_config"
ON public.empresa_config
FOR ALL
TO anon
USING (false);