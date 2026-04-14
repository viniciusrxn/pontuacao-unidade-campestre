-- =============================================
-- Fix missing columns, tables, and constraints
-- Applied to remote Supabase on 2026-04-14
-- =============================================

-- 1. Add target_units column to tasks table
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS target_units TEXT[] DEFAULT NULL;

-- 2. Fix tasks status constraint to include 'removed'
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_status_check CHECK (status IN ('active', 'expired', 'removed'));

-- 3. Add admin_feedback column to task_submissions
ALTER TABLE public.task_submissions ADD COLUMN IF NOT EXISTS admin_feedback TEXT;

-- 4. Add admin_feedback column to weekly_attendances
ALTER TABLE public.weekly_attendances ADD COLUMN IF NOT EXISTS admin_feedback TEXT;

-- 5. Create score_history table
CREATE TABLE IF NOT EXISTS public.score_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  change_amount INTEGER NOT NULL DEFAULT 0,
  reason TEXT NOT NULL DEFAULT '',
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.score_history ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "score_history_select" ON public.score_history;
  CREATE POLICY "score_history_select" ON public.score_history FOR SELECT USING (true);
  DROP POLICY IF EXISTS "score_history_insert" ON public.score_history;
  CREATE POLICY "score_history_insert" ON public.score_history FOR INSERT WITH CHECK (true);
  DROP POLICY IF EXISTS "score_history_update" ON public.score_history;
  CREATE POLICY "score_history_update" ON public.score_history FOR UPDATE USING (true) WITH CHECK (true);
  DROP POLICY IF EXISTS "score_history_delete" ON public.score_history;
  CREATE POLICY "score_history_delete" ON public.score_history FOR DELETE USING (true);
END $$;

-- 6. Create admin_credentials table
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.admin_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "admin_credentials_all" ON public.admin_credentials;
  CREATE POLICY "admin_credentials_all" ON public.admin_credentials FOR ALL USING (true);
END $$;

-- 7. Insert default admin with bcrypt hash
INSERT INTO public.admin_credentials (username, password_hash)
VALUES ('admin', crypt('SecureAdmin123!', gen_salt('bf')))
ON CONFLICT (username) DO NOTHING;

-- 8. authenticate_admin using bcrypt
CREATE OR REPLACE FUNCTION public.authenticate_admin(username_param text, password_param text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- 9. authenticate_unit supporting both plain text (legacy) and bcrypt
CREATE OR REPLACE FUNCTION public.authenticate_unit(unit_name_param text, password_param text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  unit_record record;
BEGIN
  SELECT * INTO unit_record FROM units WHERE name = unit_name_param;
  IF unit_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid credentials');
  END IF;

  -- Support both plain text passwords (legacy) and bcrypt hashes
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
$$;

-- 10. Other functions
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
  VALUES (name_param, crypt(password_param, gen_salt('bf')), 0)
  RETURNING id INTO new_unit_id;
  RETURN new_unit_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_unit_password(unit_id_param uuid, new_password_param text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE units SET password = crypt(new_password_param, gen_salt('bf')) WHERE id = unit_id_param;
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_unit(unit_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM task_submissions WHERE unit_id = unit_id_param;
  DELETE FROM weekly_attendances WHERE unit_id = unit_id_param;
  DELETE FROM unit_info WHERE unit_id = unit_id_param;
  DELETE FROM score_history WHERE unit_id = unit_id_param;
  DELETE FROM units WHERE id = unit_id_param;
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_form_enabled_for_unit(form_name text, unit_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  fs record;
BEGIN
  SELECT * INTO fs FROM form_settings WHERE form_type = form_name;
  IF fs IS NULL THEN RETURN true; END IF;
  IF NOT fs.is_enabled THEN RETURN false; END IF;
  IF fs.enabled_units IS NULL OR array_length(fs.enabled_units, 1) IS NULL THEN RETURN true; END IF;
  RETURN unit_id_param::text = ANY(fs.enabled_units);
END;
$$;

-- 11. Score history trigger
CREATE OR REPLACE FUNCTION public.record_score_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.score IS DISTINCT FROM NEW.score THEN
    INSERT INTO score_history (unit_id, score, change_amount, reason)
    VALUES (NEW.id, NEW.score, NEW.score - OLD.score, 'score_update');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS track_score_changes ON public.units;
CREATE TRIGGER track_score_changes
  AFTER UPDATE ON public.units
  FOR EACH ROW
  EXECUTE FUNCTION public.record_score_change();

-- 12. Index for target_units
CREATE INDEX IF NOT EXISTS idx_tasks_target_units ON public.tasks USING GIN(target_units);
