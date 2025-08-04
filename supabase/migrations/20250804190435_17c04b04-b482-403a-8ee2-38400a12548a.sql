-- Fix RLS policies for public access to units data

-- Update the units table policy to allow public viewing of basic unit data
DROP POLICY IF EXISTS "Anyone can view units" ON public.units;
CREATE POLICY "Anyone can view units" 
ON public.units 
FOR SELECT 
USING (true);

-- Ensure tasks can be viewed publicly when active
DROP POLICY IF EXISTS "Anyone can view active tasks" ON public.tasks;
CREATE POLICY "Anyone can view active tasks" 
ON public.tasks 
FOR SELECT 
USING (status = 'active');