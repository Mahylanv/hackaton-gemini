-- Création de la table dédiée pour les données scrappées/importées
CREATE TABLE IF NOT EXISTS alumni (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  linkedin_url TEXT UNIQUE NOT NULL,
  grad_year INTEGER,
  entry_year INTEGER,
  degree TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Activation de la RLS
ALTER TABLE alumni ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs connectés peuvent voir les alumni
CREATE POLICY "Alumni are viewable by authenticated users" ON alumni
  FOR SELECT TO authenticated USING (true);

-- Politique : Le service_role peut tout faire (pour l'import)
CREATE POLICY "Service role can manage alumni" ON alumni
  USING (true)
  WITH CHECK (true);
