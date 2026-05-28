-- =============================================================
-- Canine Society — Slice 1 schema RESET
-- Drops every object created by _bundle.sql so it can be re-run
-- from a clean state. Destructive: it deletes all data.
-- =============================================================

-- Tables (CASCADE drops triggers, indexes, RLS policies on them)
DROP TABLE IF EXISTS blocks CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS swipes CASCADE;
DROP TABLE IF EXISTS photos CASCADE;
DROP TABLE IF EXISTS dogs CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS moderators CASCADE;

-- Functions
DROP FUNCTION IF EXISTS next_deck(int) CASCADE;
DROP FUNCTION IF EXISTS on_swipe_create_match() CASCADE;
DROP FUNCTION IF EXISTS set_updated_at() CASCADE;

-- Enums
DROP TYPE IF EXISTS gender_t CASCADE;
DROP TYPE IF EXISTS looking_for_t CASCADE;
DROP TYPE IF EXISTS intent_t CASCADE;
DROP TYPE IF EXISTS verification_t CASCADE;
DROP TYPE IF EXISTS swipe_dir_t CASCADE;
DROP TYPE IF EXISTS dog_size_t CASCADE;
DROP TYPE IF EXISTS report_reason_t CASCADE;
DROP TYPE IF EXISTS report_status_t CASCADE;
DROP TYPE IF EXISTS photo_verif_t CASCADE;
DROP TYPE IF EXISTS lang_t CASCADE;

-- Storage policies on objects (drop if exist; do NOT drop the table)
DROP POLICY IF EXISTS "users upload own photos" ON storage.objects;
DROP POLICY IF EXISTS "users read photos of visible profiles" ON storage.objects;
DROP POLICY IF EXISTS "users delete own photos" ON storage.objects;

-- Bucket (and its objects via cascade)
DELETE FROM storage.buckets WHERE id = 'profile-photos';
