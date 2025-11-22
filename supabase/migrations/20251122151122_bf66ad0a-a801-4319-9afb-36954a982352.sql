-- ============================================
-- REFORÇO DE SEGURANÇA RLS - PROTEÇÃO COMPLETA
-- ============================================

-- 1. Garantir que RLS está habilitado em TODAS as tabelas
ALTER TABLE public.api_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aplicativos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caracteristicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contato_sub_etapa_respostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.depoimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresa_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresa_tipos_entrega ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.etapas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jornadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_page_visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens_enviadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mercadopago_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pessoa_enderecos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pessoas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plano_caracteristicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_cadastros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produto_imagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_etapas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_entrega ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2. ADICIONAR POLICIES FALTANTES PARA user_roles (CRÍTICO!)
-- Esta tabela é fundamental para o sistema de permissões

-- Remover policies antigas se existirem
DROP POLICY IF EXISTS "Admin masters can manage all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admin masters can view all user roles" ON public.user_roles;

-- Admin masters podem gerenciar todas as roles
CREATE POLICY "Admin masters can manage all user roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin_master'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin_master'::app_role));

-- Usuários podem ver suas próprias roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 3. REFORÇAR PROTEÇÃO DE DADOS SENSÍVEIS (PII)
-- Adicionar policy extra para garantir que dados sensíveis só são acessados por autenticados

-- Pessoas (contém email, celular, cnpjf)
DROP POLICY IF EXISTS "Prevent public access to pessoas" ON public.pessoas;
CREATE POLICY "Prevent public access to pessoas"
ON public.pessoas
FOR ALL
TO anon
USING (false);

-- Pessoa endereços (contém endereço completo, CEP)
DROP POLICY IF EXISTS "Prevent public access to pessoa_enderecos" ON public.pessoa_enderecos;
CREATE POLICY "Prevent public access to pessoa_enderecos"
ON public.pessoa_enderecos
FOR ALL
TO anon
USING (false);

-- Profiles (contém email)
DROP POLICY IF EXISTS "Prevent public access to profiles" ON public.profiles;
CREATE POLICY "Prevent public access to profiles"
ON public.profiles
FOR ALL
TO anon
USING (false);

-- Contatos (contém name, wa_id, whatsapp_from)
DROP POLICY IF EXISTS "Prevent public access to contatos" ON public.contatos;
CREATE POLICY "Prevent public access to contatos"
ON public.contatos
FOR ALL
TO anon
USING (false);

-- Landing page visitors (contém email, telefone, IP)
DROP POLICY IF EXISTS "Restrict landing_page_visitors data access" ON public.landing_page_visitors;
CREATE POLICY "Restrict landing_page_visitors data access"
ON public.landing_page_visitors
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin_master'::app_role));

-- 4. ADICIONAR POLICY FALTANTE PARA tipos_entrega
DROP POLICY IF EXISTS "Admin masters can manage tipos_entrega" ON public.tipos_entrega;
DROP POLICY IF EXISTS "Everyone can view active tipos_entrega" ON public.tipos_entrega;

CREATE POLICY "Admin masters can manage tipos_entrega"
ON public.tipos_entrega
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin_master'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin_master'::app_role));

CREATE POLICY "Everyone can view active tipos_entrega"
ON public.tipos_entrega
FOR SELECT
TO authenticated
USING (ativo = true OR public.has_role(auth.uid(), 'admin_master'::app_role));

-- 5. BLOQUEAR ACESSO ANÔNIMO A DADOS FINANCEIROS/SENSÍVEIS
DROP POLICY IF EXISTS "Block anon access to mercadopago_config" ON public.mercadopago_config;
CREATE POLICY "Block anon access to mercadopago_config"
ON public.mercadopago_config
FOR ALL
TO anon
USING (false);

DROP POLICY IF EXISTS "Block anon access to pagamentos" ON public.pagamentos;
CREATE POLICY "Block anon access to pagamentos"
ON public.pagamentos
FOR ALL
TO anon
USING (false);

DROP POLICY IF EXISTS "Block anon access to pedidos" ON public.pedidos;
CREATE POLICY "Block anon access to pedidos"
ON public.pedidos
FOR ALL
TO anon
USING (false);

-- 6. PROTEGER CONFIGURAÇÕES SENSÍVEIS
DROP POLICY IF EXISTS "Block anon access to api_tokens" ON public.api_tokens;
CREATE POLICY "Block anon access to api_tokens"
ON public.api_tokens
FOR ALL
TO anon
USING (false);

DROP POLICY IF EXISTS "Block anon access to aplicativos" ON public.aplicativos;
CREATE POLICY "Block anon access to aplicativos"
ON public.aplicativos
FOR ALL
TO anon
USING (false);

-- 7. GARANTIR QUE APENAS AUTHENTICATED USERS POSSAM INSERIR EM TABELAS CRÍTICAS
-- Bloquear inserções anônimas em user_roles (prevenção de escalação de privilégios)
DROP POLICY IF EXISTS "Prevent anon insert to user_roles" ON public.user_roles;
CREATE POLICY "Prevent anon insert to user_roles"
ON public.user_roles
FOR INSERT
TO anon
WITH CHECK (false);

-- Comentário final de segurança
COMMENT ON TABLE public.pessoas IS 'ATENÇÃO: Tabela contém PII (email, celular, CPF/CNPJ). RLS obrigatório.';
COMMENT ON TABLE public.pessoa_enderecos IS 'ATENÇÃO: Tabela contém PII (endereço completo, CEP). RLS obrigatório.';
COMMENT ON TABLE public.profiles IS 'ATENÇÃO: Tabela contém PII (email). RLS obrigatório.';
COMMENT ON TABLE public.landing_page_visitors IS 'ATENÇÃO: Tabela contém PII (email, telefone, IP). Acesso restrito apenas admin_master.';
COMMENT ON TABLE public.user_roles IS 'CRÍTICO: Tabela de permissões. Apenas admin_master pode modificar.';