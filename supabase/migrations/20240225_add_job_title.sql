-- Ajout de la colonne pour le titre du poste actuel
ALTER TABLE alumni 
ADD COLUMN IF NOT EXISTS current_job_title TEXT;
