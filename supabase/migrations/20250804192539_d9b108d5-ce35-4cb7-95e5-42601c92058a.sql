-- Create units table
CREATE TABLE public.units (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo TEXT,
  password TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  points INTEGER NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard', 'very_hard', 'legendary')),
  category TEXT NOT NULL DEFAULT 'geral',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create task_submissions table
CREATE TABLE public.task_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  proof TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create weekly_attendances table
CREATE TABLE public.weekly_attendances (
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
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create form_settings table
CREATE TABLE public.form_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_type TEXT NOT NULL UNIQUE,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  enabled_units TEXT[] DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unit_info table
CREATE TABLE public.unit_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE UNIQUE,
  counselors TEXT[] DEFAULT '{}',
  pathfinders TEXT[] DEFAULT '{}',
  unit_motto TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create news table
CREATE TABLE public.news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_type TEXT NOT NULL DEFAULT 'admin',
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create polls table
CREATE TABLE public.polls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  options JSONB NOT NULL DEFAULT '[]',
  allow_multiple_votes BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this appears to be a public leaderboard system)
CREATE POLICY "Allow public read access" ON public.units FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.task_submissions FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.weekly_attendances FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.form_settings FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.unit_info FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.news FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.polls FOR SELECT USING (true);

-- Allow insert/update/delete for all tables (since this appears to be a standalone app without user auth)
CREATE POLICY "Allow all operations" ON public.units FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.tasks FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.task_submissions FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.weekly_attendances FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.form_settings FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.unit_info FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.news FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.polls FOR ALL USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_units_updated_at
  BEFORE UPDATE ON public.units
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_form_settings_updated_at
  BEFORE UPDATE ON public.form_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_unit_info_updated_at
  BEFORE UPDATE ON public.unit_info
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_news_updated_at
  BEFORE UPDATE ON public.news
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_polls_updated_at
  BEFORE UPDATE ON public.polls
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();