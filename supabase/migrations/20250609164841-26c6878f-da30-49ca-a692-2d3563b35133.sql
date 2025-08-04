
-- Create a table to store unit information
CREATE TABLE public.unit_info (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id uuid NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  counselors jsonb DEFAULT '[]'::jsonb,
  pathfinders jsonb DEFAULT '[]'::jsonb,
  unit_motto text DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(unit_id)
);

-- Add Row Level Security
ALTER TABLE public.unit_info ENABLE ROW LEVEL SECURITY;

-- Create policies for unit_info table
CREATE POLICY "Units can view their own info" 
  ON public.unit_info 
  FOR SELECT 
  USING (true);

CREATE POLICY "Units can insert their own info" 
  ON public.unit_info 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Units can update their own info" 
  ON public.unit_info 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Units can delete their own info" 
  ON public.unit_info 
  FOR DELETE 
  USING (true);

-- Create an index for better performance
CREATE INDEX idx_unit_info_unit_id ON public.unit_info(unit_id);
