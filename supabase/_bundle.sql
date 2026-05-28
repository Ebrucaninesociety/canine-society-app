-- =============================================================
-- Canine Society — Slice 1 Database Bundle
-- Paste this entire file into Supabase Dashboard -> SQL Editor
-- (Project: qwklnxkflmsmgyohihrg, Frankfurt) and Run.
-- Safe to re-run on a fresh DB. If you've already applied parts,
-- drop the project DB tables first or use the individual files.
-- =============================================================

-- ----- 0001_init.sql -----
CREATE TYPE gender_t AS ENUM ('woman','man','non_binary','prefer_not_to_say');
CREATE TYPE looking_for_t AS ENUM ('women','men','everyone');
CREATE TYPE intent_t AS ENUM ('date','walk');
CREATE TYPE verification_t AS ENUM ('pending','approved','rejected','banned');
CREATE TYPE swipe_dir_t AS ENUM ('like','pass','superlike');
CREATE TYPE dog_size_t AS ENUM ('small','medium','large');
CREATE TYPE report_reason_t AS ENUM ('fake_profile','no_dog','inappropriate_photo','harassment','underage','spam','other');
CREATE TYPE report_status_t AS ENUM ('open','resolved','dismissed');
CREATE TYPE photo_verif_t AS ENUM ('pending','approved','rejected');
CREATE TYPE lang_t AS ENUM ('en','de');

CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL CHECK (char_length(display_name) BETWEEN 2 AND 40),
  birthdate date NOT NULL,
  gender gender_t NOT NULL,
  looking_for looking_for_t[] NOT NULL,
  intent intent_t[] NOT NULL DEFAULT ARRAY['date']::intent_t[],
  city text NOT NULL,
  country char(2) NOT NULL,
  bio text CHECK (bio IS NULL OR char_length(bio) <= 500),
  verification_status verification_t NOT NULL DEFAULT 'pending',
  verification_reviewed_at timestamptz,
  verification_reviewed_by uuid,
  verification_notes text,
  language_pref lang_t NOT NULL DEFAULT 'en',
  push_token_ios text,
  push_token_android text,
  last_active_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT age_18 CHECK (birthdate <= current_date - interval '18 years')
);
CREATE INDEX idx_profiles_status_created ON profiles (verification_status, created_at);
CREATE INDEX idx_profiles_country ON profiles (country);

CREATE TABLE dogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 30),
  breed text,
  birthdate_approx date,
  size dog_size_t NOT NULL,
  bio text CHECK (bio IS NULL OR char_length(bio) <= 300),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_dogs_owner ON dogs (owner_id);

CREATE TABLE photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  is_dog_photo boolean NOT NULL DEFAULT false,
  position int NOT NULL CHECK (position BETWEEN 0 AND 5),
  verification_status photo_verif_t NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, position)
);
CREATE INDEX idx_photos_profile ON photos (profile_id);

CREATE TABLE swipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  swipee_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  direction swipe_dir_t NOT NULL,
  intent intent_t NOT NULL DEFAULT 'date',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (swiper_id, swipee_id, intent),
  CHECK (swiper_id <> swipee_id)
);
CREATE INDEX idx_swipes_swiper_created ON swipes (swiper_id, created_at DESC);
CREATE INDEX idx_swipes_swipee_like ON swipes (swipee_id) WHERE direction IN ('like','superlike');

CREATE TABLE matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_a_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  profile_b_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  intent intent_t NOT NULL,
  unmatched_at timestamptz,
  unmatched_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (profile_a_id < profile_b_id),
  UNIQUE (profile_a_id, profile_b_id, intent)
);
CREATE INDEX idx_matches_a ON matches (profile_a_id);
CREATE INDEX idx_matches_b ON matches (profile_b_id);

CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_messages_match_created ON messages (match_id, created_at DESC);

CREATE TABLE reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reported_profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason report_reason_t NOT NULL,
  details text CHECK (details IS NULL OR char_length(details) <= 500),
  status report_status_t NOT NULL DEFAULT 'open',
  resolved_by uuid,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_reports_status ON reports (status, created_at);

CREATE TABLE blocks (
  blocker_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);
CREATE INDEX idx_blocks_blocked ON blocks (blocked_id);

CREATE TABLE moderators (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----- 0002_rls.sql -----
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderators ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_read ON profiles FOR SELECT USING (
  id = auth.uid()
  OR (
    verification_status = 'approved' AND deleted_at IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM blocks
      WHERE (blocker_id = auth.uid() AND blocked_id = profiles.id)
         OR (blocker_id = profiles.id AND blocked_id = auth.uid())
    )
  )
);
CREATE POLICY profiles_insert_self ON profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY profiles_update_self ON profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY dogs_read ON dogs FOR SELECT USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = dogs.owner_id));
CREATE POLICY dogs_write_own ON dogs FOR ALL USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY photos_read ON photos FOR SELECT USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = photos.profile_id));
CREATE POLICY photos_write_own ON photos FOR ALL USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());

