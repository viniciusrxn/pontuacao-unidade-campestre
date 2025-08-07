-- Add targeted tasks functionality
-- This migration adds support for tasks targeted to specific units

-- Add target_units column to tasks table
ALTER TABLE public.tasks 
ADD COLUMN target_units TEXT[] DEFAULT NULL;

-- Add comments for clarity
COMMENT ON COLUMN public.tasks.target_units IS 'Array of unit IDs that this task is targeted to. NULL means task is available to all units.';

-- Create index for better performance when filtering tasks by target units
CREATE INDEX idx_tasks_target_units ON public.tasks USING GIN(target_units);

-- Create a function to check if a task is available for a specific unit
CREATE OR REPLACE FUNCTION public.is_task_available_for_unit(task_target_units TEXT[], unit_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- If target_units is NULL or empty, task is available for all units
  IF task_target_units IS NULL OR array_length(task_target_units, 1) IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Check if unit_id is in the target_units array
  RETURN unit_id = ANY(task_target_units);
END;
$$;

-- Create a view for tasks with unit availability info
CREATE OR REPLACE VIEW public.tasks_with_availability AS
SELECT 
  t.*,
  CASE 
    WHEN t.target_units IS NULL OR array_length(t.target_units, 1) IS NULL THEN 'all'
    ELSE 'targeted'
  END as task_type,
  COALESCE(array_length(t.target_units, 1), 0) as target_count
FROM public.tasks t;

-- Grant necessary permissions
GRANT SELECT ON public.tasks_with_availability TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_task_available_for_unit(TEXT[], TEXT) TO anon, authenticated;
