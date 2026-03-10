-- Créer le bucket 'events' s'il n'existe pas
INSERT INTO storage.buckets (id, name, public)
VALUES ('events', 'events', true)
ON CONFLICT (id) DO NOTHING;

-- Autoriser l'accès public aux fichiers du bucket 'events'
CREATE POLICY "Accès public aux images d'événements"
ON storage.objects FOR SELECT
USING ( bucket_id = 'events' );

-- Autoriser les admins à uploader des fichiers dans le bucket 'events'
CREATE POLICY "Admins peuvent uploader des images d'événements"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'events' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
  )
);
