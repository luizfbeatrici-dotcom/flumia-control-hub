-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin_master', 'company_admin', 'company_user');

-- Create enum for order status
CREATE TYPE public.order_status AS ENUM ('pending', 'processing', 'completed', 'cancelled');

-- Create enum for product visibility
CREATE TYPE public.product_visibility AS ENUM ('visible', 'hidden');

-- Create empresas (companies) table
CREATE TABLE public.empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razao_social TEXT NOT NULL,
  fantasia TEXT NOT NULL,
  cnpj TEXT UNIQUE NOT NULL,
  endereco TEXT,
  cidade TEXT,
  celular TEXT,
  whatsapp TEXT,
  dominio TEXT UNIQUE,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_roles table (separated for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to check if user belongs to company
CREATE OR REPLACE FUNCTION public.user_empresa_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT empresa_id FROM public.profiles WHERE id = _user_id
$$;

-- Create cidades (cities) table
CREATE TABLE public.cidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cidade TEXT NOT NULL,
  ibge TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create produtos (products) table
CREATE TABLE public.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
  descricao TEXT NOT NULL,
  complemento TEXT,
  sku TEXT,
  preco1 DECIMAL(10,2),
  preco2 DECIMAL(10,2),
  unidade TEXT,
  categoria TEXT,
  departamento TEXT,
  grupo TEXT,
  subgrupo TEXT,
  visibilidade product_visibility DEFAULT 'visible',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create produto_imagens table
CREATE TABLE public.produto_imagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID REFERENCES public.produtos(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create pessoas (customers) table
CREATE TABLE public.pessoas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  cnpjf TEXT,
  celular TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create pessoa_enderecos table
CREATE TABLE public.pessoa_enderecos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id UUID REFERENCES public.pessoas(id) ON DELETE CASCADE NOT NULL,
  endereco TEXT NOT NULL,
  complemento TEXT,
  bairro TEXT,
  cidade TEXT,
  cep TEXT,
  principal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create pedidos (orders) table
CREATE TABLE public.pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
  pessoa_id UUID REFERENCES public.pessoas(id) ON DELETE CASCADE NOT NULL,
  endereco_id UUID REFERENCES public.pessoa_enderecos(id),
  status order_status DEFAULT 'pending',
  total DECIMAL(10,2) DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create pedido_itens table
CREATE TABLE public.pedido_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID REFERENCES public.pedidos(id) ON DELETE CASCADE NOT NULL,
  produto_id UUID REFERENCES public.produtos(id) ON DELETE CASCADE NOT NULL,
  quantidade DECIMAL(10,3) NOT NULL,
  valor_unitario DECIMAL(10,2) NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create jornadas (automation journey logs) table
CREATE TABLE public.jornadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
  acao TEXT NOT NULL,
  descricao TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produto_imagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pessoas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pessoa_enderecos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jornadas ENABLE ROW LEVEL SECURITY;

-- RLS Policies for empresas
CREATE POLICY "Admin masters can view all companies"
  ON public.empresas FOR SELECT
  USING (public.has_role(auth.uid(), 'admin_master'));

CREATE POLICY "Admin masters can insert companies"
  ON public.empresas FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin_master'));

CREATE POLICY "Admin masters can update companies"
  ON public.empresas FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin_master'));

CREATE POLICY "Company admins can view their company"
  ON public.empresas FOR SELECT
  USING (id = public.user_empresa_id(auth.uid()));

CREATE POLICY "Company admins can update their company"
  ON public.empresas FOR UPDATE
  USING (id = public.user_empresa_id(auth.uid()));

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Admin masters can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin_master'));

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admin masters can manage all profiles"
  ON public.profiles FOR ALL
  USING (public.has_role(auth.uid(), 'admin_master'));

-- RLS Policies for user_roles
CREATE POLICY "Admin masters can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin_master'));

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid());

-- RLS Policies for cidades (public read)
CREATE POLICY "Anyone can view cities"
  ON public.cidades FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin masters can manage cities"
  ON public.cidades FOR ALL
  USING (public.has_role(auth.uid(), 'admin_master'));

-- RLS Policies for produtos
CREATE POLICY "Users can view products from their company"
  ON public.produtos FOR SELECT
  USING (empresa_id = public.user_empresa_id(auth.uid()) OR public.has_role(auth.uid(), 'admin_master'));

CREATE POLICY "Company admins can manage their products"
  ON public.produtos FOR ALL
  USING (empresa_id = public.user_empresa_id(auth.uid()));

CREATE POLICY "Admin masters can manage all products"
  ON public.produtos FOR ALL
  USING (public.has_role(auth.uid(), 'admin_master'));

-- RLS Policies for produto_imagens
CREATE POLICY "Users can view images from their company products"
  ON public.produto_imagens FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.produtos
      WHERE produtos.id = produto_imagens.produto_id
      AND (produtos.empresa_id = public.user_empresa_id(auth.uid()) OR public.has_role(auth.uid(), 'admin_master'))
    )
  );

