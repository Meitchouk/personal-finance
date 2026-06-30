-- Run this in Supabase SQL Editor to add Google Sheets integration
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS google_sheet_id text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS google_sheet_name text;

-- Allow users to update their profile (the trigger creates it; we just need insert for upsert)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile" ON public.profiles
      FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END$$;
