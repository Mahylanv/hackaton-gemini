-- Assurer que linkedin_url est unique pour l'upsert
ALTER TABLE profiles 
ADD CONSTRAINT profiles_linkedin_url_key UNIQUE (linkedin_url);

-- Permettre à id d'avoir une valeur par défaut (UUID) si ce n'est pas le cas
-- Cela permet d'insérer des alumni qui n'ont pas encore de compte auth.users
ALTER TABLE profiles 
ALTER COLUMN id SET DEFAULT gen_random_uuid();
