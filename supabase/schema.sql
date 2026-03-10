-- ==========================================
-- SCHEMA COMPLET ALUMNI MYDIGITALSCHOOL (VERSION IDEMPOTENTE)
-- ==========================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES DE BASE
-- Table Profiles (liée à auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE NOT NULL,
  linkedin_url TEXT UNIQUE,
  grad_year INTEGER,
  entry_year INTEGER,
  degree TEXT,
  role TEXT DEFAULT 'USER',
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT profiles_role_check CHECK (role IN ('USER', 'ADMIN', 'ALUMNI', 'SUPER_ADMIN'))
);

-- Table Alumni (données scrappées/importées)
CREATE TABLE IF NOT EXISTS public.alumni (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  linkedin_url TEXT UNIQUE NOT NULL,
  grad_year INTEGER,
  entry_year INTEGER,
  degree TEXT,
  avatar_url TEXT,
  current_company TEXT,
  company_logo TEXT,
  current_job_title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table Jobs
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('CDI', 'CDD', 'FREELANCE', 'INTERNSHIP', 'Alternance', 'Stage')),
  location TEXT,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  author_id UUID REFERENCES auth.users(id)
);

-- Table Events
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  type TEXT,
  location TEXT NOT NULL,
  interested_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  author_id UUID REFERENCES auth.users(id)
);

-- Table Intérêts Événements
CREATE TABLE IF NOT EXISTS public.event_interests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(event_id, user_id)
);

-- 3. SECURITÉ (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_interests ENABLE ROW LEVEL SECURITY;

-- Nettoyage des anciennes politiques pour éviter les erreurs "already exists"
DO $$ 
BEGIN
    -- Politiques Profiles
    DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
    DROP POLICY IF EXISTS "Only Super Admin can update roles" ON public.profiles;

    -- Politiques Alumni
    DROP POLICY IF EXISTS "Alumni are viewable by authenticated users" ON public.alumni;
    DROP POLICY IF EXISTS "Service role can manage alumni" ON public.alumni;

    -- Politiques Jobs
    DROP POLICY IF EXISTS "Jobs are viewable by everyone" ON public.jobs;
    DROP POLICY IF EXISTS "Admins can manage jobs" ON public.jobs;

    -- Politiques Events
    DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;
    DROP POLICY IF EXISTS "Admins can manage events" ON public.events;

    -- Politiques Interests
    DROP POLICY IF EXISTS "Interests are viewable by everyone" ON public.event_interests;
    DROP POLICY IF EXISTS "Users can manage own interests" ON public.event_interests;
    DROP POLICY IF EXISTS "Les intérêts sont visibles par tous" ON public.event_interests;
    DROP POLICY IF EXISTS "Les utilisateurs peuvent gérer leur propre intérêt" ON public.event_interests;
END $$;

-- Création des Politiques
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Alumni are viewable by authenticated users" ON public.alumni FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service role can manage alumni" ON public.alumni USING (true) WITH CHECK (true);

CREATE POLICY "Jobs are viewable by everyone" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Admins can manage jobs" ON public.jobs FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')));

CREATE POLICY "Events are viewable by everyone" ON public.events FOR SELECT USING (true);
CREATE POLICY "Admins can manage events" ON public.events FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')));

CREATE POLICY "Interests are viewable by everyone" ON public.event_interests FOR SELECT USING (true);
CREATE POLICY "Users can manage own interests" ON public.event_interests FOR ALL TO authenticated 
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. FONCTIONS & TRIGGERS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name', 'USER');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
