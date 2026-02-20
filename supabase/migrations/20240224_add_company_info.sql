-- Ajout des colonnes pour l'entreprise actuelle
ALTER TABLE alumni 
ADD COLUMN IF NOT EXISTS current_company TEXT,
ADD COLUMN IF NOT EXISTS company_logo TEXT;