CREATE POLICY swipes_read_own ON swipes FOR SELECT USING (swiper_id = auth.uid());
CREATE POLICY swipes_insert_self ON swipes FOR INSERT WITH CHECK (swiper_id = auth.uid());

CREATE POLICY matches_read_own ON matches FOR SELECT USING (profile_a_id = auth.uid() OR profile_b_id = auth.uid());
CREATE POLICY matches_update_own ON matches FOR UPDATE USING (profile_a_id = auth.uid() OR profile_b_id = auth.uid());

CREATE POLICY messages_read ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM matches m WHERE m.id = messages.match_id
    AND (m.profile_a_id = auth.uid() OR m.profile_b_id = auth.uid())
    AND m.unmatched_at IS NULL)
);
CREATE POLICY messages_insert ON messages FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (SELECT 1 FROM matches m WHERE m.id = messages.match_id
    AND (m.profile_a_id = auth.uid() OR m.profile_b_id = auth.uid())
    AND m.unmatched_at IS NULL)
);
CREATE POLICY messages_update_read ON messages FOR UPDATE USING (
  EXISTS (SELECT 1 FROM matches m WHERE m.id = messages.match_id
    AND (m.profile_a_id = auth.uid() OR m.profile_b_id = auth.uid()))
);

CREATE POLICY reports_read_own ON reports FOR SELECT USING (reporter_id = auth.uid());
CREATE POLICY reports_insert_self ON reports FOR INSERT WITH CHECK (reporter_id = auth.uid());

CREATE POLICY blocks_read_own ON blocks FOR SELECT USING (blocker_id = auth.uid());
CREATE POLICY blocks_write_own ON blocks FOR ALL USING (blocker_id = auth.uid()) WITH CHECK (blocker_id = auth.uid());

CREATE POLICY moderators_read_self ON moderators FOR SELECT USING (user_id = auth.uid());

-- ----- 0003_functions.sql -----
CREATE OR REPLACE FUNCTION next_deck(limit_count int DEFAULT 20)
RETURNS SETOF profiles
LANGUAGE sql STABLE SECURITY INVOKER
AS $$
  WITH me AS (
    SELECT id, country, gender, looking_for FROM profiles WHERE id = auth.uid()
  )
  SELECT p.*
  FROM profiles p, me
  WHERE p.id <> me.id
    AND p.verification_status = 'approved'
    AND p.deleted_at IS NULL
    AND p.country = me.country
    AND (
      'everyone' = ANY (SELECT unnest(me.looking_for)::text)
      OR p.gender::text = ANY (
        SELECT CASE WHEN lf = 'women' THEN 'woman' WHEN lf = 'men' THEN 'man' ELSE NULL END
        FROM unnest(me.looking_for) lf
      )
    )
    AND (
      'everyone' = ANY (SELECT unnest(p.looking_for)::text)
      OR me.gender::text = ANY (
        SELECT CASE WHEN lf = 'women' THEN 'woman' WHEN lf = 'men' THEN 'man' ELSE NULL END
        FROM unnest(p.looking_for) lf
      )
    )
    AND NOT EXISTS (
      SELECT 1 FROM swipes s WHERE s.swiper_id = me.id AND s.swipee_id = p.id AND s.intent = 'date'
    )
    AND NOT EXISTS (
      SELECT 1 FROM blocks b
      WHERE (b.blocker_id = me.id AND b.blocked_id = p.id)
         OR (b.blocker_id = p.id AND b.blocked_id = me.id)
    )
  ORDER BY p.last_active_at DESC NULLS LAST, p.created_at DESC
  LIMIT limit_count;
$$;

CREATE OR REPLACE FUNCTION on_swipe_create_match() RETURNS trigger AS $$
DECLARE a uuid; b uuid;
BEGIN
  IF NEW.direction NOT IN ('like','superlike') THEN RETURN NEW; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM swipes
    WHERE swiper_id = NEW.swipee_id AND swipee_id = NEW.swiper_id
      AND direction IN ('like','superlike') AND intent = NEW.intent
  ) THEN RETURN NEW; END IF;
  a := LEAST(NEW.swiper_id, NEW.swipee_id);
  b := GREATEST(NEW.swiper_id, NEW.swipee_id);
  INSERT INTO matches (profile_a_id, profile_b_id, intent) VALUES (a, b, NEW.intent)
  ON CONFLICT (profile_a_id, profile_b_id, intent) DO NOTHING;
  RETURN NEW;
END $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_swipe_match AFTER INSERT ON swipes FOR EACH ROW EXECUTE FUNCTION on_swipe_create_match();

-- ----- 0004_storage.sql -----
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "users upload own photos" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "users read photos of visible profiles" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'profile-photos' AND EXISTS (SELECT 1 FROM profiles p WHERE p.id::text = (storage.foldername(name))[1]));

CREATE POLICY "users delete own photos" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- =============================================================
-- End of bundle. After running, you should have 9 tables, 1 view,
-- 1 storage bucket, and a deck/match trigger system in place.
-- =============================================================
