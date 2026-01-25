-- Add company address field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS company_address text;