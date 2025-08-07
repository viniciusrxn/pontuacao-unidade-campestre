-- Remove polls system completely
-- This migration removes all tables, functions and policies related to the polls system

-- Drop policies first
DROP POLICY IF EXISTS "Allow public read access" ON public.polls;
DROP POLICY IF EXISTS "Allow all operations" ON public.polls;
DROP POLICY IF EXISTS "Allow public read access" ON public.poll_votes;
DROP POLICY IF EXISTS "Allow all operations" ON public.poll_votes;

-- Drop triggers
DROP TRIGGER IF EXISTS update_polls_updated_at ON public.polls;

-- Drop tables (this will cascade and remove related data)
DROP TABLE IF EXISTS public.poll_votes;
DROP TABLE IF EXISTS public.polls;

-- Remove references to poll_votes from delete_unit function if it exists
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
