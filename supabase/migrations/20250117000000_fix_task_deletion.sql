-- Fix task deletion to preserve completed task history
-- This migration allows tasks to be marked as 'removed' instead of deleted
-- when they have approved submissions, preserving unit history

-- Update tasks table status constraint to include 'removed'
ALTER TABLE public.tasks 
DROP CONSTRAINT IF EXISTS tasks_status_check;

ALTER TABLE public.tasks 
ADD CONSTRAINT tasks_status_check 
CHECK (status IN ('active', 'expired', 'removed'));

-- Add comment to document the new status
COMMENT ON COLUMN public.tasks.status IS 'Status da tarefa: active (ativa), expired (expirada), removed (removida pelo admin mas preservada no histórico)';

-- Create index for better performance when filtering removed tasks
CREATE INDEX IF NOT EXISTS idx_tasks_status_not_removed ON public.tasks(id) WHERE status != 'removed';

-- Update the existing view to handle removed tasks
DROP VIEW IF EXISTS public.tasks_with_availability;
CREATE OR REPLACE VIEW public.tasks_with_availability AS
SELECT 
  t.*,
  CASE 
    WHEN t.target_units IS NULL OR array_length(t.target_units, 1) IS NULL THEN 'all'
    ELSE 'targeted'
  END as task_type,
  COALESCE(array_length(t.target_units, 1), 0) as target_count,
  CASE 
    WHEN t.status = 'removed' THEN true
    ELSE false
  END as is_removed
FROM public.tasks t;

-- Grant permissions
GRANT SELECT ON public.tasks_with_availability TO anon, authenticated;
