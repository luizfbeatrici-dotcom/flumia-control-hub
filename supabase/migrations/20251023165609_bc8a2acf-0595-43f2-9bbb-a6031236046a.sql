-- Atualizar trigger handle_new_user para criar roles automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Inserir profile
  INSERT INTO public.profiles (id, nome, email, empresa_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    NEW.email,
    (NEW.raw_user_meta_data->>'empresa_id')::uuid
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
$function$;

-- Popular roles para usuários existentes
-- gustavo.lattmann@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT 'dae0789a-94e5-4932-8f44-774f48d625dd', 'admin_master'
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = 'dae0789a-94e5-4932-8f44-774f48d625dd'
);

-- luizfbeatrici@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT '1008d945-7e27-4b83-b290-2073ccb48b67', 'admin_master'
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = '1008d945-7e27-4b83-b290-2073ccb48b67'
);