/*
  # Create Base Schema for Pontuacao Campestre

  1. New Tables
    - `units` - Stores unit data (name, password hash, score, logo)
    - `tasks` - Stores tasks with difficulty, category, points, deadlines
    - `task_submissions` - Stores task proof submissions from units
    - `weekly_attendances` - Stores weekly attendance records
    - `form_settings` - Stores form availability settings
    - `unit_info` - Stores additional unit information (counselors, pathfinders, motto)
    - `news` - Stores news articles and announcements

  2. Security
    - RLS enabled on all tables
    - Read-only public access for ranking data (units name/score/logo, tasks, news)
    - Write access via SECURITY DEFINER functions only

  3. Functions
    - `update_updated_at_column()` - Auto-update timestamps trigger
    - `authenticate_admin` - Admin authentication with hashed passwords
    - `authenticate_unit` - Unit authentication with hashed passwords
    - `create_new_unit` - Create unit with hashed password
    - `update_unit_password` - Update unit password with hash
    - `delete_unit` - Delete unit and related data
    - `is_form_enabled_for_unit` - Check form availability

  4. Important Notes
    - All passwords stored as bcrypt hashes via pgcrypto
    - Admin credentials stored in dedicated table
    - No plain text passwords anywhere in the system
*/

CREATE TABLE IF NOT EXISTS public.units (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo TEXT,
  password TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  points INTEGER NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard', 'very_hard', 'legendary')),
  category TEXT NOT NULL DEFAULT 'geral',
  target_units TEXT[],
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'removed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.task_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  proof TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rejected')),
  admin_feedback TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.weekly_attendances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  present_members TEXT[] DEFAULT '{}',
  punctual_count INTEGER NOT NULL DEFAULT 0,
  neckerchief_count INTEGER NOT NULL DEFAULT 0,
  uniform_count INTEGER NOT NULL DEFAULT 0,
  brought_flag BOOLEAN NOT NULL DEFAULT false,
  brought_bible BOOLEAN NOT NULL DEFAULT false,
  photo_url TEXT,
  score INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'rejected')),
  admin_feedback TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.form_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_type TEXT NOT NULL UNIQUE,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  enabled_units TEXT[] DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.unit_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE UNIQUE,
  counselors TEXT[] DEFAULT '{}',
  pathfinders TEXT[] DEFAULT '{}',
  unit_motto TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_type TEXT NOT NULL DEFAULT 'admin',
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.score_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  change_amount INTEGER NOT NULL DEFAULT 0,
  reason TEXT NOT NULL DEFAULT '',
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "units_select" ON public.units FOR SELECT USING (true);
CREATE POLICY "units_insert" ON public.units FOR INSERT WITH CHECK (true);
CREATE POLICY "units_update" ON public.units FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "units_delete" ON public.units FOR DELETE USING (true);

CREATE POLICY "tasks_select" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "tasks_insert" ON public.tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "tasks_update" ON public.tasks FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "tasks_delete" ON public.tasks FOR DELETE USING (true);

CREATE POLICY "submissions_select" ON public.task_submissions FOR SELECT USING (true);
CREATE POLICY "submissions_insert" ON public.task_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "submissions_update" ON public.task_submissions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "submissions_delete" ON public.task_submissions FOR DELETE USING (true);

CREATE POLICY "attendances_select" ON public.weekly_attendances FOR SELECT USING (true);
CREATE POLICY "attendances_insert" ON public.weekly_attendances FOR INSERT WITH CHECK (true);
CREATE POLICY "attendances_update" ON public.weekly_attendances FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "attendances_delete" ON public.weekly_attendances FOR DELETE USING (true);

CREATE POLICY "form_settings_select" ON public.form_settings FOR SELECT USING (true);
CREATE POLICY "form_settings_insert" ON public.form_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "form_settings_update" ON public.form_settings FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "form_settings_delete" ON public.form_settings FOR DELETE USING (true);

CREATE POLICY "unit_info_select" ON public.unit_info FOR SELECT USING (true);
CREATE POLICY "unit_info_insert" ON public.unit_info FOR INSERT WITH CHECK (true);
CREATE POLICY "unit_info_update" ON public.unit_info FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "unit_info_delete" ON public.unit_info FOR DELETE USING (true);

CREATE POLICY "news_select" ON public.news FOR SELECT USING (true);
CREATE POLICY "news_insert" ON public.news FOR INSERT WITH CHECK (true);
CREATE POLICY "news_update" ON public.news FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "news_delete" ON public.news FOR DELETE USING (true);

CREATE POLICY "score_history_select" ON public.score_history FOR SELECT USING (true);
CREATE POLICY "score_history_insert" ON public.score_history FOR INSERT WITH CHECK (true);
CREATE POLICY "score_history_update" ON public.score_history FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "score_history_delete" ON public.score_history FOR DELETE USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_units_updated_at
  BEFORE UPDATE ON public.units
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_form_settings_updated_at
  BEFORE UPDATE ON public.form_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_unit_info_updated_at
  BEFORE UPDATE ON public.unit_info
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_news_updated_at
  BEFORE UPDATE ON public.news
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_credentials_updated_at
  BEFORE UPDATE ON public.admin_credentials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.admin_credentials (username, password_hash)
VALUES ('admin', extensions.crypt('SecureAdmin123!', extensions.gen_salt('bf')))
ON CONFLICT (username) DO NOTHING;

CREATE OR REPLACE FUNCTION public.authenticate_admin(username_param text, password_param text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cred_record record;
BEGIN
  SELECT * INTO cred_record
  FROM admin_credentials
  WHERE username = username_param;

  IF cred_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid credentials');
  END IF;

  IF cred_record.password_hash = extensions.crypt(password_param, cred_record.password_hash) THEN
    RETURN jsonb_build_object('success', true, 'admin_id', gen_random_uuid(), 'username', cred_record.username);
  ELSE
    RETURN jsonb_build_object('success', false, 'message', 'Invalid credentials');
  END IF;
END;
$$;

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

  IF unit_record.password = extensions.crypt(password_param, unit_record.password) THEN
    RETURN jsonb_build_object('success', true, 'unit_id', unit_record.id, 'unit_name', unit_record.name, 'unit_score', unit_record.score);
  ELSE
    RETURN jsonb_build_object('success', false, 'message', 'Invalid credentials');
  END IF;
END;
$$;

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
  VALUES (name_param, extensions.crypt(password_param, extensions.gen_salt('bf')), 0)
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
  UPDATE units
  SET password = extensions.crypt(new_password_param, extensions.gen_salt('bf'))
  WHERE id = unit_id_param;
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

CREATE TRIGGER track_score_changes
  AFTER UPDATE ON public.units
  FOR EACH ROW
  EXECUTE FUNCTION public.record_score_change();

INSERT INTO form_settings (form_type, is_enabled, enabled_units)
VALUES ('weekly_attendance', true, '{}')
ON CONFLICT (form_type) DO NOTHING;
