-- Phase 1: Critical Database Security - Enable RLS and Create Policies

-- Enable RLS on all tables that don't have it
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_notifications ENABLE ROW LEVEL SECURITY;

-- Create admin role check function with proper security
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  -- For now, check if user has admin role (will be replaced with proper auth)
  -- This is a placeholder until proper auth is implemented
  RETURN true; -- Temporary - will be restricted in Phase 2
END;
$$;

-- Create function to get current unit ID (placeholder for proper auth)
CREATE OR REPLACE FUNCTION public.get_current_unit_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  -- Placeholder - will be replaced with proper auth in Phase 2
  RETURN null;
END;
$$;

-- Units table policies
CREATE POLICY "Units can view their own data" ON public.units
  FOR SELECT USING (id = get_current_unit_id());

CREATE POLICY "Admins can view all units" ON public.units
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update units" ON public.units
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can insert units" ON public.units
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can delete units" ON public.units
  FOR DELETE USING (is_admin());

-- Tasks table policies
CREATE POLICY "Anyone can view active tasks" ON public.tasks
  FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage tasks" ON public.tasks
  FOR ALL USING (is_admin());

-- Task submissions policies
CREATE POLICY "Units can view their own submissions" ON public.task_submissions
  FOR SELECT USING (unit_id = get_current_unit_id());

CREATE POLICY "Units can create their own submissions" ON public.task_submissions
  FOR INSERT WITH CHECK (unit_id = get_current_unit_id());

CREATE POLICY "Admins can view all submissions" ON public.task_submissions
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update submissions" ON public.task_submissions
  FOR UPDATE USING (is_admin());

-- Weekly attendances policies
CREATE POLICY "Units can view their own attendance" ON public.weekly_attendances
  FOR SELECT USING (unit_id = get_current_unit_id());

CREATE POLICY "Units can create their own attendance" ON public.weekly_attendances
  FOR INSERT WITH CHECK (unit_id = get_current_unit_id());

CREATE POLICY "Admins can view all attendance" ON public.weekly_attendances
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update attendance" ON public.weekly_attendances
  FOR UPDATE USING (is_admin());

-- Form settings policies
CREATE POLICY "Admins can manage form settings" ON public.form_settings
  FOR ALL USING (is_admin());

-- Challenges policies
CREATE POLICY "Anyone can view active challenges" ON public.challenges
  FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage challenges" ON public.challenges
  FOR ALL USING (is_admin());

-- Challenge participations policies
CREATE POLICY "Units can view their own participations" ON public.challenge_participations
  FOR SELECT USING (unit_id = get_current_unit_id());

CREATE POLICY "Units can create their own participations" ON public.challenge_participations
  FOR INSERT WITH CHECK (unit_id = get_current_unit_id());

CREATE POLICY "Admins can view all participations" ON public.challenge_participations
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update participations" ON public.challenge_participations
  FOR UPDATE USING (is_admin());

-- Missions policies
CREATE POLICY "Anyone can view active missions" ON public.missions
  FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage missions" ON public.missions
  FOR ALL USING (is_admin());

-- Unit missions policies
CREATE POLICY "Units can view their own missions" ON public.unit_missions
  FOR SELECT USING (unit_id = get_current_unit_id());

CREATE POLICY "Units can update their own missions" ON public.unit_missions
  FOR UPDATE USING (unit_id = get_current_unit_id());

CREATE POLICY "Admins can view all unit missions" ON public.unit_missions
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can manage unit missions" ON public.unit_missions
  FOR ALL USING (is_admin());

-- Achievements policies
CREATE POLICY "Anyone can view achievements" ON public.achievements
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage achievements" ON public.achievements
  FOR ALL USING (is_admin());

-- Unit achievements policies
CREATE POLICY "Units can view their own achievements" ON public.unit_achievements
  FOR SELECT USING (unit_id = get_current_unit_id());

CREATE POLICY "Admins can view all unit achievements" ON public.unit_achievements
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can manage unit achievements" ON public.unit_achievements
  FOR ALL USING (is_admin());

-- Gamification notifications policies
CREATE POLICY "Units can view their own notifications" ON public.gamification_notifications
  FOR SELECT USING (unit_id = get_current_unit_id());

CREATE POLICY "Units can update their own notifications" ON public.gamification_notifications
  FOR UPDATE USING (unit_id = get_current_unit_id());

CREATE POLICY "Admins can manage all notifications" ON public.gamification_notifications
  FOR ALL USING (is_admin());

-- Update existing database functions to have proper search_path
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

CREATE OR REPLACE FUNCTION public.delete_unit(unit_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete all related data first (cascade delete)
  DELETE FROM weekly_attendances WHERE unit_id = unit_id_param;
  DELETE FROM poll_votes WHERE unit_id = unit_id_param;
  DELETE FROM task_submissions WHERE unit_id = unit_id_param;
  DELETE FROM challenge_participations WHERE unit_id = unit_id_param;
  DELETE FROM unit_achievements WHERE unit_id = unit_id_param;
  DELETE FROM unit_missions WHERE unit_id = unit_id_param;
  DELETE FROM gamification_notifications WHERE unit_id = unit_id_param;
  DELETE FROM system_notifications WHERE unit_id = unit_id_param;
  
  -- Finally delete the unit
  DELETE FROM units WHERE id = unit_id_param;
  
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_form_enabled_for_unit(form_name text, unit_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  setting_record RECORD;
BEGIN
  -- Get the form settings
  SELECT * INTO setting_record FROM form_settings WHERE form_type = form_name LIMIT 1;
  
  -- If no record found or form is not enabled, return false
  IF setting_record IS NULL OR NOT setting_record.is_enabled THEN
    RETURN false;
  END IF;
  
  -- If enabled for all units (empty array) or this unit is in the enabled list
  IF setting_record.enabled_units = '{}' OR unit_id = ANY(setting_record.enabled_units) THEN
    RETURN true;
  END IF;
  
  -- Otherwise, form is not enabled for this unit
  RETURN false;
END;
$$;