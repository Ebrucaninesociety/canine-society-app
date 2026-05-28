-- Private bucket for profile photos. Filenames live under <user_id>/<filename>.
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Authenticated users can upload only to a path prefixed with their own user id.
CREATE POLICY "users upload own photos" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Authenticated users can read any photo that belongs to a visible profile
-- (RLS on profiles already gates visibility — we just check the photo belongs
-- to a profile that exists for the caller).
CREATE POLICY "users read photos of visible profiles" ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'profile-photos'
  AND EXISTS (
    SELECT 1 FROM profiles p WHERE p.id::text = (storage.foldername(name))[1]
  )
);

-- Users can delete their own photos.
CREATE POLICY "users delete own photos" ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
