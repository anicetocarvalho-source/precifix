-- Add branding fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS contact_phone text,
ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#2563eb',
ADD COLUMN IF NOT EXISTS logo_url text;

-- Create storage bucket for company logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for company logos bucket
CREATE POLICY "Users can view all logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'company-logos');

CREATE POLICY "Users can upload their own logo"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'company-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own logo"
ON storage.objects FOR UPDATE
USING (bucket_id = 'company-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own logo"
ON storage.objects FOR DELETE
USING (bucket_id = 'company-logos' AND auth.uid()::text = (storage.foldername(name))[1]);