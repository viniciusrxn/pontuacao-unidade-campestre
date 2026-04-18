CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

UPDATE public.admin_credentials
SET password_hash = crypt('@AdminCampestre', gen_salt('bf')),
    updated_at = now()
WHERE username = 'admin';

INSERT INTO public.admin_credentials (username, password_hash)
SELECT 'admin', crypt('@AdminCampestre', gen_salt('bf'))
WHERE NOT EXISTS (SELECT 1 FROM public.admin_credentials WHERE username = 'admin');