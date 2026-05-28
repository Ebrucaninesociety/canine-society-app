-- Canine Society Slice 1 — core schema
-- Tables: profiles, dogs, photos, swipes, matches, messages, reports, blocks
-- All UUIDs, all created_at, soft-delete on profiles/dogs via deleted_at column

-- Enums --------------------------------------------------------
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

-- Profiles -----------------------------------------------------
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

-- Dogs ---------------------------------------------------------
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

-- Photos -------------------------------------------------------
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

-- Swipes -------------------------------------------------------
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

-- Matches ------------------------------------------------------
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

-- Messages -----------------------------------------------------
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_messages_match_created ON messages (match_id, created_at DESC);

-- Reports ------------------------------------------------------
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

-- Blocks -------------------------------------------------------
CREATE TABLE blocks (
  blocker_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);
CREATE INDEX idx_blocks_blocked ON blocks (blocked_id);

-- Moderators allowlist ----------------------------------------
CREATE TABLE moderators (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- updated_at trigger ------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