CREATE POLICY "Company users can manage their product images"
  ON public.produto_imagens FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.produtos
      WHERE produtos.id = produto_imagens.produto_id
      AND produtos.empresa_id = public.user_empresa_id(auth.uid())
    )
  );

-- RLS Policies for pessoas
CREATE POLICY "Users can view customers from their company"
  ON public.pessoas FOR SELECT
  USING (empresa_id = public.user_empresa_id(auth.uid()) OR public.has_role(auth.uid(), 'admin_master'));

CREATE POLICY "Company users can manage their customers"
  ON public.pessoas FOR ALL
  USING (empresa_id = public.user_empresa_id(auth.uid()));

CREATE POLICY "Admin masters can manage all customers"
  ON public.pessoas FOR ALL
  USING (public.has_role(auth.uid(), 'admin_master'));

-- RLS Policies for pessoa_enderecos
CREATE POLICY "Users can view addresses from their company customers"
  ON public.pessoa_enderecos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pessoas
      WHERE pessoas.id = pessoa_enderecos.pessoa_id
      AND (pessoas.empresa_id = public.user_empresa_id(auth.uid()) OR public.has_role(auth.uid(), 'admin_master'))
    )
  );

CREATE POLICY "Company users can manage their customer addresses"
  ON public.pessoa_enderecos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.pessoas
      WHERE pessoas.id = pessoa_enderecos.pessoa_id
      AND pessoas.empresa_id = public.user_empresa_id(auth.uid())
    )
  );

-- RLS Policies for pedidos
CREATE POLICY "Users can view orders from their company"
  ON public.pedidos FOR SELECT
  USING (empresa_id = public.user_empresa_id(auth.uid()) OR public.has_role(auth.uid(), 'admin_master'));

CREATE POLICY "Company users can manage their orders"
  ON public.pedidos FOR ALL
  USING (empresa_id = public.user_empresa_id(auth.uid()));

CREATE POLICY "Admin masters can manage all orders"
  ON public.pedidos FOR ALL
  USING (public.has_role(auth.uid(), 'admin_master'));

-- RLS Policies for pedido_itens
CREATE POLICY "Users can view order items from their company"
  ON public.pedido_itens FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pedidos
      WHERE pedidos.id = pedido_itens.pedido_id
      AND (pedidos.empresa_id = public.user_empresa_id(auth.uid()) OR public.has_role(auth.uid(), 'admin_master'))
    )
  );

CREATE POLICY "Company users can manage their order items"
  ON public.pedido_itens FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.pedidos
      WHERE pedidos.id = pedido_itens.pedido_id
      AND pedidos.empresa_id = public.user_empresa_id(auth.uid())
    )
  );

-- RLS Policies for jornadas
CREATE POLICY "Users can view journey logs from their company"
  ON public.jornadas FOR SELECT
  USING (empresa_id = public.user_empresa_id(auth.uid()) OR public.has_role(auth.uid(), 'admin_master'));

CREATE POLICY "Company users can insert journey logs"
  ON public.jornadas FOR INSERT
  WITH CHECK (empresa_id = public.user_empresa_id(auth.uid()));

CREATE POLICY "Admin masters can manage all journey logs"
  ON public.jornadas FOR ALL
  USING (public.has_role(auth.uid(), 'admin_master'));

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add triggers for updated_at
CREATE TRIGGER update_empresas_updated_at BEFORE UPDATE ON public.empresas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_produtos_updated_at BEFORE UPDATE ON public.produtos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pessoas_updated_at BEFORE UPDATE ON public.pessoas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pessoa_enderecos_updated_at BEFORE UPDATE ON public.pessoa_enderecos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pedidos_updated_at BEFORE UPDATE ON public.pedidos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, empresa_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    NEW.email,
    (NEW.raw_user_meta_data->>'empresa_id')::uuid
  );
  RETURN NEW;
END;
$$;

-- Trigger for auto-creating profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();