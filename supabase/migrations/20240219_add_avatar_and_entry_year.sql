ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS entry_year INTEGER;

-- Commentaire pour la documentation
COMMENT ON COLUMN profiles.avatar_url IS 'URL de la photo de profil LinkedIn';
COMMENT ON COLUMN profiles.entry_year IS 'Année d''entrée à MyDigitalSchool';
