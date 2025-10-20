-- Migration: Add ranking visibility setting
-- Created: 2025-01-20
-- Description: Adds system setting to control ranking visibility

-- Insert ranking visibility configuration
INSERT INTO public.form_settings (form_type, is_enabled, enabled_units, updated_at)
VALUES ('ranking_visibility', true, '{}', now())
ON CONFLICT (form_type) DO UPDATE
SET is_enabled = EXCLUDED.is_enabled,
    updated_at = now();

-- Add comment for documentation
COMMENT ON TABLE public.form_settings IS 'Stores form and system settings including ranking visibility';

