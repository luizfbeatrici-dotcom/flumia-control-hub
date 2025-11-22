-- Create audit logs table for tracking critical administrative actions
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Who performed the action
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email TEXT,
  admin_name TEXT,
  
  -- What action was performed
  action_type TEXT NOT NULL, -- 'user_created', 'user_deleted', 'role_added', 'role_removed', 'profile_updated'
  table_name TEXT NOT NULL,
  
  -- Who/what was affected
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_email TEXT,
  record_id UUID,
  
  -- Details of the change
  old_values JSONB,
  new_values JSONB,
  metadata JSONB,
  
  -- Request context
  ip_address TEXT,
  user_agent TEXT
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admin masters can view audit logs
CREATE POLICY "Admin masters can view all audit logs"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin_master'::app_role));

-- Block anonymous access
CREATE POLICY "Block anon access to audit_logs"
  ON public.audit_logs
  FOR ALL
  TO anon
  USING (false);

-- Create index for faster queries
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_admin_user_id ON public.audit_logs(admin_user_id);
CREATE INDEX idx_audit_logs_target_user_id ON public.audit_logs(target_user_id);
CREATE INDEX idx_audit_logs_action_type ON public.audit_logs(action_type);

-- Function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action_type TEXT,
  p_table_name TEXT,
  p_target_user_id UUID DEFAULT NULL,
  p_record_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_audit_id UUID;
  v_admin_profile RECORD;
  v_target_email TEXT;
BEGIN
  -- Get admin user details
  SELECT p.nome, p.email INTO v_admin_profile
  FROM profiles p
  WHERE p.id = auth.uid();
  
  -- Get target user email if applicable
  IF p_target_user_id IS NOT NULL THEN
    SELECT email INTO v_target_email
    FROM auth.users
    WHERE id = p_target_user_id;
  END IF;
  
  -- Insert audit log
  INSERT INTO audit_logs (
    admin_user_id,
    admin_email,
    admin_name,
    action_type,
    table_name,
    target_user_id,
    target_email,
    record_id,
    old_values,
    new_values,
    metadata
  ) VALUES (
    auth.uid(),
    v_admin_profile.email,
    v_admin_profile.nome,
    p_action_type,
    p_table_name,
    p_target_user_id,
    v_target_email,
    p_record_id,
    p_old_values,
    p_new_values,
    p_metadata
  )
  RETURNING id INTO v_audit_id;
  
  RETURN v_audit_id;
END;
$$;

-- Trigger function for user_roles changes
CREATE OR REPLACE FUNCTION public.audit_user_roles_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_audit_event(
      'role_added',
      'user_roles',
      NEW.user_id,
      NEW.id,
      NULL,
      jsonb_build_object('role', NEW.role),
      jsonb_build_object('operation', 'INSERT')
    );
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM log_audit_event(
      'role_removed',
      'user_roles',
      OLD.user_id,
      OLD.id,
      jsonb_build_object('role', OLD.role),
      NULL,
      jsonb_build_object('operation', 'DELETE')
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger function for profiles changes
CREATE OR REPLACE FUNCTION public.audit_profiles_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_changes JSONB := '{}'::jsonb;
  v_old_values JSONB := '{}'::jsonb;
  v_new_values JSONB := '{}'::jsonb;
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_audit_event(
      'user_created',
      'profiles',
      NEW.id,
      NEW.id,
      NULL,
      jsonb_build_object(
        'nome', NEW.nome,
        'email', NEW.email,
        'empresa_id', NEW.empresa_id,
        'ativo', NEW.ativo
      ),
      jsonb_build_object('operation', 'INSERT')
    );
  ELSIF TG_OP = 'UPDATE' THEN
    -- Track specific field changes
    IF OLD.empresa_id IS DISTINCT FROM NEW.empresa_id THEN
      v_old_values := v_old_values || jsonb_build_object('empresa_id', OLD.empresa_id);
      v_new_values := v_new_values || jsonb_build_object('empresa_id', NEW.empresa_id);
    END IF;
    
    IF OLD.ativo IS DISTINCT FROM NEW.ativo THEN
      v_old_values := v_old_values || jsonb_build_object('ativo', OLD.ativo);
      v_new_values := v_new_values || jsonb_build_object('ativo', NEW.ativo);
    END IF;
    
    IF OLD.nome IS DISTINCT FROM NEW.nome THEN
      v_old_values := v_old_values || jsonb_build_object('nome', OLD.nome);
      v_new_values := v_new_values || jsonb_build_object('nome', NEW.nome);
    END IF;
    
    -- Only log if there were actual changes to tracked fields
    IF v_old_values != '{}'::jsonb THEN
      PERFORM log_audit_event(
        'profile_updated',
        'profiles',
        NEW.id,
        NEW.id,
        v_old_values,
        v_new_values,
        jsonb_build_object('operation', 'UPDATE')
      );
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM log_audit_event(
      'user_deleted',
      'profiles',
      OLD.id,
      OLD.id,
      jsonb_build_object(
        'nome', OLD.nome,
        'email', OLD.email,
        'empresa_id', OLD.empresa_id,
        'ativo', OLD.ativo
      ),
      NULL,
      jsonb_build_object('operation', 'DELETE')
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers
CREATE TRIGGER trigger_audit_user_roles
  AFTER INSERT OR DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_user_roles_changes();

CREATE TRIGGER trigger_audit_profiles
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_profiles_changes();