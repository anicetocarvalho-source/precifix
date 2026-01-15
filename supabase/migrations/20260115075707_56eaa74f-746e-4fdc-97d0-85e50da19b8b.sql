-- Add is_favorite column to service_templates
ALTER TABLE public.service_templates 
ADD COLUMN is_favorite boolean NOT NULL DEFAULT false;