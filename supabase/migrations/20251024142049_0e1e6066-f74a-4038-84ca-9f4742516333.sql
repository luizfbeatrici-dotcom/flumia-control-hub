-- Atualizar a função handle_new_user para lidar corretamente com empresa_id vazio ou null
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_empresa_id uuid;
BEGIN
  -- Converter empresa_id para UUID, tratando strings vazias como NULL
  v_empresa_id := CASE 
    WHEN NEW.raw_user_meta_data->>'empresa_id' IS NULL THEN NULL
    WHEN TRIM(NEW.raw_user_meta_data->>'empresa_id') = '' THEN NULL
    ELSE (NEW.raw_user_meta_data->>'empresa_id')::uuid
  END;

  -- Inserir profile
  INSERT INTO public.profiles (id, nome, email, empresa_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    NEW.email,
    v_empresa_id
  );

  -- Inserir role baseado em metadados
  IF NEW.raw_user_meta_data->>'is_admin_master' = 'true' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin_master');
  ELSIF NEW.raw_user_meta_data->>'is_company_admin' = 'true' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'company_admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'company_user');
  END IF;

  RETURN NEW;
END;
$$;