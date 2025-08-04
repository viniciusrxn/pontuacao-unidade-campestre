-- Phase 2: Authentication & Authorization Security (Fixed)

-- First enable the pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create admin credentials table with proper security
CREATE TABLE public.admin_credentials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_login timestamp with time zone
);

-- Enable RLS on admin credentials
ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;

-- Only allow authenticated admins to access admin credentials
CREATE POLICY "Only admins can access admin credentials" ON public.admin_credentials
  FOR ALL USING (is_admin());

-- Function to hash passwords securely using bcrypt
CREATE OR REPLACE FUNCTION public.hash_password(password text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Use bcrypt to hash the password with automatically generated salt
  RETURN crypt(password, gen_salt('bf', 12));
END;
$$;

-- Function to verify passwords
CREATE OR REPLACE FUNCTION public.verify_password(password text, stored_hash text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN stored_hash = crypt(password, stored_hash);
END;
$$;

-- Create function to authenticate admin
CREATE OR REPLACE FUNCTION public.authenticate_admin(username_param text, password_param text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_record record;
  is_valid boolean;
BEGIN
  -- Get admin record
  SELECT * INTO admin_record FROM admin_credentials WHERE username = username_param;
  
  -- Check if admin exists
  IF admin_record IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Invalid credentials'
    );
  END IF;
  
  -- Verify password
  is_valid := verify_password(password_param, admin_record.password_hash);
  
  IF is_valid THEN
    -- Update last login
    UPDATE admin_credentials 
    SET last_login = now() 
    WHERE id = admin_record.id;
    
    RETURN jsonb_build_object(
      'success', true,
      'admin_id', admin_record.id,
      'username', admin_record.username
    );
  ELSE
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Invalid credentials'
    );
  END IF;
END;
$$;

-- Create default admin account (password: SecureAdmin123!)
-- This should be changed immediately after deployment
INSERT INTO admin_credentials (username, password_hash)
VALUES ('admin', hash_password('SecureAdmin123!'))
ON CONFLICT (username) DO NOTHING;

-- Create function for secure unit authentication
CREATE OR REPLACE FUNCTION public.authenticate_unit(unit_name_param text, password_param text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  unit_record record;
BEGIN
  -- Get unit record (note: passwords are still stored in plaintext for now)
  -- This will be updated in a future migration to use hashed passwords
  SELECT * INTO unit_record FROM units WHERE name = unit_name_param AND password = password_param;
  
  IF unit_record IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Invalid credentials'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'unit_id', unit_record.id,
    'unit_name', unit_record.name,
    'unit_score', unit_record.score
  );
END;
$$;