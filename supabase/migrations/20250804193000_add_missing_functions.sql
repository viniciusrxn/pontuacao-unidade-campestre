-- Adicionar funções que faltam na migração mais recente

-- Função para atualizar senha da unidade
CREATE OR REPLACE FUNCTION public.update_unit_password(unit_id_param uuid, new_password_param text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE units 
  SET password = new_password_param
  WHERE id = unit_id_param;
  
  RETURN FOUND;
END;
$$;

-- Função para criar nova unidade
CREATE OR REPLACE FUNCTION public.create_new_unit(name_param text, password_param text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_unit_id uuid;
BEGIN
  INSERT INTO units (name, password, score)
  VALUES (name_param, password_param, 0)
  RETURNING id INTO new_unit_id;
  
  RETURN new_unit_id;
END;
$$;

-- Função para deletar unidade
CREATE OR REPLACE FUNCTION public.delete_unit(unit_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete all related data first (cascade delete should handle this)
  DELETE FROM task_submissions WHERE unit_id = unit_id_param;
  DELETE FROM weekly_attendances WHERE unit_id = unit_id_param;
  DELETE FROM unit_info WHERE unit_id = unit_id_param;
  
  -- Delete the unit
  DELETE FROM units WHERE id = unit_id_param;
  
  RETURN FOUND;
END;
$$;

-- Função para autenticar admin
CREATE OR REPLACE FUNCTION public.authenticate_admin(username_param text, password_param text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificação simples para admin padrão
  -- Em produção, use hash de senha adequado
  IF username_param = 'admin' AND password_param = 'SecureAdmin123!' THEN
    RETURN jsonb_build_object(
      'success', true,
      'admin_id', gen_random_uuid(),
      'username', 'admin'
    );
  ELSE
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Invalid credentials'
    );
  END IF;
END;
$$;

-- Função para autenticar unidade
CREATE OR REPLACE FUNCTION public.authenticate_unit(unit_name_param text, password_param text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  unit_record record;
BEGIN
  -- Get unit record
  SELECT * INTO unit_record FROM units WHERE name = unit_name_param AND password = password_param;
  
  IF unit_record IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Invalid credentials'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'unit_id', unit_record.id,
    'unit_name', unit_record.name,
    'unit_score', unit_record.score
  );
END;
$$;

-- Função para verificar se formulário está habilitado
CREATE OR REPLACE FUNCTION public.is_form_enabled_for_unit(form_name text, unit_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  form_settings record;
  unit_name_val text;
BEGIN
  -- Get form settings
  SELECT * INTO form_settings FROM form_settings WHERE form_type = form_name;
  
  -- If no settings found, assume enabled
  IF form_settings IS NULL THEN
    RETURN true;
  END IF;
  
  -- If not enabled globally, return false
  IF NOT form_settings.is_enabled THEN
    RETURN false;
  END IF;
  
  -- If no specific units configured, return true (enabled for all)
  IF form_settings.enabled_units IS NULL OR array_length(form_settings.enabled_units, 1) IS NULL THEN
    RETURN true;
  END IF;
  
  -- Get unit name
  SELECT name INTO unit_name_val FROM units WHERE id = unit_id;
  
  -- Check if unit is in enabled list
  RETURN unit_name_val = ANY(form_settings.enabled_units);
END;
$$;

-- Inserir dados iniciais se não existirem
INSERT INTO form_settings (form_type, is_enabled, enabled_units) 
VALUES ('weekly_attendance', true, '{}')
ON CONFLICT (form_type) DO NOTHING; 