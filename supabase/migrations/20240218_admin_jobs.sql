-- Create jobs table
CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('CDI', 'CDD', 'FREELANCE', 'INTERNSHIP')),
  location TEXT,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  author_id UUID REFERENCES auth.users(id)
);

-- Enable RLS on jobs
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Job Policies
CREATE POLICY "Jobs are viewable by everyone" ON jobs
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage jobs" ON jobs
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Update Profile Role Policy
CREATE POLICY "Only Super Admin can update roles" ON profiles
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'SUPER_ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'SUPER_ADMIN'
    )
  );
