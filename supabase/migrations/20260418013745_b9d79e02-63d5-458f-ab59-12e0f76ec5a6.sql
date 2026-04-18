CREATE OR REPLACE FUNCTION public.authenticate_admin(username_param text, password_param text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  cred_record record;
BEGIN
  SELECT * INTO cred_record FROM admin_credentials WHERE username = username_param;
  IF cred_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid credentials');
  END IF;
  IF cred_record.password_hash = crypt(password_param, cred_record.password_hash) THEN
    RETURN jsonb_build_object('success', true, 'admin_id', cred_record.id, 'username', cred_record.username);
  ELSE
    RETURN jsonb_build_object('success', false, 'message', 'Invalid credentials');
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.authenticate_unit(unit_name_param text, password_param text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  unit_record record;
BEGIN
  SELECT * INTO unit_record FROM units WHERE name = unit_name_param;
  IF unit_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid credentials');
  END IF;

  IF unit_record.password LIKE '$2a$%' OR unit_record.password LIKE '$2b$%' THEN
    IF unit_record.password = crypt(password_param, unit_record.password) THEN
      RETURN jsonb_build_object('success', true, 'unit_id', unit_record.id, 'unit_name', unit_record.name, 'unit_score', unit_record.score);
    END IF;
  ELSE
    IF unit_record.password = password_param THEN
      RETURN jsonb_build_object('success', true, 'unit_id', unit_record.id, 'unit_name', unit_record.name, 'unit_score', unit_record.score);
    END IF;
  END IF;

  RETURN jsonb_build_object('success', false, 'message', 'Invalid credentials');
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_new_unit(name_param text, password_param text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  new_unit_id uuid;
BEGIN
  INSERT INTO units (name, password, score)
  VALUES (name_param, crypt(password_param, gen_salt('bf')), 0)
  RETURNING id INTO new_unit_id;
  RETURN new_unit_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_unit_password(unit_id_param uuid, new_password_param text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
BEGIN
  UPDATE units SET password = crypt(new_password_param, gen_salt('bf')) WHERE id = unit_id_param;
  RETURN FOUND;
END;
$function$;

-- Re-set the admin password using the now-resolvable crypt function
UPDATE public.admin_credentials
SET password_hash = extensions.crypt('@AdminCampestre', extensions.gen_salt('bf')),
    updated_at = now()
WHERE username = 'admin';

INSERT INTO public.admin_credentials (username, password_hash)
SELECT 'admin', extensions.crypt('@AdminCampestre', extensions.gen_salt('bf'))
WHERE NOT EXISTS (SELECT 1 FROM public.admin_credentials WHERE username = 'admin');