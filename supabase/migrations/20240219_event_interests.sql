-- Table pour suivre quel utilisateur s'intéresse à quel événement
CREATE TABLE IF NOT EXISTS event_interests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(event_id, user_id)
);

-- Index pour accélérer les recherches par événement
CREATE INDEX IF NOT EXISTS idx_event_interests_event_id ON event_interests(event_id);

-- Activer RLS
ALTER TABLE event_interests ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Les intérêts sont visibles par tous" ON event_interests
  FOR SELECT USING (true);

CREATE POLICY "Les utilisateurs peuvent gérer leur propre intérêt" ON event_interests
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
